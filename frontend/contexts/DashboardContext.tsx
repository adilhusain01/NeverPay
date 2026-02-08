'use client';

import { createContext, useContext, useCallback } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { YIELD_VAULT_ABI } from '@/lib/contracts';
import { CONTRACT_ADDRESSES } from '@/lib/config';

interface DashboardContextType {
  dashboardData: readonly [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint] | undefined;
  isLoading: boolean;
  refetchDashboard: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const { address } = useAccount();

  const contractAddress = CONTRACT_ADDRESSES.baseSepolia.yieldVault;

  // Poll every 5 seconds for more responsive UI updates
  const { data: dashboardData, isLoading, refetch } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: YIELD_VAULT_ABI,
    functionName: 'getUserDashboard',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address && contractAddress !== '0x0000000000000000000000000000000000000000',
      refetchInterval: 5000,
    },
  });

  const refetchDashboard = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <DashboardContext.Provider value={{ 
      dashboardData: dashboardData as readonly [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint] | undefined, 
      isLoading, 
      refetchDashboard 
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
