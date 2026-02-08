'use client';

import { createConfig, EVM } from '@lifi/sdk';
import { getWalletClient, switchChain } from '@wagmi/core';
import { config as wagmiConfig } from './config';

createConfig({
  integrator: 'NeverPay',
  providers: [
    EVM({
      getWalletClient: () => getWalletClient(wagmiConfig),
      switchChain: async (chainId) => {
        const chain = await switchChain(wagmiConfig, { chainId: chainId as unknown as 1 });
        return getWalletClient(wagmiConfig, { chainId: chain.id });
      },
    }),
  ],
});
