// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title IAavePool
 * @notice Interface for Aave V3 Pool
 */
interface IAavePool {
    function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external;
    function withdraw(address asset, uint256 amount, address to) external returns (uint256);
}

/**
 * @title IPlatformRegistry
 * @notice Interface for platform registry
 */
interface IPlatformRegistry {
    function isPlatformAuthorized(address platform) external view returns (bool);
    function getPlatformInfo(address platform) external view returns (string memory name, uint256 defaultCreditCost);
    function updatePlatformUsage(address platformAddress, uint256 creditsUsed, uint256 actionsPerformed) external;
}

/**
 * @title YieldVault
 * @author NeverPay Team
 * @notice Generalized vault for multi-platform credit marketplace
 *
 * Core Features:
 * 1. Platform-agnostic credit system
 * 2. Aave yield farming integration
 * 3. Flexible credit pricing per platform
 * 4. Usage tracking across all platforms
 * 5. Pro-rata yield distribution
 */
contract YieldVault is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============ State Variables ============

    IERC20 public immutable usdc;
    IERC20 public immutable aUsdc;
    IAavePool public immutable aavePool;
    IPlatformRegistry public platformRegistry;

    // Core configuration
    uint256 public constant PLATFORM_FEE = 10;           // 10% of yield
    uint256 public constant CREDITS_PER_DOLLAR = 10;     // Base: 10 credits per $1
    uint256 public constant MIN_DEPOSIT = 1e6;           // 1 USDC (6 decimals)
    uint256 private constant VIRTUAL_SHARES = 1e3;       // Virtual shares to prevent donation attacks
    uint256 private constant VIRTUAL_ASSETS = 1e3;       // Virtual assets to prevent donation attacks

    // Share-based accounting (ERC4626 style)
    uint256 public totalShares;                    // Total shares issued
    mapping(address => uint256) public shares;     // User's shares in the vault

    // User data structure (simplified)
    struct UserInfo {
        uint256 principalDeposited;    // Principal amount deposited by user
        uint256 depositTimestamp;      // When user first deposited
        uint256 totalCreditsUsed;      // Total credits consumed across all platforms
        uint256 lastCreditUpdate;      // Last activity timestamp
    }

    mapping(address => UserInfo) public users;

    // Platform usage tracking
    struct PlatformUsage {
        uint256 totalCreditsUsed;      // Credits consumed on this platform
        uint256 totalActions;          // Number of actions taken
        uint256 totalUsers;            // Unique users who used this platform
        mapping(address => uint256) userCreditsUsed;  // Credits used per user
    }

    mapping(address => PlatformUsage) public platformUsage;
    mapping(address => mapping(address => bool)) public hasUserUsedPlatform; // user => platform => used

    // Global stats
    uint256 public totalPrincipal;        // Total principal deposited across all users
    uint256 public totalCreditsIssued;    // Total base credits ever issued
    uint256 public totalCreditsUsed;      // Total credits consumed across all platforms
    uint256 public platformYieldAccrued;  // Platform's accumulated yield
    uint256 public totalUniquePlatforms;  // Number of platforms that have been used

    // Credit usage limits and security
    uint256 public constant MAX_CREDITS_PER_CALL = 10000;  // Max credits per useCredits call
    mapping(address => uint256) public dailyCreditsUsed;   // Per-user daily usage
    mapping(address => uint256) public lastUsageDay;       // Track usage day
    uint256 public constant DAILY_CREDIT_LIMIT = 1000;     // Max credits per user per day

    // Emergency controls
    bool public depositsPaused;
    bool public withdrawalsPaused;
    bool public creditUsagePaused;

    // ============ Events ============

    event Deposited(address indexed user, uint256 usdcAmount, uint256 creditsGranted);
    event Withdrawn(address indexed user, uint256 usdcReturned, uint256 yieldEarned);
    event CreditsUsed(
        address indexed user,
        address indexed platform,
        uint256 creditsAmount,
        string action,
        bytes32 indexed actionId
    );
    event YieldHarvested(address indexed user, uint256 yieldAmount);
    event PlatformRegistryUpdated(address indexed oldRegistry, address indexed newRegistry);
    event PauseStatusUpdated(bool depositsPaused, bool withdrawalsPaused, bool creditUsagePaused);

    // ============ Constructor ============

    constructor(
        address _usdc,
        address _aUsdc,
        address _aavePool,
        address _platformRegistry
    ) Ownable(msg.sender) {
        require(_usdc != address(0), "Invalid USDC");
        require(_aUsdc != address(0), "Invalid aUSDC");
        require(_aavePool != address(0), "Invalid Pool");
        require(_platformRegistry != address(0), "Invalid Registry");

        usdc = IERC20(_usdc);
        aUsdc = IERC20(_aUsdc);
        aavePool = IAavePool(_aavePool);
        platformRegistry = IPlatformRegistry(_platformRegistry);

        usdc.approve(_aavePool, type(uint256).max);
    }

    // ============ User Functions ============

    /**
     * @notice Deposit USDC into Aave and receive universal credits
     * @param amount Amount of USDC (6 decimals)
     */
    function deposit(uint256 amount) external nonReentrant {
        require(!depositsPaused, "Deposits paused");
        require(amount >= MIN_DEPOSIT, "Below minimum");

        // Calculate shares to mint using ERC4626 style with virtual assets protection
        uint256 sharesToMint;
        uint256 totalAssets = aUsdc.balanceOf(address(this));

        if (totalShares == 0) {
            // Initial deposit: mint shares minus virtual offset
            sharesToMint = amount + VIRTUAL_SHARES;
        } else {
            // Use virtual assets to prevent donation attacks
            sharesToMint = amount * (totalShares + VIRTUAL_SHARES) / (totalAssets + VIRTUAL_ASSETS);
        }

        // No slippage protection in basic function

        // Transfer USDC and supply to Aave
        usdc.safeTransferFrom(msg.sender, address(this), amount);
        aavePool.supply(address(usdc), amount, address(this), 0);

        // Mint shares
        shares[msg.sender] += sharesToMint;
        totalShares += sharesToMint;

        // Update global tracking
        totalPrincipal += amount;

        // Update user data
        UserInfo storage user = users[msg.sender];
        user.principalDeposited += amount; // Keep for credit calculations

        if (user.depositTimestamp == 0) {
            user.depositTimestamp = block.timestamp;
        }
        user.lastCreditUpdate = block.timestamp;

        // Grant base credits (from principal only)
        uint256 creditsGranted = (amount * CREDITS_PER_DOLLAR) / 1e6;
        totalCreditsIssued += creditsGranted;

        emit Deposited(msg.sender, amount, creditsGranted);
    }

    /**
     * @notice Deposit USDC with slippage protection
     * @param amount Amount of USDC (6 decimals)
     * @param minSharesOut Minimum shares to receive
     */
    function depositWithSlippage(uint256 amount, uint256 minSharesOut) external nonReentrant {
        require(!depositsPaused, "Deposits paused");
        require(amount >= MIN_DEPOSIT, "Below minimum");

        // Calculate shares to mint using ERC4626 style with virtual assets protection
        uint256 sharesToMint;
        uint256 totalAssets = aUsdc.balanceOf(address(this));

        if (totalShares == 0) {
            // Initial deposit: mint shares minus virtual offset
            sharesToMint = amount + VIRTUAL_SHARES;
        } else {
            // Use virtual assets to prevent donation attacks
            sharesToMint = amount * (totalShares + VIRTUAL_SHARES) / (totalAssets + VIRTUAL_ASSETS);
        }

        // Slippage protection
        require(sharesToMint >= minSharesOut, "Insufficient shares out");

        // Transfer USDC and supply to Aave
        usdc.safeTransferFrom(msg.sender, address(this), amount);
        aavePool.supply(address(usdc), amount, address(this), 0);

        // Mint shares
        shares[msg.sender] += sharesToMint;
        totalShares += sharesToMint;

        // Update global tracking
        totalPrincipal += amount;

        // Update user data
        UserInfo storage user = users[msg.sender];
        user.principalDeposited += amount; // Keep for credit calculations

        if (user.depositTimestamp == 0) {
            user.depositTimestamp = block.timestamp;
        }
        user.lastCreditUpdate = block.timestamp;

        // Grant base credits (from principal only)
        uint256 creditsGranted = (amount * CREDITS_PER_DOLLAR) / 1e6;
        totalCreditsIssued += creditsGranted;

        emit Deposited(msg.sender, amount, creditsGranted);
    }

    /**
     * @notice Preview shares received for a deposit
     * @param amount Amount of USDC to deposit
     */
    function previewDeposit(uint256 amount) external view returns (uint256) {
        if (totalShares == 0) {
            return amount + VIRTUAL_SHARES;
        } else {
            uint256 totalAssets = aUsdc.balanceOf(address(this));
            return amount * (totalShares + VIRTUAL_SHARES) / (totalAssets + VIRTUAL_ASSETS);
        }
    }

    /**
     * @notice Withdraw full position (principal + net yield)
     */
    function withdraw() external nonReentrant {
        require(!withdrawalsPaused, "Withdrawals paused");

        uint256 userShares = shares[msg.sender];
        require(userShares > 0, "No shares");

        UserInfo storage user = users[msg.sender];
        uint256 principal = user.principalDeposited;

        // Calculate user's share of total vault assets using virtual assets
        uint256 totalAssets = aUsdc.balanceOf(address(this));
        uint256 currentValue = userShares * (totalAssets + VIRTUAL_ASSETS) / (totalShares + VIRTUAL_SHARES);

        uint256 grossYield = currentValue > principal ? currentValue - principal : 0;

        // Platform takes fee from yield only
        uint256 platformCut = (grossYield * PLATFORM_FEE) / 100;
        uint256 netYield = grossYield - platformCut;

        // Credit settlement: Check if user owes credits
        uint256 totalPotentialCredits = (currentValue * CREDITS_PER_DOLLAR) / 1e6;
        uint256 creditsUsed = user.totalCreditsUsed;
        uint256 netToUser;

        if (totalPotentialCredits >= creditsUsed) {
            // User has positive credit balance - gets principal + net yield
            netToUser = principal + netYield;
        } else {
            // User owes credits - deduct credit debt from available funds
            uint256 creditDebt = creditsUsed - totalPotentialCredits;
            uint256 debtValue = (creditDebt * 1e6) / CREDITS_PER_DOLLAR;
            uint256 availableFunds = principal + netYield;

            if (debtValue >= availableFunds) {
                netToUser = 0; // User loses everything if debt exceeds value
                platformCut += availableFunds; // Platform gets the forfeited amount
            } else {
                netToUser = availableFunds - debtValue;
                platformCut += debtValue; // Platform gets credit debt as revenue
            }
        }

        uint256 assetsToReturn = currentValue;

        // Withdraw full amount from Aave
        uint256 actualWithdrawn = aavePool.withdraw(
            address(usdc),
            assetsToReturn,
            address(this)
        );

        require(actualWithdrawn >= assetsToReturn, "Withdrawal shortfall");

        // Update global state
        platformYieldAccrued += platformCut;

        // Decrease total principal by user's original deposit
        totalPrincipal -= principal;

        // Burn user's shares
        shares[msg.sender] = 0;
        totalShares -= userShares;

        // Reset user (they lose all credits)
        delete users[msg.sender];

        // Transfer to user
        usdc.safeTransfer(msg.sender, netToUser);

        emit Withdrawn(msg.sender, netToUser, grossYield - platformCut);
    }

    // ============ Platform Credit Functions ============

    /**
     * @notice Use credits on behalf of a user (called by authorized platforms)
     * @param user The user whose credits to deduct
     * @param amount Amount of credits to use
     * @param action Description of the action (e.g., "image_generation", "api_call")
     * @param actionId Unique identifier for this action
     */
    function useCredits(
        address user,
        uint256 amount,
        string calldata action,
        bytes32 actionId
    ) external {
        require(!creditUsagePaused, "Credit usage paused");
        require(platformRegistry.isPlatformAuthorized(msg.sender), "Platform not authorized");
        require(amount <= MAX_CREDITS_PER_CALL, "Exceeds max per call");

        // Check daily limit
        uint256 currentDay = block.timestamp / 86400;
        if (lastUsageDay[user] != currentDay) {
            dailyCreditsUsed[user] = 0;
            lastUsageDay[user] = currentDay;
        }
        require(dailyCreditsUsed[user] + amount <= DAILY_CREDIT_LIMIT, "Daily limit exceeded");

        uint256 available = _calculateAvailableCredits(user);
        require(available >= amount, "Insufficient credits");

        // Update daily usage
        dailyCreditsUsed[user] += amount;

        // Update user's credit usage
        UserInfo storage userInfo = users[user];
        userInfo.totalCreditsUsed += amount;
        userInfo.lastCreditUpdate = block.timestamp;

        // Update platform usage stats
        PlatformUsage storage usage = platformUsage[msg.sender];

        // Track if this is user's first time using this platform
        if (!hasUserUsedPlatform[user][msg.sender]) {
            hasUserUsedPlatform[user][msg.sender] = true;
            usage.totalUsers += 1;

            // If this is the first usage of this platform ever, increment unique platforms
            if (usage.totalActions == 0) {
                totalUniquePlatforms += 1;
            }
        }

        usage.totalCreditsUsed += amount;
        usage.totalActions += 1;
        usage.userCreditsUsed[user] += amount;

        // Update global stats
        totalCreditsUsed += amount;

        // Update platform registry stats
        try platformRegistry.updatePlatformUsage(msg.sender, amount, 1) {
            // Successfully updated platform registry
        } catch {
            // Registry update failed - continue execution but log event
        }

        emit CreditsUsed(user, msg.sender, amount, action, actionId);
    }

    // ============ View Functions ============

    /**
     * @notice Get available credits for a user
     */
    function getAvailableCredits(address user) external view returns (uint256) {
        return _calculateAvailableCredits(user);
    }

    /**
     * @notice Get comprehensive user dashboard data
     */
    function getUserDashboard(address user) external view returns (
        uint256 depositAmount,
        uint256 depositTimestamp,
        uint256 baseCredits,
        uint256 yieldCredits,
        uint256 availableCredits,
        uint256 userCreditsUsed,
        uint256 currentValue,
        uint256 yieldEarned
    ) {
        UserInfo storage info = users[user];

        depositAmount = info.principalDeposited;
        depositTimestamp = info.depositTimestamp;
        userCreditsUsed = info.totalCreditsUsed;

        // Base credits from principal
        baseCredits = (depositAmount * CREDITS_PER_DOLLAR) / 1e6;

        // Calculate current value and yield based on shares
        uint256 userShares = shares[user];
        if (userShares > 0 && totalShares > 0) {
            uint256 totalAssets = aUsdc.balanceOf(address(this));
            currentValue = userShares * (totalAssets + VIRTUAL_ASSETS) / (totalShares + VIRTUAL_SHARES);
            uint256 grossYield = currentValue > depositAmount ? currentValue - depositAmount : 0;
            yieldEarned = (grossYield * (100 - PLATFORM_FEE)) / 100;
            yieldCredits = (yieldEarned * CREDITS_PER_DOLLAR) / 1e6;
        } else {
            currentValue = depositAmount;
            yieldEarned = 0;
            yieldCredits = 0;
        }

        // Available credits
        availableCredits = _calculateAvailableCredits(user);
    }

    /**
     * @notice Get platform statistics
     */
    function getPlatformStats() external view returns (
        uint256 _totalPrincipal,
        uint256 _totalATokenBalance,
        uint256 _totalValue,
        uint256 _totalYieldGenerated,
        uint256 _platformYield,
        uint256 _totalCreditsIssued,
        uint256 _totalCreditsUsed,
        uint256 _totalUniquePlatforms
    ) {
        _totalPrincipal = totalPrincipal;
        _totalATokenBalance = aUsdc.balanceOf(address(this));
        _totalValue = _totalATokenBalance;
        _totalYieldGenerated = _totalValue > totalPrincipal ? _totalValue - totalPrincipal : 0;
        _platformYield = platformYieldAccrued;
        _totalCreditsIssued = totalCreditsIssued;
        _totalCreditsUsed = totalCreditsUsed;
        _totalUniquePlatforms = totalUniquePlatforms;
    }

    /**
     * @notice Get usage statistics for a specific platform
     */
    function getPlatformUsage(address platform) external view returns (
        uint256 platformCreditsUsed,
        uint256 totalActions,
        uint256 totalUsers
    ) {
        PlatformUsage storage usage = platformUsage[platform];
        return (usage.totalCreditsUsed, usage.totalActions, usage.totalUsers);
    }

    /**
     * @notice Get user's usage on a specific platform
     */
    function getUserPlatformUsage(address user, address platform) external view returns (uint256) {
        return platformUsage[platform].userCreditsUsed[user];
    }

    // ============ Internal Functions ============

    /**
     * @notice Calculate available credits for user (base + yield bonus - used)
     */
    function _calculateAvailableCredits(address user) internal view returns (uint256) {
        uint256 userShares = shares[user];
        if (userShares == 0) return 0;

        UserInfo storage info = users[user];

        // Base credits from principal deposited
        uint256 baseCredits = (info.principalDeposited * CREDITS_PER_DOLLAR) / 1e6;

        // Yield bonus credits based on current share value
        uint256 yieldCredits = 0;
        if (totalShares > 0) {
            uint256 totalAssets = aUsdc.balanceOf(address(this));
            uint256 currentValue = userShares * (totalAssets + VIRTUAL_ASSETS) / (totalShares + VIRTUAL_SHARES);
            uint256 grossYield = currentValue > info.principalDeposited ? currentValue - info.principalDeposited : 0;
            uint256 netYield = (grossYield * (100 - PLATFORM_FEE)) / 100;
            yieldCredits = (netYield * CREDITS_PER_DOLLAR) / 1e6;
        }

        uint256 totalCredits = baseCredits + yieldCredits;
        return totalCredits > info.totalCreditsUsed ? totalCredits - info.totalCreditsUsed : 0;
    }


    // ============ Admin Functions ============

    /**
     * @notice Update platform registry address
     */
    function setPlatformRegistry(address _platformRegistry) external onlyOwner {
        require(_platformRegistry != address(0), "Invalid registry");
        address old = address(platformRegistry);
        platformRegistry = IPlatformRegistry(_platformRegistry);
        emit PlatformRegistryUpdated(old, _platformRegistry);
    }

    /**
     * @notice Harvest platform's share of ongoing yield (before withdrawals)
     */
    function harvestPlatformFee() external onlyOwner {
        uint256 totalAssets = aUsdc.balanceOf(address(this));
        if (totalAssets <= totalPrincipal) return; // No yield to harvest

        uint256 totalYield = totalAssets - totalPrincipal;
        uint256 platformShare = (totalYield * PLATFORM_FEE) / 100;

        // Withdraw platform's share from Aave
        uint256 actualWithdrawn = aavePool.withdraw(
            address(usdc),
            platformShare,
            address(this)
        );

        require(actualWithdrawn >= platformShare, "Harvest shortfall");

        platformYieldAccrued += actualWithdrawn;

        emit YieldHarvested(address(this), actualWithdrawn);
    }

    /**
     * @notice Withdraw platform's accumulated yield
     */
    function withdrawPlatformYield(address to) external onlyOwner {
        require(platformYieldAccrued > 0, "No yield");
        uint256 amount = platformYieldAccrued;
        platformYieldAccrued = 0;
        usdc.safeTransfer(to, amount);
    }

    /**
     * @notice Pause/unpause contract functions
     */
    function setPaused(bool _depositsPaused, bool _withdrawalsPaused, bool _creditUsagePaused) external onlyOwner {
        depositsPaused = _depositsPaused;
        withdrawalsPaused = _withdrawalsPaused;
        creditUsagePaused = _creditUsagePaused;

        emit PauseStatusUpdated(_depositsPaused, _withdrawalsPaused, _creditUsagePaused);
    }

    /**
     * @notice Emergency withdrawal of all funds
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 aTokenBalance = aUsdc.balanceOf(address(this));
        if (aTokenBalance > 0) {
            aavePool.withdraw(address(usdc), aTokenBalance, owner());
        }

        uint256 usdcBalance = usdc.balanceOf(address(this));
        if (usdcBalance > 0) {
            usdc.safeTransfer(owner(), usdcBalance);
        }
    }
}