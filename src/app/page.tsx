'use client';

import { ConnectButton } from '@/components/wallet/ConnectButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FEATURES } from '@/constants/features';
import { ArrowRight, Check, Zap, Shield, BarChart3, Play } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-black">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between px-6 py-4 backdrop-blur-xl bg-black/50 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0052FF] to-[#3387FF] flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="font-medium text-white">PermiPay</span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm text-gray-300 hover:text-white transition-colors">
              Features
            </Link>
            <Link href="/analytics" className="text-sm text-gray-300 hover:text-white transition-colors">
              Analytics
            </Link>
            <Link href="/dashboard" className="text-sm text-gray-300 hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/profile" className="text-sm text-gray-300 hover:text-white transition-colors">
              Profile
            </Link>
            <Link href="#how-it-works" className="text-sm text-gray-300 hover:text-white transition-colors">
              How It Works
            </Link>
          </nav>
            <Link href="#pricing" className="text-sm text-gray-300 hover:text-white transition-colors">
              Pricing
            </Link>
          </nav>
          <ConnectButton />
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen pt-32 pb-16 overflow-hidden bg-black hero-gradient">
        <div className="dotted-grid absolute inset-0"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              Stop Subscriptions.
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0052FF] to-[#3387FF]">
                Start Granting Usage.
              </span>
            </h1>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              Permission-metered Web3 analytics. Pay only when you actually use advanced features.
              No blind recurring charges. Built on MetaMask Advanced Permissions & Envio.
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" className="gap-2 border-white/10 bg-white/5 hover:bg-white/10">
                <Play className="w-4 h-4" />
                Watch Demo
              </Button>
              <Link href="/dashboard">
                <Button className="bg-gradient-to-r from-[#0052FF] to-[#3387FF] text-white hover:opacity-90 gap-2">
                  Launch App
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative mx-auto max-w-5xl">
            <div className="relative bg-black/80 p-8 rounded-xl border border-white/10 backdrop-blur-xl">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                  <h3 className="text-xl font-semibold mb-4">Permission Budget</h3>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-[#0052FF]">$15</p>
                    <p className="text-xs text-gray-400 mt-2">Monthly Limit</p>
                  </div>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Used</span>
                      <span className="text-white">$3.40</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Remaining</span>
                      <span className="text-[#3387FF]">$11.60</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                  <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-[#0052FF]"></div>
                      <span className="text-gray-400">Wallet Security Audit</span>
                      <span className="ml-auto text-white">$0.15</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-[#3387FF]"></div>
                      <span className="text-gray-400">Wallet Reputation</span>
                      <span className="ml-auto text-white">$0.10</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-[#0052FF]"></div>
                      <span className="text-gray-400">Contract Inspector</span>
                      <span className="ml-auto text-white">$0.05</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                  <h3 className="text-xl font-semibold mb-4">This Month</h3>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-3xl font-bold text-[#0052FF]">18</p>
                      <p className="text-xs text-gray-400">Services Used</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-[#3387FF]">$1.80</p>
                      <p className="text-xs text-gray-400">Total Spent</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-sm text-gray-400">Avg per service</p>
                    <p className="text-2xl font-bold text-white">$0.10</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 px-6 bg-black">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-[#0052FF] to-[#3387FF]">
            Pay Per Feature
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Only pay when you actually use advanced analytics features. No subscriptions, no waste.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((feature) => {
              const serviceLinks: Record<string, string> = {
                CONTRACT_INSPECTOR: "/services/contract-inspector",
                WALLET_REPUTATION: "/services/wallet-reputation",
                WALLET_AUDIT: "/services/wallet-audit",
              };
              
              return (
                <Link 
                  key={feature.id} 
                  href={serviceLinks[feature.id]}
                  className="bg-white/5 p-6 rounded-xl border border-white/10 hover:border-[#0052FF]/50 hover:bg-white/10 transition-all group"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4 p-3 rounded-full bg-white/5 group-hover:bg-[#0052FF]/20 transition-colors text-4xl">{feature.icon}</div>
                    <div className="text-2xl font-bold text-[#0052FF] mb-2">${feature.cost}</div>
                    <h3 className="text-xl font-semibold mb-2">{feature.name}</h3>
                    <p className="text-gray-400 text-sm mb-4">{feature.description}</p>
                    <div className="inline-block px-3 py-1 bg-[#0052FF]/10 text-[#0052FF] rounded-full text-xs font-medium capitalize">
                      {feature.category}
                    </div>
                    <div className="mt-4 text-[#0052FF] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Try Service →
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 px-6 bg-black">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
            How It Works
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Three simple steps to start using permission-metered analytics
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative bg-white/5 p-8 rounded-xl border border-white/10">
              <div className="absolute -top-4 -right-4 h-12 w-12 rounded-full bg-gradient-to-br from-[#0052FF] to-[#3387FF] flex items-center justify-center font-bold text-2xl">
                1
              </div>
              <div className="mb-4 p-3 rounded-full bg-white/5 w-fit">
                <Shield className="h-8 w-8 text-[#0052FF]" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Grant Permission</h3>
              <p className="text-gray-400">
                Set your monthly budget (e.g., 15 USDC) and authorize usage with MetaMask Advanced Permissions. No funds transferred upfront.
              </p>
            </div>

            <div className="relative bg-white/5 p-8 rounded-xl border border-white/10">
              <div className="absolute -top-4 -right-4 h-12 w-12 rounded-full bg-gradient-to-br from-[#0052FF] to-[#3387FF] flex items-center justify-center font-bold text-2xl">
                2
              </div>
              <div className="mb-4 p-3 rounded-full bg-white/5 w-fit">
                <Zap className="h-8 w-8 text-[#3387FF]" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Use Features</h3>
              <p className="text-gray-400">
                Execute advanced features whenever you need them. No wallet popups—permission already granted. Pay only for what you use.
              </p>
            </div>

            <div className="relative bg-white/5 p-8 rounded-xl border border-white/10">
              <div className="absolute -top-4 -right-4 h-12 w-12 rounded-full bg-gradient-to-br from-[#0052FF] to-[#3387FF] flex items-center justify-center font-bold text-2xl">
                3
              </div>
              <div className="mb-4 p-3 rounded-full bg-white/5 w-fit">
                <BarChart3 className="h-8 w-8 text-[#0052FF]" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Track Usage</h3>
              <p className="text-gray-400">
                Monitor spending in real-time with complete on-chain transparency powered by Envio. Audit every dollar spent.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section id="pricing" className="py-16 px-6 bg-black">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
            Traditional SaaS vs PermiPay
          </h2>
          <p className="text-gray-400 text-center mb-12">
            See why permission-metered billing is the future
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/5 p-8 rounded-xl border border-white/10">
              <h3 className="text-xl font-semibold mb-6 text-gray-400">Traditional SaaS</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✕</span>
                  <span className="text-gray-400">Monthly subscription</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✕</span>
                  <span className="text-gray-400">Backend billing</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✕</span>
                  <span className="text-gray-400">Trust-based payments</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✕</span>
                  <span className="text-gray-400">Opaque invoices</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#0052FF]/10 to-[#3387FF]/10 p-8 rounded-xl border border-[#0052FF]/30">
              <h3 className="text-xl font-semibold mb-6 text-white">PermiPay Analytics</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#0052FF] flex-shrink-0 mt-1" />
                  <span className="text-white">Permission-bounded usage</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#0052FF] flex-shrink-0 mt-1" />
                  <span className="text-white">Wallet-enforced billing</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#0052FF] flex-shrink-0 mt-1" />
                  <span className="text-white">Cryptographically enforced</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#0052FF] flex-shrink-0 mt-1" />
                  <span className="text-white">On-chain, auditable usage</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 relative overflow-hidden bg-black hero-gradient">
        <div className="dotted-grid absolute inset-0"></div>
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold">
            Ready to Stop Overpaying?
          </h2>
          <p className="text-gray-400 text-xl">
            Join the future of Web3 analytics with permission-metered billing
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/dashboard">
              <Button size="lg" className="bg-gradient-to-r from-[#0052FF] to-[#3387FF] text-white hover:opacity-90 gap-2 text-lg px-8">
                Launch App
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-lg px-8">
              View Documentation
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6 bg-black">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0052FF] to-[#3387FF] flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-xl">PermiPay</span>
            </div>
            <p className="text-sm text-gray-400">
              Permission-metered Web3 analytics. Built for MetaMask × Envio Hackathon 2025.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Product</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Technology</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>MetaMask Advanced Permissions</li>
              <li>Envio Indexer</li>
              <li>Base Network</li>
              <li>ERC-7715</li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-white/10 text-center text-sm text-gray-400">
          <p>© 2025 PermiPay Analytics. Built with ❤️ for the MetaMask × Envio Hackathon.</p>
        </div>
      </footer>
    </div>
  );
}
