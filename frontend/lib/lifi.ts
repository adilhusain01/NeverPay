'use client';

import { createConfig, EVM } from '@lifi/sdk';
import { getWalletClient, switchChain } from '@wagmi/core';
import { config as wagmiConfig } from './config';

createConfig({
  integrator: 'NeverPay',
  providers: [
    EVM({
      getWalletClient: (chainId) =>
        getWalletClient(wagmiConfig, chainId ? { chainId: chainId as unknown as 1 } : undefined),
      switchChain: async (chainId) => {
        const chain = await switchChain(wagmiConfig, { chainId: chainId as unknown as 1 });
        return getWalletClient(wagmiConfig, { chainId: chain.id as unknown as 1 });
      },
    }),
  ],
});
