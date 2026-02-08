'use client';

import { useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import { useDashboard } from '@/contexts/DashboardContext';
import { CONTRACT_ADDRESSES } from '@/lib/config';

export default function Dashboard() {
  const { address } = useAccount();
  const { dashboardData, isLoading } = useDashboard();

  const yieldVaultAddress = CONTRACT_ADDRESSES.baseSepolia.yieldVault;

  if (!address) return null;

  // Contract returns: depositAmount, depositTimestamp, baseCredits, yieldCredits,
  // availableCredits, creditsUsed, currentValue, yieldEarned
  const [
    depositAmount = BigInt(0),
    depositTimestamp = BigInt(0),
    baseCredits = BigInt(0),
    yieldCredits = BigInt(0),
    availableCredits = BigInt(0),
    creditsUsed = BigInt(0),
    currentValue = BigInt(0),
    yieldEarned = BigInt(0),
  ] = dashboardData || [];

  const formatUSDC = (amount: bigint) => {
    return parseFloat(formatUnits(amount, 6)).toFixed(2);
  };

  const formatTimestamp = (timestamp: bigint) => {
    if (timestamp === BigInt(0)) return 'Never';
    return new Date(Number(timestamp) * 1000).toLocaleDateString();
  };

  if (yieldVaultAddress === '0x0000000000000000000000000000000000000000') {
    return (
      <div className="card-gradient rounded-2xl p-6 border border-gray-800">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span>📊</span> Your Dashboard
        </h2>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-yellow-400 text-sm">
          ⚠️ Contract not deployed yet. Please update the contract addresses in <code className="bg-gray-800 px-1 rounded">.env.local</code>
        </div>
      </div>
    );
  }

  return (
    <div className="card-gradient rounded-2xl p-6 border border-gray-800">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span>📊</span> Your Dashboard
      </h2>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-gray-700/50 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Deposit Amount */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="text-sm text-gray-400 mb-1">Total Deposited</div>
            <div className="text-2xl font-bold text-green-400">
              ${formatUSDC(depositAmount)} <span className="text-sm text-gray-500">USDC</span>
            </div>
            {depositTimestamp > BigInt(0) && (
              <div className="text-xs text-gray-500 mt-1">
                Since {formatTimestamp(depositTimestamp)}
              </div>
            )}
          </div>

          {/* Credits */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="text-sm text-gray-400 mb-1">Available Credits</div>
            <div className="text-2xl font-bold text-indigo-400">
              {availableCredits.toString()} <span className="text-sm text-gray-500">images</span>
            </div>
            <div className="flex gap-4 mt-2 text-xs">
              <span className="text-gray-500">
                Base: <span className="text-gray-300">{baseCredits.toString()}</span>
              </span>
              <span className="text-gray-500">
                Yield: <span className="text-purple-400">+{yieldCredits.toString()}</span>
              </span>
              <span className="text-gray-500">
                Used: <span className="text-red-400">-{creditsUsed.toString()}</span>
              </span>
            </div>
          </div>

          {/* APY / Yield Earned */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="text-sm text-gray-400 mb-1">Yield Earned (Aave)</div>
            <div className="text-2xl font-bold text-purple-400">
              ${formatUSDC(yieldEarned)} <span className="text-sm text-gray-500">USDC</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Current Value: ${formatUSDC(currentValue)} USDC
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-indigo-400">{creditsUsed.toString()}</div>
              <div className="text-xs text-gray-400">Images Generated</div>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-purple-400">{yieldCredits.toString()}</div>
              <div className="text-xs text-gray-400">Yield Bonus Credits</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
