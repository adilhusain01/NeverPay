'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { YIELD_VAULT_ABI, ERC20_ABI } from '@/lib/contracts';
import { CONTRACT_ADDRESSES } from '@/lib/config';
import { useDashboard } from '@/contexts/DashboardContext';
import BridgeDeposit from './BridgeDeposit';

export default function DepositForm() {
  const [activeTab, setActiveTab] = useState<'direct' | 'bridge'>('direct');
  const { address } = useAccount();
  const [amount, setAmount] = useState('');
  const { dashboardData, refetchDashboard } = useDashboard();

  const addresses = CONTRACT_ADDRESSES.baseSepolia;
  const yieldVaultAddress = addresses.yieldVault as `0x${string}`;
  const usdcAddress = addresses.usdc as `0x${string}`;

  // Read USDC balance
  const { data: usdcBalance, refetch: refetchBalance } = useReadContract({
    address: usdcAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: { enabled: !!address && usdcAddress !== '0x0000000000000000000000000000000000000000' },
  });

  // Read allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: usdcAddress,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [address as `0x${string}`, yieldVaultAddress],
    query: { enabled: !!address && usdcAddress !== '0x0000000000000000000000000000000000000000' },
  });

  const { writeContract: approve, data: approveHash } = useWriteContract();
  const { writeContract: deposit, data: depositHash } = useWriteContract();
  const { writeContract: withdraw, data: withdrawHash } = useWriteContract();

  const { isLoading: isApproveLoading, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  const { isLoading: isDepositLoading, isSuccess: isDepositSuccess } = useWaitForTransactionReceipt({
    hash: depositHash,
  });

  const { isLoading: isWithdrawLoading, isSuccess: isWithdrawSuccess } = useWaitForTransactionReceipt({
    hash: withdrawHash,
  });

  // Refetch all data when any transaction succeeds
  useEffect(() => {
    if (isApproveSuccess) {
      refetchAllowance();
    }
  }, [isApproveSuccess, refetchAllowance]);

  useEffect(() => {
    if (isDepositSuccess) {
      refetchBalance();
      refetchAllowance();
      refetchDashboard();
      setAmount('');
    }
  }, [isDepositSuccess, refetchBalance, refetchAllowance, refetchDashboard]);

  useEffect(() => {
    if (isWithdrawSuccess) {
      refetchBalance();
      refetchDashboard();
    }
  }, [isWithdrawSuccess, refetchBalance, refetchDashboard]);

  const depositAmount = dashboardData?.[0] || BigInt(0);
  const amountInWei = amount ? parseUnits(amount, 6) : BigInt(0);
  const needsApproval = allowance !== undefined && amountInWei > allowance;

  const handleApprove = async () => {
    if (!amount) return;
    try {
      approve({
        address: usdcAddress,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [yieldVaultAddress, amountInWei],
      });
    } catch (err) {
      console.error('Approve error:', err);
    }
  };

  const handleDeposit = async () => {
    if (!amount) return;
    try {
      deposit({
        address: yieldVaultAddress,
        abi: YIELD_VAULT_ABI,
        functionName: 'deposit',
        args: [amountInWei],
      });
    } catch (err) {
      console.error('Deposit error:', err);
    }
  };

  const handleWithdraw = async () => {
    try {
      withdraw({
        address: yieldVaultAddress,
        abi: YIELD_VAULT_ABI,
        functionName: 'withdraw',
      });
    } catch (err) {
      console.error('Withdraw error:', err);
    }
  };

  const estimatedCredits = amount ? Math.floor((parseFloat(amount) * 50 * 0.8)) : 0;

  if (yieldVaultAddress === '0x0000000000000000000000000000000000000000') {
    return (
      <div className="elevated-card rounded-2xl p-6">
        <div className="glass-card rounded-xl p-4 border-l-2 border-[#f59e0b]">
          <div className="flex items-center gap-3">
            <span className="text-xl">⏳</span>
            <p className="text-sm text-[#f59e0b]">Waiting for contract deployment...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="elevated-card rounded-2xl p-6">
      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] mb-6">
        <button
          onClick={() => setActiveTab('direct')}
          className={`flex-1 text-sm py-2 rounded-lg transition-all ${
            activeTab === 'direct'
              ? 'bg-[rgba(0,212,170,0.15)] text-[#00d4aa] border border-[rgba(0,212,170,0.3)]'
              : 'text-[#52525b] hover:text-[#a1a1aa]'
          }`}
        >
          Direct (USDC)
        </button>
        <button
          onClick={() => setActiveTab('bridge')}
          className={`flex-1 text-sm py-2 rounded-lg transition-all ${
            activeTab === 'bridge'
              ? 'bg-[rgba(124,58,237,0.15)] text-[#7c3aed] border border-[rgba(124,58,237,0.3)]'
              : 'text-[#52525b] hover:text-[#a1a1aa]'
          }`}
        >
          Lifi ✦ Bridge
        </button>
      </div>

      {activeTab === 'bridge' && <BridgeDeposit />}
      {activeTab === 'direct' && <>
      {/* Balance Display */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[rgba(0,212,170,0.15)] flex items-center justify-center">
            <span className="text-sm">💵</span>
          </div>
          <span className="text-sm text-[#a1a1aa]">USDC Balance</span>
        </div>
        <span className="font-display font-semibold text-[#00d4aa]">
          ${usdcBalance ? parseFloat(formatUnits(usdcBalance, 6)).toFixed(2) : '0.00'}
        </span>
      </div>

      {/* Deposit Form */}
      <div className="space-y-4">
        <div>
          <label className="text-sm text-[#52525b] mb-2 block">Amount to Deposit</label>
          <div className="relative">
            <input
              type="number"
              placeholder="100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input-field pr-20 font-display"
              min="1"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <span className="text-[#52525b] text-sm">USDC</span>
            </div>
          </div>

          {/* Credits preview */}
          {amount && (
            <div className="mt-3 p-3 rounded-lg bg-[rgba(0,212,170,0.08)] border border-[rgba(0,212,170,0.2)]">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#a1a1aa]">You'll receive</span>
                <span className="font-display font-semibold text-[#00d4aa]">
                  {estimatedCredits} credits
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        {needsApproval ? (
          <button
            onClick={handleApprove}
            disabled={!amount || isApproveLoading}
            className="w-full btn-secondary flex items-center justify-center gap-2"
          >
            {isApproveLoading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Approving...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Approve USDC
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleDeposit}
            disabled={!amount || isDepositLoading || parseFloat(amount) < 1}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            {isDepositLoading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Depositing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Deposit USDC
              </>
            )}
          </button>
        )}
      </div>

      {/* Withdraw Section */}
      {depositAmount > BigInt(0) && (
        <div className="mt-6 pt-6 border-t border-[rgba(255,255,255,0.05)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[rgba(245,158,11,0.15)] flex items-center justify-center">
                <span className="text-xs">🏦</span>
              </div>
              <span className="text-sm text-[#a1a1aa]">Your Deposit</span>
            </div>
            <span className="font-display font-semibold text-[#f59e0b]">
              ${formatUnits(depositAmount, 6)} USDC
            </span>
          </div>

          <button
            onClick={handleWithdraw}
            disabled={isWithdrawLoading}
            className="w-full py-3 px-4 rounded-xl bg-[rgba(239,68,68,0.1)] hover:bg-[rgba(239,68,68,0.15)]
                       border border-[rgba(239,68,68,0.2)] text-[#ef4444] font-display font-medium
                       transition-all flex items-center justify-center gap-2"
          >
            {isWithdrawLoading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Withdrawing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
                Withdraw All
              </>
            )}
          </button>
          <p className="text-xs text-[#52525b] mt-2 text-center">
            Credits will be revoked upon withdrawal
          </p>
        </div>
      )}
      </>}
    </div>
  );
}
