// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PlatformRegistry
 * @author NeverPay Team
 * @notice Registry for managing platforms in the credit marketplace
 *
 * Features:
 * 1. Platform registration and authorization
 * 2. Flexible pricing configuration per platform
 * 3. Platform metadata management
 * 4. Category-based organization
 * 5. Status management (active, paused, deprecated)
 */
contract PlatformRegistry is Ownable, ReentrancyGuard {

    // ============ Enums ============

    enum PlatformStatus {
        Pending,     // Newly registered, not yet active
        Active,      // Operational and accepting credit usage
        Paused,      // Temporarily disabled
        Deprecated   // No longer supported
    }

    enum PlatformCategory {
        AI_Assistant,    // Claude AI, ChatGPT, etc.
        Cloud_Computing, // AWS, Google Cloud, Azure
        Development,     // GitHub Copilot, Vercel, etc.
        Content_Creation,// Image generation, video editing, etc.
        Analytics,       // Data analysis tools
        Other           // Miscellaneous platforms
    }

    // ============ Structs ============

    struct PlatformInfo {
        string name;                    // Display name (e.g., "Claude AI")
        string description;             // Platform description
        address platformAddress;       // Contract/EOA that can use credits
        address owner;                  // Platform owner who can update settings
        PlatformCategory category;      // Platform category
        PlatformStatus status;          // Current status
        uint256 defaultCreditCost;      // Default credits per action
        uint256 registrationTime;      // When platform was registered
        uint256 totalCreditsUsed;       // Lifetime credits consumed
        uint256 totalActions;           // Total actions performed
        string metadataURI;             // IPFS or HTTP link to additional metadata
    }

    struct PricingTier {
        string actionType;              // e.g., "conversation", "image_generation", "api_call"
        uint256 creditCost;             // Credits required for this action
        uint256 maxDaily;               // Max actions per day (0 = unlimited)
        bool isActive;                  // Whether this pricing tier is active
    }

    // ============ State Variables ============

    // Platform management
    mapping(bytes32 => PlatformInfo) public platforms;              // platformId => PlatformInfo
    mapping(address => bytes32) public addressToPlatformId;         // address => platformId
    mapping(bytes32 => mapping(string => PricingTier)) public platformPricing; // platformId => actionType => PricingTier
    mapping(bytes32 => string[]) public platformActionTypes;        // platformId => array of action types

    // Categories
    mapping(PlatformCategory => bytes32[]) public categoryPlatforms; // category => array of platformIds
    mapping(bytes32 => bool) public platformRegistered;             // platformId => exists

    // Arrays for enumeration
    bytes32[] public allPlatformIds;

    // Global settings
    uint256 public registrationFee;                 // Fee to register new platform (in wei)
    uint256 public maxPlatforms;                     // Maximum number of platforms (0 = unlimited)
    bool public registrationOpen;                    // Whether new registrations are allowed

    // Access control
    address public authorizedVault;                  // Only this address can update platform usage

    // ============ Events ============

    event PlatformRegistered(
        bytes32 indexed platformId,
        string name,
        address indexed platformAddress,
        address indexed owner,
        PlatformCategory category
    );

    event PlatformStatusUpdated(
        bytes32 indexed platformId,
        PlatformStatus oldStatus,
        PlatformStatus newStatus
    );

    event PlatformInfoUpdated(bytes32 indexed platformId, string name, string description);

    event PricingTierAdded(
        bytes32 indexed platformId,
        string actionType,
        uint256 creditCost,
        uint256 maxDaily
    );

    event PricingTierUpdated(
        bytes32 indexed platformId,
        string actionType,
        uint256 oldCost,
        uint256 newCost,
        uint256 maxDaily
    );

    event PlatformOwnerUpdated(
        bytes32 indexed platformId,
        address indexed oldOwner,
        address indexed newOwner
    );

    event RegistrationSettingsUpdated(uint256 fee, uint256 maxPlatforms, bool open);

    event AuthorizedVaultUpdated(address indexed oldVault, address indexed newVault);

    // ============ Modifiers ============

    modifier onlyPlatformOwner(bytes32 platformId) {
        require(platforms[platformId].owner == msg.sender, "Not platform owner");
        _;
    }

    modifier onlyActivePlatform(bytes32 platformId) {
        require(platforms[platformId].status == PlatformStatus.Active, "Platform not active");
        _;
    }

    modifier platformExists(bytes32 platformId) {
        require(platformRegistered[platformId], "Platform does not exist");
        _;
    }

    modifier onlyAuthorizedVault() {
        require(msg.sender == authorizedVault, "Not authorized vault");
        _;
    }

    // ============ Constructor ============

    constructor() Ownable(msg.sender) {
        registrationOpen = true;
        maxPlatforms = 0; // Unlimited by default
        registrationFee = 0; // Free registration by default
    }

    // ============ Platform Registration ============

    /**
     * @notice Register a new platform
     * @param platformId Unique identifier for the platform
     * @param name Display name
     * @param description Platform description
     * @param platformAddress Address that will use credits
     * @param category Platform category
     * @param defaultCreditCost Default cost per action
     * @param metadataURI Link to additional metadata
     */
    function registerPlatform(
        bytes32 platformId,
        string calldata name,
        string calldata description,
        address platformAddress,
        PlatformCategory category,
        uint256 defaultCreditCost,
        string calldata metadataURI
    ) external payable nonReentrant {
        require(registrationOpen, "Registration closed");
        require(msg.value >= registrationFee, "Insufficient registration fee");
        require(!platformRegistered[platformId], "Platform already exists");
        require(platformAddress != address(0), "Invalid platform address");
        require(bytes(name).length > 0, "Name required");
        require(maxPlatforms == 0 || allPlatformIds.length < maxPlatforms, "Max platforms reached");

        // Create platform info
        platforms[platformId] = PlatformInfo({
            name: name,
            description: description,
            platformAddress: platformAddress,
            owner: msg.sender,
            category: category,
            status: PlatformStatus.Pending, // Admin must activate
            defaultCreditCost: defaultCreditCost,
            registrationTime: block.timestamp,
            totalCreditsUsed: 0,
            totalActions: 0,
            metadataURI: metadataURI
        });

        // Update mappings and arrays
        platformRegistered[platformId] = true;
        addressToPlatformId[platformAddress] = platformId;
        allPlatformIds.push(platformId);
        categoryPlatforms[category].push(platformId);

        emit PlatformRegistered(platformId, name, platformAddress, msg.sender, category);
    }

    // ============ Platform Management ============

    /**
     * @notice Update platform status (admin only)
     */
    function updatePlatformStatus(bytes32 platformId, PlatformStatus newStatus)
        external
        onlyOwner
        platformExists(platformId)
    {
        PlatformStatus oldStatus = platforms[platformId].status;
        platforms[platformId].status = newStatus;
        emit PlatformStatusUpdated(platformId, oldStatus, newStatus);
    }

    /**
     * @notice Update platform information (platform owner only)
     */
    function updatePlatformInfo(
        bytes32 platformId,
        string calldata name,
        string calldata description,
        string calldata metadataURI
    ) external onlyPlatformOwner(platformId) {
        require(bytes(name).length > 0, "Name required");

        PlatformInfo storage platform = platforms[platformId];
        platform.name = name;
        platform.description = description;
        platform.metadataURI = metadataURI;

        emit PlatformInfoUpdated(platformId, name, description);
    }

    /**
     * @notice Transfer platform ownership
     */
    function transferPlatformOwnership(bytes32 platformId, address newOwner)
        external
        onlyPlatformOwner(platformId)
    {
        require(newOwner != address(0), "Invalid new owner");

        address oldOwner = platforms[platformId].owner;
        platforms[platformId].owner = newOwner;

        emit PlatformOwnerUpdated(platformId, oldOwner, newOwner);
    }

    // ============ Pricing Management ============

    /**
     * @notice Add or update pricing tier for a platform
     */
    function setPricingTier(
        bytes32 platformId,
        string calldata actionType,
        uint256 creditCost,
        uint256 maxDaily
    ) external onlyPlatformOwner(platformId) {
        require(bytes(actionType).length > 0, "Action type required");

        bool isNewAction = !platformPricing[platformId][actionType].isActive;
        uint256 oldCost = platformPricing[platformId][actionType].creditCost;

        platformPricing[platformId][actionType] = PricingTier({
            actionType: actionType,
            creditCost: creditCost,
            maxDaily: maxDaily,
            isActive: true
        });

        // Add to action types array if new
        if (isNewAction) {
            platformActionTypes[platformId].push(actionType);
            emit PricingTierAdded(platformId, actionType, creditCost, maxDaily);
        } else {
            emit PricingTierUpdated(platformId, actionType, oldCost, creditCost, maxDaily);
        }
    }

    /**
     * @notice Disable a pricing tier
     */
    function disablePricingTier(bytes32 platformId, string calldata actionType)
        external
        onlyPlatformOwner(platformId)
    {
        platformPricing[platformId][actionType].isActive = false;
    }

    // ============ Credit System Integration ============

    /**
     * @notice Check if platform is authorized to use credits
     */
    function isPlatformAuthorized(address platformAddress) external view returns (bool) {
        bytes32 platformId = addressToPlatformId[platformAddress];
        return platformRegistered[platformId] &&
               platforms[platformId].status == PlatformStatus.Active;
    }

    /**
     * @notice Get platform info for credit system
     */
    function getPlatformInfo(address platformAddress) external view returns (
        string memory name,
        uint256 defaultCreditCost
    ) {
        bytes32 platformId = addressToPlatformId[platformAddress];
        require(platformRegistered[platformId], "Platform not found");

        PlatformInfo storage platform = platforms[platformId];
        return (platform.name, platform.defaultCreditCost);
    }

    /**
     * @notice Get credit cost for specific action
     */
    function getActionCreditCost(address platformAddress, string calldata actionType)
        external
        view
        returns (uint256)
    {
        bytes32 platformId = addressToPlatformId[platformAddress];
        require(platformRegistered[platformId], "Platform not found");

        PricingTier storage pricing = platformPricing[platformId][actionType];
        if (pricing.isActive) {
            return pricing.creditCost;
        } else {
            return platforms[platformId].defaultCreditCost;
        }
    }

    /**
     * @notice Update platform usage stats (called by credit vault only)
     */
    function updatePlatformUsage(
        address platformAddress,
        uint256 creditsUsed,
        uint256 actionsPerformed
    ) external onlyAuthorizedVault {
        bytes32 platformId = addressToPlatformId[platformAddress];
        require(platformRegistered[platformId], "Platform not found");
        require(platforms[platformId].status == PlatformStatus.Active, "Platform not active");

        platforms[platformId].totalCreditsUsed += creditsUsed;
        platforms[platformId].totalActions += actionsPerformed;
    }

    // ============ View Functions ============

    /**
     * @notice Get complete platform information
     */
    function getPlatformById(bytes32 platformId) external view returns (PlatformInfo memory) {
        require(platformRegistered[platformId], "Platform not found");
        return platforms[platformId];
    }

    /**
     * @notice Get all platforms in a category
     */
    function getPlatformsByCategory(PlatformCategory category) external view returns (bytes32[] memory) {
        return categoryPlatforms[category];
    }

    /**
     * @notice Get all active platforms
     */
    function getActivePlatforms() external view returns (bytes32[] memory) {
        uint256 activeCount = 0;

        // Count active platforms
        for (uint256 i = 0; i < allPlatformIds.length; i++) {
            if (platforms[allPlatformIds[i]].status == PlatformStatus.Active) {
                activeCount++;
            }
        }

        // Create array of active platforms
        bytes32[] memory activePlatforms = new bytes32[](activeCount);
        uint256 index = 0;

        for (uint256 i = 0; i < allPlatformIds.length; i++) {
            if (platforms[allPlatformIds[i]].status == PlatformStatus.Active) {
                activePlatforms[index] = allPlatformIds[i];
                index++;
            }
        }

        return activePlatforms;
    }

    /**
     * @notice Get platform action types and pricing
     */
    function getPlatformPricing(bytes32 platformId)
        external
        view
        returns (string[] memory actionTypes, uint256[] memory costs, uint256[] memory dailyLimits)
    {
        require(platformRegistered[platformId], "Platform not found");

        string[] memory actions = platformActionTypes[platformId];
        actionTypes = new string[](actions.length);
        costs = new uint256[](actions.length);
        dailyLimits = new uint256[](actions.length);

        for (uint256 i = 0; i < actions.length; i++) {
            PricingTier storage tier = platformPricing[platformId][actions[i]];
            if (tier.isActive) {
                actionTypes[i] = tier.actionType;
                costs[i] = tier.creditCost;
                dailyLimits[i] = tier.maxDaily;
            }
        }
    }

    /**
     * @notice Get total number of platforms
     */
    function getTotalPlatforms() external view returns (uint256) {
        return allPlatformIds.length;
    }

    /**
     * @notice Get all platform IDs
     */
    function getAllPlatformIds() external view returns (bytes32[] memory) {
        return allPlatformIds;
    }

    // ============ Admin Functions ============

    /**
     * @notice Update registration settings
     */
    function updateRegistrationSettings(
        uint256 _registrationFee,
        uint256 _maxPlatforms,
        bool _registrationOpen
    ) external onlyOwner {
        registrationFee = _registrationFee;
        maxPlatforms = _maxPlatforms;
        registrationOpen = _registrationOpen;

        emit RegistrationSettingsUpdated(_registrationFee, _maxPlatforms, _registrationOpen);
    }

    /**
     * @notice Set the authorized vault address (admin only)
     */
    function setAuthorizedVault(address _vault) external onlyOwner {
        require(_vault != address(0), "Invalid vault address");

        address oldVault = authorizedVault;
        authorizedVault = _vault;

        emit AuthorizedVaultUpdated(oldVault, _vault);
    }

    /**
     * @notice Withdraw registration fees
     */
    function withdrawFees(address to) external onlyOwner {
        require(to != address(0), "Invalid address");
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");

        (bool success, ) = to.call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @notice Create platform ID from string
     */
    function createPlatformId(string calldata identifier) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(identifier));
    }
}