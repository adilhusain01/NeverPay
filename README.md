# NeverPay 🎨💰

> DeFi-powered AI Image Generation Platform - HackMoney 2026

## 🌟 Overview

NeverPay revolutionizes access to services by combining DeFi yield farming with credits. Users deposit stablecoins, earn credits through yield optimization, and spend them on platforms while retaining the ability to withdraw their original deposit at any time.

## 🔑 Key Features

- **Deposit & Earn**: Stake USDC to receive AI credits calculated via yield-optimized algorithms
- **Yield Farming**: Deposits are automatically allocated to DeFi protocols (Aave) for yield generation
- **Service Usability**: Generate images using Google's Gemini API with earned credits
- **Full Withdrawal**: Withdraw your entire principal anytime (credits are revoked)
- **Transparent Dashboard**: Real-time view of deposits, credits, yields, and usage

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                       │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│   │ Wallet Auth  │  │  Dashboard   │  │  Image Generation    │  │
│   │  (wagmi)     │  │  (Credits,   │  │  (Prompt → Image)    │  │
│   │              │  │   Yields)    │  │                      │  │
│   └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend (Node.js/Express)                   │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│   │ Credit Mgmt  │  │ Gemini API   │  │  Yield Calculator    │  │
│   │              │  │  Integration │  │                      │  │
│   └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Smart Contracts (Solidity)                    │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│   │ YieldVault   │  │ CreditManager│  │  Aave Integration    │  │
│   │ (Deposits)   │  │ (Credits)    │  │  (Yield Farming)     │  │
│   └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              Ethereum Sepolia Testnet / Circle USDC              │
└─────────────────────────────────────────────────────────────────┘
```

## 💰 Credit Algorithm

```
Base Credits = Deposit Amount / API Cost Per Generation
Yield Bonus = (APY * Deposit * Time Factor) / API Cost
Total Credits = Base Credits + Yield Bonus
Platform Margin = 20% (ensures profitability)

Example: 100 USDC deposit @ 5% APY
- Base Credits: 100 / 0.02 = 5,000 images
- Monthly Yield Bonus: (0.05 * 100 * 1/12) / 0.02 ≈ 21 images
- Net Credits (after margin): ~4,000 images
```

## 🎯 Hackathon Targets

- **Circle Prize ($10k)**: USDC integration for deposits/withdrawals
- **Sui Prize ($10k)**: Cross-chain compatibility potential
- **Yellow Prize ($15k)**: State channel optimization for microtransactions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MetaMask wallet
- Sepolia testnet ETH (from faucet)

### Installation

```bash
# Install dependencies
cd contracts && npm install
cd ../backend && npm install
cd ../frontend && npm install

# Setup environment
cp .env.example .env
# Add your GEMINI_API_KEY, PRIVATE_KEY, etc.

# Deploy contracts (Sepolia)
cd contracts && npx hardhat run scripts/deploy.js --network sepolia

# Start backend
cd ../backend && npm run dev

# Start frontend
cd ../frontend && npm run dev
```

## 📁 Project Structure

```
yieldcredit-ai/
├── contracts/           # Solidity smart contracts
│   ├── YieldVault.sol   # Main deposit/withdrawal logic
│   ├── CreditManager.sol# Credit calculation & tracking
│   └── mocks/           # Test tokens for development
├── frontend/            # Next.js frontend
│   ├── components/      # React components
│   ├── hooks/           # Custom hooks (wallet, contracts)
│   └── pages/           # App pages
├── backend/             # Express.js API server
│   ├── routes/          # API endpoints
│   ├── services/        # Gemini, yield calculation
│   └── middleware/      # Auth, rate limiting
└── README.md
```

## 🔐 Security Considerations

- Deposits held in audited Aave protocol
- Rate limiting on image generation
- Withdrawal delays for large amounts
- 10% reserve fund for volatility protection

## 📄 License

MIT License - Built for HackMoney 2026

## 👥 Team

Built with ❤️ for ETHGlobal HackMoney 2026
