'use client';

import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useDashboard } from '@/contexts/DashboardContext';
import GeminiChat from '@/components/GeminiChat';

export default function GeminiChatPlatform() {
  const { isConnected } = useAccount();
  const { dashboardData, isLoading } = useDashboard();

  const availableCredits = dashboardData?.[4] || BigInt(0);

  if (!isConnected) {
    return (
      <main className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-6">
        <div className="ambient-glow ambient-glow-1" />
        <div className="ambient-glow ambient-glow-2" />

        <div className="relative z-10 text-center max-w-md scale-in">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-[#4285f4] to-[#00d4aa] rounded-2xl blur-xl opacity-50 animate-pulse" />
            <div className="relative w-full h-full rounded-2xl bg-[#12121a] border border-[rgba(255,255,255,0.1)] flex items-center justify-center">
              <span className="text-5xl">◐</span>
            </div>
          </div>

          <h1 className="font-display text-3xl font-bold mb-4">Connect Your Wallet</h1>
          <p className="text-[#a1a1aa] mb-8 leading-relaxed">
            Connect your wallet to access NeverPay Chat and start conversations with your credits.
          </p>

          <div className="flex justify-center mb-8">
            <ConnectButton />
          </div>

          <div className="space-y-3">
            <Link href="/marketplace" className="block text-[#4285f4] hover:underline text-sm font-medium">
              ← Back to Marketplace
            </Link>
            <Link href="/" className="block text-[#52525b] hover:text-[#a1a1aa] text-sm transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col">
      <div className="ambient-glow ambient-glow-1" />
      <div className="ambient-glow ambient-glow-2" />

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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link
                href="/marketplace"
                className="flex items-center gap-2 text-[#52525b] hover:text-[#fafafa] transition-colors group"
              >
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline text-sm">Marketplace</span>
              </Link>

              <div className="w-px h-6 bg-[rgba(255,255,255,0.1)] hidden sm:block" />

              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#4285f4] rounded-xl blur-lg opacity-30" />
                  <div className="relative w-10 h-10 rounded-xl bg-[rgba(66,133,244,0.15)] border border-[rgba(66,133,244,0.3)] flex items-center justify-center">
                    <span className="text-xl">◐</span>
                  </div>
                </div>
                <div>
                  <h1 className="font-display text-lg font-bold tracking-tight">NeverPay Chat</h1>
                  <p className="text-xs text-[#52525b]">AI Text Generation</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-[rgba(66,133,244,0.1)] border border-[rgba(66,133,244,0.2)]">
                <span className="w-2 h-2 rounded-full bg-[#4285f4] animate-pulse" />
                <span className="text-sm font-medium text-[#4285f4]">
                  {isLoading ? '...' : availableCredits.toString()} credits
                </span>
              </div>
              <ConnectButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8 h-full">
          {/* Sidebar */}
          <aside className="lg:col-span-1 fade-in">
            <div className="sticky top-8 space-y-6">
              {/* Credits Card */}
              <div className="elevated-card rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#4285f4] to-[#00d4aa]" />

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[rgba(66,133,244,0.15)] flex items-center justify-center">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div>
                    <p className="text-xs text-[#52525b] uppercase tracking-wider">Available</p>
                    <p className="font-display text-3xl font-bold gradient-text">
                      {isLoading ? '...' : availableCredits.toString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-t border-[rgba(255,255,255,0.05)]">
                  <span className="text-sm text-[#a1a1aa]">Cost per message</span>
                  <span className="font-display font-semibold text-[#4285f4]">1 Credit</span>
                </div>
              </div>

              {/* No credits warning */}
              {availableCredits === BigInt(0) && (
                <div className="glass-card rounded-xl p-5 border-l-2 border-[#f59e0b]">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">⚠️</span>
                    <div>
                      <p className="font-medium text-[#f59e0b] mb-1">No credits available</p>
                      <p className="text-sm text-[#a1a1aa] mb-3">
                        Visit the marketplace to deposit USDC and get credits.
                      </p>
                      <Link href="/marketplace" className="btn-primary text-xs py-2 px-4">
                        Get Credits
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Platform Info */}
              <div className="glass-card rounded-xl p-5">
                <h4 className="font-display font-semibold mb-4 flex items-center gap-2">
                  <span>✨</span> About this platform
                </h4>
                <p className="text-sm text-[#a1a1aa] leading-relaxed mb-4">
                  Have multi-turn conversations with Google Gemini 2.0 Flash. Each message costs 1 credit.
                  Your USDC deposit earns yield through Aave while you chat.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-[#52525b]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4285f4]" />
                    <span>Powered by Gemini 2.0 Flash</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#52525b]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7c3aed]" />
                    <span>On-chain credit verification</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#52525b]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ec4899]" />
                    <span>Full conversation memory</span>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="glass-card rounded-xl p-5">
                <h4 className="font-display font-semibold mb-4 flex items-center gap-2">
                  <span>💡</span> Tips
                </h4>
                <ul className="space-y-2 text-sm text-[#a1a1aa]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#4285f4] mt-0.5">→</span>
                    <span>Ask follow-up questions — context is maintained</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#4285f4] mt-0.5">→</span>
                    <span>Great for DeFi research and explanations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#4285f4] mt-0.5">→</span>
                    <span>Press Enter to send, Shift+Enter for new line</span>
                  </li>
                </ul>
              </div>
            </div>
          </aside>

          {/* Main - Chat */}
          <div className="lg:col-span-3 fade-in fade-in-delay-1">
            <GeminiChat />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[rgba(255,255,255,0.05)] py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[#52525b]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#4285f4] animate-pulse" />
              <span>Active Platform</span>
              <span className="text-[#a1a1aa]">•</span>
              <span>1 credit per message</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Powered by Google Gemini</span>
              <span className="text-[#a1a1aa]">•</span>
              <span>Aave Protocol</span>
              <span className="text-[#a1a1aa]">•</span>
              <span>Base</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
