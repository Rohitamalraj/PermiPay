'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Zap, Shield, BarChart3, Play } from 'lucide-react';
import { ConnectButton } from '@/components/wallet/ConnectButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FEATURES } from '@/constants/features';
import GridScan from '@/components/ui/GridScan';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-black">
      {/* Navigation */}
      <motion.header 
        className="fixed top-0 left-0 right-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between px-6 py-4 backdrop-blur-xl bg-black/50 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-3">
              <motion.div 
                className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff9e00] to-[#fbbf24] flex items-center justify-center glow-orange"
                whileHover={{ scale: 1.1, rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                <Zap className="h-4 w-4 text-black" />
              </motion.div>
              <span className="font-bold text-white text-lg">PermiPay</span>
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
            <Link href="#pricing" className="text-sm text-gray-300 hover:text-white transition-colors">
              Pricing
            </Link>
          </nav>
          <ConnectButton />
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden bg-black flex items-center justify-center">
        {/* Animated Grid Background */}
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-auto">
          <GridScan
            sensitivity={0.55}
            lineThickness={1}
            linesColor="#1a1300"
            gridScale={0.1}
            scanColor="#ff9e00"
            scanOpacity={0.4}
            enablePost
            bloomIntensity={0.6}
            chromaticAberration={0.002}
            noiseIntensity={0.01}
            scanGlow={0.5}
            scanSoftness={2}
            scanPhaseTaper={0.9}
            scanDirection="pingpong"
            scanDuration={2.0}
            scanDelay={2.0}
          />
        </div>
        {/* Fallback gradient */}
        <div className="absolute inset-0 z-0 hero-gradient opacity-50 pointer-events-none"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-6 pointer-events-auto">
          <div className="text-center">
            <motion.h1 
              className="text-4xl md:text-6xl font-bold mb-6 tracking-tight leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="block">Pay for What You</span>
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-[#ff9e00] via-[#fbbf24] to-[#ff9e00]">
                Actually Use.
              </span>
              <span className="block text-2xl md:text-3xl text-gray-400 mt-4 font-normal">
                Not what you might.
              </span>
            </motion.h1>
            <motion.p 
              className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Permission-metered Web3 analytics. Pay only when you actually use advanced features.
              No blind recurring charges. Built on MetaMask Advanced Permissions & Envio.
            </motion.p>

            {/* Hero Buttons */}
            <motion.div 
              className="flex flex-wrap gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Link href="/dashboard">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-[#ff9e00] to-[#fbbf24] text-black hover:opacity-90 font-semibold px-8"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button 
                size="lg"
                variant="outline"
                className="border-[#ff9e00] text-[#ff9e00] hover:bg-[#ff9e00] hover:text-black font-semibold px-8"
                onClick={() => {
                  const servicesSection = document.getElementById('services');
                  servicesSection?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Explore Services
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-16 px-6 bg-black">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-[#ff9e00] to-[#fbbf24]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Your Usage at a Glance
          </motion.h2>
          <motion.p 
            className="text-gray-400 text-center mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Track your spending and monitor your permission budget in real-time.
          </motion.p>

          <motion.div 
            className="relative mx-auto max-w-5xl"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative bg-black/80 p-8 rounded-xl border border-white/10 backdrop-blur-xl">
              <div className="grid md:grid-cols-3 gap-8">
                <motion.div 
                  className="bg-white/5 p-6 rounded-xl border border-white/10"
                  whileHover={{ scale: 1.05, borderColor: 'rgba(255, 158, 0, 0.3)' }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="text-xl font-semibold mb-4">Permission Budget</h3>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-[#ff9e00]">$15</p>
                    <p className="text-xs text-gray-400 mt-2">Monthly Limit</p>
                  </div>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Used</span>
                      <span className="text-white">$3.40</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Remaining</span>
                      <span className="text-[#fbbf24]">$11.60</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  className="bg-white/5 p-6 rounded-xl border border-white/10"
                  whileHover={{ scale: 1.05, borderColor: 'rgba(255, 158, 0, 0.3)' }}
                  transition={{ duration: 0.2 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-[#ff9e00]"></div>
                      <span className="text-gray-400">Wallet Security Audit</span>
                      <span className="ml-auto text-white">$0.15</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-[#fbbf24]"></div>
                      <span className="text-gray-400">Wallet Reputation</span>
                      <span className="ml-auto text-white">$0.10</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-[#ff9e00]"></div>
                      <span className="text-gray-400">Contract Inspector</span>
                      <span className="ml-auto text-white">$0.05</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  className="bg-white/5 p-6 rounded-xl border border-white/10"
                  whileHover={{ scale: 1.05, borderColor: 'rgba(255, 158, 0, 0.3)' }}
                  transition={{ duration: 0.2 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-xl font-semibold mb-4">This Month</h3>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-3xl font-bold text-[#ff9e00]">18</p>
                      <p className="text-xs text-gray-400">Services Used</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-[#fbbf24]">$1.80</p>
                      <p className="text-xs text-gray-400">Total Spent</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-sm text-gray-400">Avg per service</p>
                    <p className="text-2xl font-bold text-white">$0.10</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-16 px-6 bg-black">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-[#ff9e00] to-[#fbbf24]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Pay Per Feature
          </motion.h2>
          <motion.p 
            className="text-gray-400 text-center mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Only pay when you actually use advanced analytics features. No subscriptions, no waste.
          </motion.p>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => {
              const serviceLinks: Record<string, string> = {
                CONTRACT_INSPECTOR: "/services/contract-inspector",
                WALLET_REPUTATION: "/services/wallet-reputation",
                WALLET_AUDIT: "/services/wallet-audit",
              };
              
              return (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                >
                  <Link 
                    href={serviceLinks[feature.id]}
                    className="block bg-white/5 p-6 rounded-xl border border-white/10 hover:border-[#ff9e00]/50 hover:bg-white/10 hover:scale-105 transition-all group"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-4 p-3 rounded-full bg-white/5 group-hover:bg-[#ff9e00]/20 transition-colors text-4xl">{feature.icon}</div>
                      <div className="text-2xl font-bold text-[#ff9e00] mb-2">${feature.cost}</div>
                      <h3 className="text-xl font-semibold mb-2">{feature.name}</h3>
                      <p className="text-gray-400 text-sm mb-4">{feature.description}</p>
                      <div className="inline-block px-3 py-1 bg-[#ff9e00]/10 text-[#fbbf24] rounded-full text-xs font-medium capitalize">
                        {feature.category}
                      </div>
                      <div className="mt-4 text-[#ff9e00] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Try Service →
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 px-6 bg-black">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-4 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            How It Works
          </motion.h2>
          <motion.p 
            className="text-gray-400 text-center mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Three simple steps to start using permission-metered analytics
          </motion.p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              className="relative bg-white/5 p-8 rounded-xl border border-white/10"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ scale: 1.05, borderColor: 'rgba(255, 158, 0, 0.3)' }}
            >
              <motion.div 
                className="absolute -top-4 -right-4 h-12 w-12 rounded-full bg-gradient-to-br from-[#ff9e00] to-[#fbbf24] flex items-center justify-center font-bold text-2xl text-black"
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                1
              </motion.div>
              <div className="mb-4 p-3 rounded-full bg-white/5 w-fit">
                <Shield className="h-8 w-8 text-[#ff9e00]" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Grant Permission</h3>
              <p className="text-gray-400">
                Set your monthly budget (e.g., 15 USDC) and authorize usage with MetaMask Advanced Permissions. No funds transferred upfront.
              </p>
            </motion.div>

            <motion.div 
              className="relative bg-white/5 p-8 rounded-xl border border-white/10"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ scale: 1.05, borderColor: 'rgba(251, 191, 36, 0.3)' }}
            >
              <motion.div 
                className="absolute -top-4 -right-4 h-12 w-12 rounded-full bg-gradient-to-br from-[#ff9e00] to-[#fbbf24] flex items-center justify-center font-bold text-2xl text-black"
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                2
              </motion.div>
              <div className="mb-4 p-3 rounded-full bg-white/5 w-fit">
                <Zap className="h-8 w-8 text-[#fbbf24]" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Use Features</h3>
              <p className="text-gray-400">
                Execute advanced features whenever you need them. No wallet popups—permission already granted. Pay only for what you use.
              </p>
            </motion.div>

            <motion.div 
              className="relative bg-white/5 p-8 rounded-xl border border-white/10"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ scale: 1.05, borderColor: 'rgba(255, 158, 0, 0.3)' }}
            >
              <motion.div 
                className="absolute -top-4 -right-4 h-12 w-12 rounded-full bg-gradient-to-br from-[#ff9e00] to-[#fbbf24] flex items-center justify-center font-bold text-2xl text-black"
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                3
              </motion.div>
              <div className="mb-4 p-3 rounded-full bg-white/5 w-fit">
                <BarChart3 className="h-8 w-8 text-[#ff9e00]" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Track Usage</h3>
              <p className="text-gray-400">
                Monitor spending in real-time with complete on-chain transparency powered by Envio. Audit every dollar spent.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section id="pricing" className="py-16 px-6 bg-black">
        <div className="max-w-4xl mx-auto">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-4 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Traditional SaaS vs PermiPay
          </motion.h2>
          <motion.p 
            className="text-gray-400 text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            See why permission-metered billing is the future
          </motion.p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div 
              className="bg-white/5 p-8 rounded-xl border border-white/10"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="text-xl font-semibold mb-6 text-gray-400">Traditional SaaS</h3>
              <div className="space-y-4">
                <motion.div 
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                >
                  <span className="text-red-500 mt-1">✕</span>
                  <span className="text-gray-400">Monthly subscription</span>
                </motion.div>
                <motion.div 
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                >
                  <span className="text-red-500 mt-1">✕</span>
                  <span className="text-gray-400">Backend billing</span>
                </motion.div>
                <motion.div 
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                >
                  <span className="text-red-500 mt-1">✕</span>
                  <span className="text-gray-400">Trust-based payments</span>
                </motion.div>
                <motion.div 
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.7 }}
                >
                  <span className="text-red-500 mt-1">✕</span>
                  <span className="text-gray-400">Opaque invoices</span>
                </motion.div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-gradient-to-br from-[#ff9e00]/10 to-[#fbbf24]/10 p-8 rounded-xl border border-[#ff9e00]/30 glow-orange"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="text-xl font-semibold mb-6 text-white">PermiPay Analytics</h3>
              <div className="space-y-4">
                <motion.div 
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                >
                  <Check className="h-5 w-5 text-[#ff9e00] flex-shrink-0 mt-1" />
                  <span className="text-white">Permission-bounded usage</span>
                </motion.div>
                <motion.div 
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                >
                  <Check className="h-5 w-5 text-[#ff9e00] flex-shrink-0 mt-1" />
                  <span className="text-white">Wallet-enforced billing</span>
                </motion.div>
                <motion.div 
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                >
                  <Check className="h-5 w-5 text-[#ff9e00] flex-shrink-0 mt-1" />
                  <span className="text-white">Cryptographically enforced</span>
                </motion.div>
                <motion.div 
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.7 }}
                >
                  <Check className="h-5 w-5 text-[#ff9e00] flex-shrink-0 mt-1" />
                  <span className="text-white">On-chain, auditable usage</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 relative overflow-hidden bg-black hero-gradient">
        <div className="dotted-grid absolute inset-0"></div>
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Ready to Stop Overpaying?
          </motion.h2>
          <motion.p 
            className="text-gray-400 text-xl"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Join the future of Web3 analytics with permission-metered billing
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link href="/dashboard">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button size="lg" className="bg-gradient-to-r from-[#ff9e00] to-[#fbbf24] text-black font-semibold hover:opacity-90 gap-2 text-lg px-8 glow-orange">
                  Launch App
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </motion.div>
            </Link>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button size="lg" variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-lg px-8">
                View Documentation
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <motion.footer 
        className="border-t border-white/10 py-12 px-6 bg-black"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex items-center gap-2">
              <motion.div 
                className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff9e00] to-[#fbbf24] flex items-center justify-center glow-orange"
                whileHover={{ scale: 1.1, rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                <Zap className="h-4 w-4 text-black" />
              </motion.div>
              <span className="font-bold text-xl">PermiPay</span>
            </div>
            <p className="text-sm text-gray-400">
              Permission-metered Web3 analytics. Built for MetaMask × Envio Hackathon 2025.
            </p>
          </motion.div>

          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="font-semibold">Product</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/dashboard" className="hover:text-[#ff9e00] transition-colors">Dashboard</Link></li>
              <li><Link href="#features" className="hover:text-[#ff9e00] transition-colors">Features</Link></li>
              <li><Link href="#pricing" className="hover:text-[#ff9e00] transition-colors">Pricing</Link></li>
            </ul>
          </motion.div>

          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h4 className="font-semibold">Technology</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>MetaMask Advanced Permissions</li>
              <li>Envio Indexer</li>
              <li>Base Network</li>
              <li>ERC-7715</li>
            </ul>
          </motion.div>
        </div>

        <motion.div 
          className="max-w-6xl mx-auto mt-12 pt-8 border-t border-white/10 text-center text-sm text-gray-400"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <p>© 2025 PermiPay Analytics. Built with ❤️ for the MetaMask × Envio Hackathon.</p>
        </motion.div>
      </motion.footer>
    </div>
  );
}
