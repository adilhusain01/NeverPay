'use client';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { baseSepolia, mainnet, polygon, arbitrum, optimism, bsc } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'NeverPay',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id',
  chains: [baseSepolia, mainnet, polygon, arbitrum, optimism, bsc],
  transports: {
    [baseSepolia.id]: http('https://sepolia.base.org'),
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [bsc.id]: http(),
  },
  ssr: true,
});

export const CONTRACT_ADDRESSES = {
  baseSepolia: {
    yieldVault: process.env.NEXT_PUBLIC_YIELD_VAULT_ADDRESS || '0x0000000000000000000000000000000000000000',
    platformRegistry: '0x07fCEb495F07da17a5C5748dfCD89d006048a014',
    usdc: '0xba50Cd2A20f6DA35D788639E581bca8d0B5d4D5f',
    aUsdc: '0x0000000000000000000000000000000000000000',
    aavePool: '0x0000000000000000000000000000000000000000',
  },
};
