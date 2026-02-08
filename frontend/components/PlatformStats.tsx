'use client';

import { useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { YIELD_VAULT_ABI } from '@/lib/contracts';
import { CONTRACT_ADDRESSES } from '@/lib/config';

export default function PlatformStats() {
  const yieldVaultAddress = CONTRACT_ADDRESSES.baseSepolia.yieldVault;

  const { data: stats } = useReadContract({
    address: yieldVaultAddress as `0x${string}`,
    abi: YIELD_VAULT_ABI,
    functionName: 'getPlatformStats',
    query: {
      enabled: yieldVaultAddress !== '0x0000000000000000000000000000000000000000',
      refetchInterval: 30000,
    },
  });

  const [
    totalPrincipal = BigInt(0),
    totalATokenBalance = BigInt(0),
    totalValue = BigInt(0),
    totalYieldGenerated = BigInt(0),
    platformYield = BigInt(0),
    totalCreditsIssued = BigInt(0),
    totalCreditsUsed = BigInt(0),
    totalUniquePlatforms = BigInt(0),
  ] = stats || [];

  // Calculate APY based on yield vs principal (simplified)
  const currentAPY = totalPrincipal > BigInt(0) 
    ? Number(totalYieldGenerated * BigInt(10000) / totalPrincipal) / 100 
    : 0;

  if (yieldVaultAddress === '0x0000000000000000000000000000000000000000') {
    return null;
  }

  return (
    <div className="card-gradient rounded-2xl p-6 border border-gray-800">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <span>📈</span> Platform Stats
      </h2>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-800/50 rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-green-400">
            ${parseFloat(formatUnits(totalPrincipal, 6)).toLocaleString()}
          </div>
          <div className="text-xs text-gray-400">Total Deposited</div>
        </div>
        
        <div className="bg-gray-800/50 rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-indigo-400">
            {totalCreditsIssued.toString()}
          </div>
          <div className="text-xs text-gray-400">Credits Issued</div>
        </div>
        
        <div className="bg-gray-800/50 rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-purple-400">
            {totalCreditsUsed.toString()}
          </div>
          <div className="text-xs text-gray-400">Credits Used</div>
        </div>
        
        <div className="bg-gray-800/50 rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-yellow-400">
            {currentAPY.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-400">Estimated APY</div>
        </div>
      </div>
    </div>
  );
}
