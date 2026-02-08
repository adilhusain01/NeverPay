'use client';

import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useDashboard } from '@/contexts/DashboardContext';
import ImageGenerator from '@/components/ImageGenerator';

export default function YieldCreditAIPlatform() {
  const { isConnected } = useAccount();
  const { dashboardData, isLoading } = useDashboard();

  // Get available credits from dashboard
  const availableCredits = dashboardData?.[4] || BigInt(0);

  if (!isConnected) {
    return (
      <main className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-6">
        {/* Ambient glows */}
        <div className="ambient-glow ambient-glow-1" />
        <div className="ambient-glow ambient-glow-2" />

        <div className="relative z-10 text-center max-w-md scale-in">
          {/* Platform icon */}
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-[#00d4aa] to-[#7c3aed] rounded-2xl blur-xl opacity-50 animate-pulse" />
            <div className="relative w-full h-full rounded-2xl bg-[#12121a] border border-[rgba(255,255,255,0.1)] flex items-center justify-center">
              <span className="text-5xl">✦</span>
            </div>
          </div>

          <h1 className="font-display text-3xl font-bold mb-4">Connect Your Wallet</h1>
          <p className="text-[#a1a1aa] mb-8 leading-relaxed">
            Connect your wallet to access NeverPay Image and start generating images with your credits.
          </p>

          <div className="flex justify-center mb-8">
            <ConnectButton />
          </div>

          <div className="space-y-3">
            <Link href="/marketplace" className="block text-[#00d4aa] hover:underline text-sm font-medium">
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Back to Marketplace */}
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

              {/* Platform branding */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#00d4aa] rounded-xl blur-lg opacity-30" />
                  <div className="relative w-10 h-10 rounded-xl bg-[rgba(0,212,170,0.15)] border border-[rgba(0,212,170,0.3)] flex items-center justify-center">
                    <span className="text-xl">✦</span>
                  </div>
                </div>
                <div>
                  <h1 className="font-display text-lg font-bold tracking-tight">NeverPay Image</h1>
                  <p className="text-xs text-[#52525b]">AI Image Generation</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Credits display */}
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-[rgba(0,212,170,0.1)] border border-[rgba(0,212,170,0.2)]">
                <span className="glow-dot !w-2 !h-2" />
                <span className="text-sm font-medium text-[#00d4aa]">
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
          {/* Sidebar - Stats & Info */}
          <aside className="lg:col-span-1 fade-in">
            <div className="sticky top-8 space-y-6">
              {/* Credits Card */}
              <div className="elevated-card rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00d4aa] to-[#7c3aed]" />

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[rgba(0,212,170,0.15)] flex items-center justify-center">
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
                  <span className="text-sm text-[#a1a1aa]">Cost per image</span>
                  <span className="font-display font-semibold text-[#00d4aa]">1 Credit</span>
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
                      <Link href="/marketplace#deposit" className="btn-primary text-xs py-2 px-4">
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
                  Generate stunning AI images using Google Gemini. Each image costs 1 credit.
                  Your USDC deposit earns yield through Aave while you create.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-[#52525b]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00d4aa]" />
                    <span>Powered by Google Gemini</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#52525b]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7c3aed]" />
                    <span>On-chain credit verification</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#52525b]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ec4899]" />
                    <span>Instant image generation</span>
                  </div>
                </div>
              </div>

              {/* Quick tips */}
              <div className="glass-card rounded-xl p-5">
                <h4 className="font-display font-semibold mb-4 flex items-center gap-2">
                  <span>💡</span> Tips for better results
                </h4>
                <ul className="space-y-2 text-sm text-[#a1a1aa]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#00d4aa] mt-0.5">→</span>
                    <span>Be specific with details like style, mood, and colors</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#00d4aa] mt-0.5">→</span>
                    <span>Use descriptive adjectives for better quality</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#00d4aa] mt-0.5">→</span>
                    <span>Try the sample prompts for inspiration</span>
                  </li>
                </ul>
              </div>
            </div>
          </aside>

          {/* Main - Image Generator */}
          <div className="lg:col-span-3 fade-in fade-in-delay-1">
            <ImageGenerator />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[rgba(255,255,255,0.05)] py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[#52525b]">
            <div className="flex items-center gap-2">
              <span className="glow-dot !w-2 !h-2" />
              <span>Active Platform</span>
              <span className="text-[#a1a1aa]">•</span>
              <span>1 credit per image</span>
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
