'use client';

import Link from 'next/link';
import { useAccount, useReadContract } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { formatUnits } from 'viem';
import { useDashboard } from '@/contexts/DashboardContext';
import { YIELD_VAULT_ABI } from '@/lib/contracts';
import { CONTRACT_ADDRESSES } from '@/lib/config';
import DepositForm from '@/components/DepositForm';

interface Platform {
  id: string;
  name: string;
  icon: string;
  description: string;
  creditCost: string;
  category: string;
  status: 'active' | 'coming-soon' | 'demo';
  href: string;
  color: string;
}

const platforms: Platform[] = [
  {
    id: 'yieldcredit-ai',
    name: 'NeverPay Image',
    icon: '✦',
    description: 'Generate stunning AI images using Google Gemini with DeFi-powered credits',
    creditCost: '1 credit per image',
    category: 'AI Generation',
    status: 'active',
    href: '/platform/yieldcredit-ai',
    color: '#00d4aa'
  },
  {
    id: 'gemini-chat',
    name: 'NeverPay Chat',
    icon: '◐',
    description: 'Multi-turn AI conversations powered by Google Gemini 2.0 Flash',
    creditCost: '1 credit per message',
    category: 'AI Assistant',
    status: 'active',
    href: '/platform/gemini-chat',
    color: '#4285f4'
  },
  {
    id: 'claude-ai',
    name: 'Claude AI',
    icon: '◈',
    description: 'Advanced AI assistant for complex reasoning, analysis, and creative tasks',
    creditCost: '2 credits per conversation',
    category: 'AI Assistant',
    status: 'coming-soon',
    href: '/platform/claude-ai',
    color: '#7c3aed'
  },
  {
    id: 'aws-services',
    name: 'AWS Services',
    icon: '◇',
    description: 'Comprehensive cloud computing platform with EC2, S3, Lambda, and more',
    creditCost: 'Variable pricing',
    category: 'Cloud Computing',
    status: 'coming-soon',
    href: '/platform/aws-services',
    color: '#f59e0b'
  },
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    icon: '⬡',
    description: 'AI-powered code completion and programming assistant',
    creditCost: '0.1 credit per completion',
    category: 'Development',
    status: 'coming-soon',
    href: '/platform/github-copilot',
    color: '#ec4899'
  },
  {
    id: 'openai-api',
    name: 'OpenAI API',
    icon: '◉',
    description: 'Access GPT-4, DALL-E, and other OpenAI models via API credits',
    creditCost: '1-5 credits per request',
    category: 'AI Models',
    status: 'coming-soon',
    href: '/platform/openai-api',
    color: '#06b6d4'
  },
  {
    id: 'vercel-hosting',
    name: 'Vercel Hosting',
    icon: '△',
    description: 'Deploy and host your applications with serverless functions',
    creditCost: '10 credits per deployment',
    category: 'Hosting',
    status: 'coming-soon',
    href: '/platform/vercel-hosting',
    color: '#a855f7'
  }
];

export default function MarketplacePage() {
  const { isConnected, address } = useAccount();
  const { dashboardData, isLoading } = useDashboard();

  const contractAddress = CONTRACT_ADDRESSES.baseSepolia.yieldVault;

  // Fetch platform stats
  const { data: platformStats } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: YIELD_VAULT_ABI,
    functionName: 'getPlatformStats',
    query: {
      enabled: !!address && contractAddress !== '0x0000000000000000000000000000000000000000',
      refetchInterval: 30000,
    },
  });

  // Get user dashboard data
  const availableCredits = dashboardData?.[4] || BigInt(0);
  const depositAmount = dashboardData?.[0] || BigInt(0);
  const yieldEarned = dashboardData?.[7] || BigInt(0);
  const creditsUsed = dashboardData?.[5] || BigInt(0);

  // Get platform stats data
  const [
    totalPrincipal = BigInt(0),
  ] = platformStats || [];

  const formatUSDC = (amount: bigint) => {
    return parseFloat(formatUnits(amount, 6)).toFixed(2);
  };

  if (!isConnected) {
    return (
      <main className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-6">
        {/* Ambient glows */}
        <div className="ambient-glow ambient-glow-1" />
        <div className="ambient-glow ambient-glow-2" />

        <div className="relative z-10 text-center max-w-md scale-in">
          {/* Logo animation */}
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-[#00d4aa] to-[#7c3aed] rounded-2xl blur-xl opacity-50 animate-pulse" />
            <div className="relative w-full h-full rounded-2xl bg-[#12121a] border border-[rgba(255,255,255,0.1)] flex items-center justify-center">
              <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="url(#grad2)" />
                <path d="M2 17L12 22L22 17" stroke="url(#grad2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12L12 17L22 12" stroke="url(#grad2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                  <linearGradient id="grad2" x1="2" y1="2" x2="22" y2="22">
                    <stop stopColor="#00d4aa" />
                    <stop offset="1" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          <h1 className="font-display text-3xl font-bold mb-4">Connect Your Wallet</h1>
          <p className="text-[#a1a1aa] mb-8 leading-relaxed">
            Connect your wallet to access the NeverPay marketplace and start using your credits across platforms.
          </p>

          <div className="flex justify-center mb-8">
            <ConnectButton />
          </div>

          <Link href="/" className="text-[#00d4aa] hover:underline text-sm font-medium">
            ← Back to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Ambient glows */}
      <div className="ambient-glow ambient-glow-1" />
      <div className="ambient-glow ambient-glow-2" />

      {/* Grid pattern */}
      <div className="fixed inset-0 opacity-[0.015] pointer-events-none"
           style={{
             backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
             backgroundSize: '60px 60px'
           }}
      />

      {/* Header */}
      <header className="relative z-10 border-b border-[rgba(255,255,255,0.05)]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-4 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#00d4aa] to-[#7c3aed] rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
                <div className="relative w-10 h-10 rounded-xl bg-[#12121a] border border-[rgba(255,255,255,0.1)] flex items-center justify-center">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="url(#grad3)" />
                    <path d="M2 17L12 22L22 17" stroke="url(#grad3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M2 12L12 17L22 12" stroke="url(#grad3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <defs>
                      <linearGradient id="grad3" x1="2" y1="2" x2="22" y2="22">
                        <stop stopColor="#00d4aa" />
                        <stop offset="1" stopColor="#7c3aed" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="font-display text-lg font-bold tracking-tight">NeverPay</h1>
                <p className="text-xs text-[#52525b]">Marketplace</p>
              </div>
            </Link>
            <ConnectButton />
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        <section className="mb-10 fade-in">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Available Credits - Highlighted */}
            <div className="col-span-2 lg:col-span-1 elevated-card rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00d4aa] to-[#7c3aed]" />
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[rgba(0,212,170,0.15)] flex items-center justify-center">
                  <span className="text-xl">⚡</span>
                </div>
                <span className="text-sm text-[#a1a1aa]">Available Credits</span>
              </div>
              <div className="font-display text-4xl font-bold gradient-text">
                {isLoading ? (
                  <span className="shimmer inline-block w-20 h-10 rounded" />
                ) : (
                  availableCredits.toString()
                )}
              </div>
              <p className="text-xs text-[#52525b] mt-1">Ready to spend</p>
            </div>

            {/* Credits Used */}
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[rgba(124,58,237,0.15)] flex items-center justify-center text-sm">
                  🔥
                </div>
                <span className="text-xs text-[#52525b]">Credits Used</span>
              </div>
              <div className="font-display text-2xl font-bold text-[#fafafa]">
                {creditsUsed.toString()}
              </div>
            </div>

            {/* Total Deposited */}
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[rgba(0,212,170,0.15)] flex items-center justify-center text-sm">
                  💰
                </div>
                <span className="text-xs text-[#52525b]">Total Deposited</span>
              </div>
              <div className="font-display text-2xl font-bold text-[#00d4aa]">
                ${formatUSDC(totalPrincipal)}
              </div>
            </div>

            {/* My Deposit */}
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[rgba(245,158,11,0.15)] flex items-center justify-center text-sm">
                  🏦
                </div>
                <span className="text-xs text-[#52525b]">My Deposit</span>
              </div>
              <div className="font-display text-2xl font-bold text-[#f59e0b]">
                ${formatUSDC(depositAmount)}
              </div>
            </div>

            {/* Yield Earned */}
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[rgba(236,72,153,0.15)] flex items-center justify-center text-sm">
                  📈
                </div>
                <span className="text-xs text-[#52525b]">Yield Earned</span>
              </div>
              <div className="font-display text-2xl font-bold text-[#ec4899]">
                ${formatUSDC(yieldEarned)}
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Platform Grid */}
          <section className="lg:col-span-2 fade-in fade-in-delay-1">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="font-display text-2xl font-bold mb-1">Platforms</h2>
                <p className="text-sm text-[#52525b]">Spend your credits across integrated services</p>
              </div>
              <div className="flex gap-2">
                <span className="badge badge-success">
                  <span className="glow-dot !w-1.5 !h-1.5" />
                  Active
                </span>
                <span className="badge badge-neutral">Coming Soon</span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {platforms.map((platform) => (
                <div
                  key={platform.id}
                  className="elevated-card rounded-2xl p-6 group relative overflow-hidden"
                >
                  {/* Hover glow effect */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at 50% 0%, ${platform.color}15 0%, transparent 60%)`
                    }}
                  />

                  <div className="relative">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110"
                          style={{ background: `${platform.color}20` }}
                        >
                          {platform.icon}
                        </div>
                        <div>
                          <h3 className="font-display font-semibold text-lg">{platform.name}</h3>
                          <span className="text-xs text-[#52525b]">{platform.category}</span>
                        </div>
                      </div>
                      <span className={`badge ${platform.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>
                        {platform.status === 'active' && <span className="glow-dot !w-1.5 !h-1.5" />}
                        {platform.status === 'active' ? 'Live' : 'Soon'}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-[#a1a1aa] leading-relaxed mb-4 line-clamp-2">
                      {platform.description}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-[#52525b]">Cost</span>
                        <p className="text-sm font-medium" style={{ color: platform.color }}>
                          {platform.creditCost}
                        </p>
                      </div>

                      {platform.status === 'active' ? (
                        <Link
                          href={platform.href}
                          className="btn-primary text-sm py-2.5 px-5"
                        >
                          Launch
                          <svg className="inline-block ml-1.5 w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </Link>
                      ) : (
                        <button
                          disabled
                          className="text-sm py-2.5 px-5 rounded-xl bg-[rgba(255,255,255,0.03)] text-[#52525b] cursor-not-allowed"
                        >
                          Coming Soon
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Sidebar - Deposit Form */}
          <aside className="lg:col-span-1 fade-in fade-in-delay-2">
            <div className="sticky top-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4aa] to-[#7c3aed] flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#0a0a0f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold">Deposit</h2>
                  <p className="text-xs text-[#52525b]">Get credits instantly</p>
                </div>
              </div>

              <DepositForm />

              {availableCredits === BigInt(0) && (
                <div className="mt-6 glass-card rounded-xl p-5 border-l-2 border-[#f59e0b]">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">⚠️</span>
                    <div>
                      <p className="font-medium text-[#f59e0b] mb-1">No credits available</p>
                      <p className="text-sm text-[#a1a1aa]">
                        Deposit USDC above to receive credits and start using platforms.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Info */}
              <div className="mt-6 glass-card rounded-xl p-5">
                <h4 className="font-display font-semibold mb-4 flex items-center gap-2">
                  <span>💡</span> How it works
                </h4>
                <ul className="space-y-3 text-sm text-[#a1a1aa]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#00d4aa] mt-0.5">◆</span>
                    <span>Deposit USDC to receive credits instantly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#7c3aed] mt-0.5">◆</span>
                    <span>Your deposit earns yield through Aave</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#ec4899] mt-0.5">◆</span>
                    <span>Withdraw anytime - credits are revoked</span>
                  </li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
