# NeverPay

> DeFi-powered AI platform — deposit once, use forever.

## Overview

NeverPay lets users deposit USDC, earn credits from yield (via Aave), and spend those credits on AI services — while keeping the ability to withdraw their principal at any time.

## Key Features

- **Deposit & Earn** — Stake USDC to receive AI credits (50 credits per $1, 20% platform margin)
- **Yield Farming** — Deposits flow into Aave for continuous yield generation
- **AI Image Generation** — Generate images via Gemini 2.5 Flash
- **AI Chat** — Multi-turn conversations via Gemini 2.0 Flash
- **Cross-chain Deposits** — Bridge any token from any chain to Base USDC via LI.FI
- **Full Withdrawal** — Withdraw principal anytime (credits revoked on withdrawal)
- **Real-time Dashboard** — Live view of deposits, credits, yield earned, and usage

## Architecture

```
┌──────────────────────────────────────────────────────┐
│               Frontend (Next.js App Router)           │
│  ┌────────────┐  ┌────────────┐  ┌────────────────┐  │
│  │ Wallet     │  │ Dashboard  │  │ Marketplace    │  │
│  │ (wagmi +   │  │ (Credits,  │  │ (AI platforms) │  │
│  │  Rainbow)  │  │  Yields)   │  │                │  │
│  └────────────┘  └────────────┘  └────────────────┘  │
│                                                       │
│  ┌────────────────────────────────────────────────┐   │
│  │           Next.js API Routes                   │   │
│  │  /api/generate  /api/chat  /api/credits/:addr  │   │
│  └────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────┐
│             Smart Contracts (Base Mainnet)            │
│  ┌────────────────────────────────────────────────┐   │
│  │  YieldVault.sol                                │   │
│  │  - USDC deposits → Aave aUSDC                  │   │
│  │  - Credit minting / deduction                  │   │
│  │  - Yield accrual tracking                      │   │
│  └────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
                          │
                          ▼
         Base Mainnet · Aave V3 · LI.FI Bridge
```

## Credit Formula

```
Credits = deposit_usdc × 50 × 0.8 (platform margin)

Example: $100 USDC deposit → 4,000 credits
Each image or chat message costs 1 credit
```

## Contract Addresses (Base Mainnet)

| Contract | Address |
|----------|---------|
| YieldVault | set via `NEXT_PUBLIC_YIELD_VAULT_ADDRESS` |
| USDC | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |

## Quick Start

### Prerequisites
- Node.js 18+
- MetaMask or any EVM wallet
- Base mainnet USDC

### Installation

```bash
cd frontend
npm install
cp .env.example .env.local
# Fill in GEMINI_API_KEY, NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
# NEXT_PUBLIC_YIELD_VAULT_ADDRESS, YIELD_VAULT_ADDRESS, BACKEND_PRIVATE_KEY

npm run dev
```

### Environment Variables

```env
# Client-side
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
NEXT_PUBLIC_YIELD_VAULT_ADDRESS=

# Server-side (API routes)
GEMINI_API_KEY=
YIELD_VAULT_ADDRESS=
RPC_URL=https://mainnet.base.org
BACKEND_PRIVATE_KEY=
```

### Deploy Contracts

```bash
cd contracts
npm install
npx hardhat run scripts/deploy.js --network base
```

## Project Structure

```
NeverPay/
├── contracts/          # Solidity — YieldVault with Aave integration
├── frontend/           # Next.js 16 (App Router)
│   ├── app/
│   │   ├── api/        # generate, chat, credits, health
│   │   ├── marketplace/
│   │   └── platform/   # yieldcredit-ai, gemini-chat
│   ├── components/     # Dashboard, DepositForm, BridgeDeposit, etc.
│   ├── contexts/       # DashboardContext
│   └── lib/            # config, contracts, lifi, contract helpers
└── README.md
```

## License

MIT — Built for ETHGlobal HackMoney 2026
