'use client';

import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="ambient-glow ambient-glow-1" />
      <div className="ambient-glow ambient-glow-2" />

      {/* Floating grid pattern */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none"
           style={{
             backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
             backgroundSize: '60px 60px'
           }}
      />

      {/* Header */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 py-6">
        <nav className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#00d4aa] to-[#7c3aed] rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative w-11 h-11 rounded-xl bg-[#12121a] border border-[rgba(255,255,255,0.1)] flex items-center justify-center">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="url(#grad1)" />
                  <path d="M2 17L12 22L22 17" stroke="url(#grad1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 12L12 17L22 12" stroke="url(#grad1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <defs>
                    <linearGradient id="grad1" x1="2" y1="2" x2="22" y2="22">
                      <stop stopColor="#00d4aa" />
                      <stop offset="1" stopColor="#7c3aed" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
            <div>
              <h1 className="font-display text-xl font-bold tracking-tight">NeverPay</h1>
              <p className="text-xs text-[#52525b] tracking-wide">CREDIT PROTOCOL</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/marketplace" className="btn-ghost text-sm hidden sm:block">
              Marketplace
            </Link>
            <ConnectButton />
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="text-center">
          {/* Eyebrow */}
          <div className="fade-in inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(0,212,170,0.08)] border border-[rgba(0,212,170,0.2)] mb-8">
            <span className="glow-dot" />
            <span className="text-sm font-medium text-[#00d4aa]">Live on Base Sepolia</span>
          </div>

          {/* Main headline */}
          <h2 className="fade-in fade-in-delay-1 font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tight mb-8">
            <span className="block text-[#fafafa]">Deposit Once.</span>
            <span className="block gradient-text mt-2">Access Everything.</span>
          </h2>

          {/* Subheadline */}
          <p className="fade-in fade-in-delay-2 text-lg md:text-xl text-[#a1a1aa] max-w-2xl mx-auto leading-relaxed mb-12">
            Transform stablecoins into universal credits. Your USDC earns yield through Aave
            while you access AI, cloud services, and more with a single deposit.
          </p>

          {/* CTA Buttons */}
          <div className="fade-in fade-in-delay-3 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/marketplace" className="btn-primary text-base px-8 py-4">
              Launch App
              <svg className="inline-block ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <button className="btn-secondary text-base px-8 py-4">
              View Documentation
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="fade-in fade-in-delay-4 mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { label: 'Total Value Locked', value: '$124', icon: '◆' },
            { label: 'Credits Issued', value: '6.2K', icon: '⚡' },
            { label: 'Active Users', value: '12', icon: '◎' },
            { label: 'Current APY', value: '4.8%', icon: '↗' },
          ].map((stat, i) => (
            <div key={i} className="glass-card rounded-2xl p-5 md:p-6 text-center">
              <div className="text-2xl mb-2 opacity-60">{stat.icon}</div>
              <div className="font-display text-2xl md:text-3xl font-bold text-[#fafafa] mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-[#52525b]">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 py-24 border-t border-[rgba(255,255,255,0.05)]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-[#7c3aed] tracking-widest uppercase mb-4 block">
              How It Works
            </span>
            <h3 className="font-display text-4xl md:text-5xl font-bold">
              Three steps to <span className="gradient-text">financial freedom</span>
            </h3>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                step: '01',
                title: 'Deposit Collateral',
                description: 'Stake USDC as collateral. Your deposit immediately starts earning yield through Aave while maintaining full liquidity.',
                gradient: 'from-[#00d4aa] to-[#00d4aa]',
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
              {
                step: '02',
                title: 'Receive Credits',
                description: 'Instantly receive universal credits based on your deposit. Credits can be used across all integrated platforms.',
                gradient: 'from-[#7c3aed] to-[#7c3aed]',
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
              },
              {
                step: '03',
                title: 'Access Platforms',
                description: 'Use your credits on any integrated platform. Withdraw your principal anytime — credits are simply revoked.',
                gradient: 'from-[#ec4899] to-[#ec4899]',
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                ),
              },
            ].map((item, i) => (
              <div
                key={i}
                className="elevated-card rounded-2xl p-8 relative group"
              >
                {/* Step number */}
                <div className="absolute top-6 right-6 font-display text-6xl font-bold text-[rgba(255,255,255,0.03)] group-hover:text-[rgba(255,255,255,0.06)] transition-colors">
                  {item.step}
                </div>

                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.gradient} bg-opacity-10 flex items-center justify-center mb-6 text-[${item.gradient.split('-')[1].replace('[', '').replace(']', '')}]`}
                     style={{ background: `linear-gradient(135deg, ${item.gradient.includes('00d4aa') ? 'rgba(0,212,170,0.15)' : item.gradient.includes('7c3aed') ? 'rgba(124,58,237,0.15)' : 'rgba(236,72,153,0.15)'} 0%, transparent 100%)` }}>
                  <div style={{ color: item.gradient.includes('00d4aa') ? '#00d4aa' : item.gradient.includes('7c3aed') ? '#7c3aed' : '#ec4899' }}>
                    {item.icon}
                  </div>
                </div>

                <h4 className="font-display text-xl font-semibold mb-3">{item.title}</h4>
                <p className="text-[#a1a1aa] leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Preview */}
      <section className="relative z-10 py-24 bg-[rgba(0,0,0,0.3)]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
            <div>
              <span className="text-sm font-semibold text-[#00d4aa] tracking-widest uppercase mb-4 block">
                Ecosystem
              </span>
              <h3 className="font-display text-4xl md:text-5xl font-bold">
                Integrated Platforms
              </h3>
            </div>
            <Link href="/marketplace" className="btn-ghost mt-4 md:mt-0">
              View all platforms
              <svg className="inline-block ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'NeverPay Image', category: 'Image Generation', cost: '1 credit', status: 'live', icon: '✦' },
              { name: 'NeverPay Chat', category: 'AI Assistant', cost: '1 credit', status: 'live', icon: '◐' },
              { name: 'AWS Services', category: 'Cloud Computing', cost: 'Variable', status: 'soon', icon: '◇' },
              { name: 'GitHub Copilot', category: 'Code Assistant', cost: '0.1 credits', status: 'soon', icon: '⬡' },
            ].map((platform, i) => (
              <div
                key={i}
                className="glass-card rounded-2xl p-6 group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[rgba(255,255,255,0.05)] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {platform.icon}
                  </div>
                  <span className={`badge ${platform.status === 'live' ? 'badge-success' : 'badge-neutral'}`}>
                    {platform.status === 'live' && <span className="glow-dot !w-1.5 !h-1.5" />}
                    {platform.status}
                  </span>
                </div>
                <h4 className="font-display font-semibold text-lg mb-1">{platform.name}</h4>
                <p className="text-sm text-[#52525b] mb-3">{platform.category}</p>
                <div className="text-sm text-[#00d4aa] font-medium">{platform.cost}/use</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="relative z-10 py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="elevated-card rounded-3xl p-8 md:p-12 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#7c3aed] to-transparent opacity-10 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-gradient-to-tr from-[#00d4aa] to-transparent opacity-10 blur-3xl" />

            <div className="relative">
              <div className="text-center mb-12">
                <h3 className="font-display text-3xl md:text-4xl font-bold mb-4">
                  Why choose <span className="gradient-text">NeverPay</span>?
                </h3>
                <p className="text-[#a1a1aa] max-w-xl mx-auto">
                  The first protocol that lets you access premium services without giving up your capital.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    title: 'No Subscriptions',
                    description: 'Pay once with collateral, access everything. No monthly fees or surprise charges.',
                    color: '#00d4aa',
                  },
                  {
                    title: 'Earn While You Spend',
                    description: 'Your collateral earns DeFi yields through Aave, funding more credits over time.',
                    color: '#7c3aed',
                  },
                  {
                    title: 'Full Control',
                    description: 'Withdraw your principal anytime. Your money stays yours—credits are simply revoked.',
                    color: '#f59e0b',
                  },
                ].map((item, i) => (
                  <div key={i} className="text-center md:text-left">
                    <div
                      className="w-10 h-10 rounded-lg mb-4 mx-auto md:mx-0 flex items-center justify-center"
                      style={{ background: `rgba(${item.color === '#00d4aa' ? '0,212,170' : item.color === '#7c3aed' ? '124,58,237' : '245,158,11'},0.15)` }}
                    >
                      <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                    </div>
                    <h4 className="font-display font-semibold text-lg mb-2" style={{ color: item.color }}>
                      {item.title}
                    </h4>
                    <p className="text-[#a1a1aa] text-sm leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[rgba(255,255,255,0.05)] py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00d4aa] to-[#7c3aed] flex items-center justify-center">
                <span className="text-xs font-bold text-[#0a0a0f]">N</span>
              </div>
              <span className="font-display font-semibold">NeverPay</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-[#52525b]">
              <span>Powered by</span>
              <div className="flex items-center gap-4">
                <span className="text-[#a1a1aa]">Circle USDC</span>
                <span className="text-[#a1a1aa]">Aave</span>
                <span className="text-[#a1a1aa]">Base</span>
              </div>
            </div>

            <div className="text-sm text-[#52525b]">
              Built with ❤️
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
