"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, AlertCircle, TrendingUp, Activity, Clock, Search, Zap, CheckCircle2, ExternalLink } from "lucide-react";
import { PermissionCard } from "@/components/permissions/PermissionCard";
import { SmartAccountSetup } from "@/components/permissions/SmartAccountSetup";
import { useAdvancedPermissions, ServiceType } from "@/hooks/useAdvancedPermissions";

interface ReputationData {
  address: string;
  overallScore: number; // 0-100
  riskLevel: "low" | "medium" | "high";
  metrics: {
    transactionCount: number;
    accountAge: number; // days
    avgTransactionValue: number;
    uniqueInteractions: number;
    contractInteractions: number;
    tokenDiversity: number;
  };
  behaviorPatterns: {
    isActiveTrader: boolean;
    isDeFiUser: boolean;
    isNFTCollector: boolean;
    hasLargeTransactions: boolean;
  };
  riskFlags: string[];
  trustIndicators: string[];
}

export default function WalletReputationPage() {
  const { address, isConnected } = useAccount();
  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [reputationData, setReputationData] = useState<ReputationData | null>(null);
  const [error, setError] = useState("");
  const [showPermissionCard, setShowPermissionCard] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const { 
    executeService, 
    getPermissionStatus,
    isLoading: permissionLoading 
  } = useAdvancedPermissions();

  const permissionStatus = getPermissionStatus(ServiceType.WALLET_REPUTATION);
  const hasPermission = permissionStatus?.hasPermission && permissionStatus.isActive;

  const analyzeWallet = async () => {
    if (!walletAddress) {
      setError("Please enter a wallet address");
      return;
    }

    // Check if user has granted permission
    if (!hasPermission) {
      setShowPermissionCard(true);
      setError("Please grant permission first to use this service");
      return;
    }

    setLoading(true);
    setError("");
    setReputationData(null);
    setTransactionHash(null);
    setAiAnalysis(null);
    setAiLoading(false);

    try {
      // Execute service using Advanced Permissions (charges $0.10 automatically)
      const txHash = await executeService(
        ServiceType.WALLET_REPUTATION,
        walletAddress as `0x${string}`
      );
      
      if (!txHash) {
        throw new Error("Failed to execute service payment");
      }

      // Store transaction hash
      setTransactionHash(txHash);

      // Fetch reputation data from Etherscan API
      const response = await fetch(
        `/api/services/wallet-reputation?address=${walletAddress}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch reputation data");
      }

      const data = await response.json();
      setReputationData(data);

      // Fetch AI analysis (don't let this block the main flow)
      setAiLoading(true);
      try {
        console.log("🤖 Fetching AI analysis for wallet...");
        const aiResponse = await fetch("/api/ai/analyze-wallet", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            address: walletAddress,
            reputationData: data,
          }),
        });

        console.log("🤖 AI Response status:", aiResponse.status);

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          console.log("🤖 AI Analysis received:", aiData);
          setAiAnalysis(aiData.analysis);
        } else {
          const errorText = await aiResponse.text();
          console.error("🤖 AI analysis error:", errorText);
        }
      } catch (aiErr) {
        console.error("🤖 AI analysis failed:", aiErr);
      } finally {
        setAiLoading(false);
      }

    } catch (err: any) {
      const errorMessage = err.message || "Failed to analyze wallet";
      
      // Check for insufficient balance error
      if (errorMessage.includes("transfer amount exceeds balance") || 
          errorMessage.includes("insufficient")) {
        setError("Insufficient USDC balance. You need at least $0.10 USDC to use this service. Get test USDC from a Sepolia faucet.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 50) return "text-yellow-400";
    return "text-red-400";
  };

  const getRiskBadge = (level: string) => {
    const colors = {
      low: "bg-green-400/10 text-green-400 border-green-400/30",
      medium: "bg-yellow-400/10 text-yellow-400 border-yellow-400/30",
      high: "bg-red-400/10 text-red-400 border-red-400/30",
    };
    return colors[level as keyof typeof colors] || colors.medium;
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black pt-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Connect Your Wallet</h1>
          <p className="text-gray-400 mb-8">
            Please connect your wallet to use Wallet Reputation Score
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-32 px-6 pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0052FF] to-[#3387FF] flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Wallet Reputation Score</h1>
              <p className="text-gray-400">
                Behavior-based scoring using on-chain activity analysis
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="bg-gradient-to-br from-[#0052FF]/10 to-[#3387FF]/10 border-[#0052FF]/30 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Service Cost</p>
                  <p className="text-3xl font-bold text-[#0052FF]">$0.10</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400 mb-1">Per Analysis</p>
                  <div className="flex items-center gap-2 text-green-400">
                    <Zap className="h-4 w-4" />
                    <p className="text-lg">Auto-charged</p>
                  </div>
                </div>
              </div>
            </Card>

            {hasPermission && (
              <Card className="bg-gradient-to-br from-green-500/10 to-blue-500/10 border-green-500/30 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Permission Status</p>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                      <p className="text-xl font-bold text-green-400">Active</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400 mb-1">Budget Remaining</p>
                    <p className="text-lg font-semibold">
                      ${(Number(permissionStatus?.remainingBudget || 0n) / 1_000_000).toFixed(2)}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Permission Setup */}
          {!hasPermission && (
            <div className="mb-6">
              <PermissionCard
                serviceType={ServiceType.WALLET_REPUTATION}
                serviceName="Wallet Reputation"
                serviceDescription="Advanced on-chain reputation scoring and risk assessment"
                serviceIcon={<ShieldCheck className="h-5 w-5 text-blue-400" />}
                onPermissionGranted={() => {
                  setShowPermissionCard(false);
                  setError("");
                }}
              />
            </div>
          )}

          {/* Smart Account Check */}
          <div className="mb-6">
            <SmartAccountSetup />
          </div>
        </div>

        {/* Input Section */}
        <Card className="bg-white/5 border-white/10 p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Enter Wallet Address</h2>
          
          <div className="flex gap-4">
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="0x..."
              className="flex-1 px-6 py-4 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#0052FF] text-lg"
            />
            <Button
              onClick={analyzeWallet}
              disabled={loading}
              className="bg-gradient-to-r from-[#0052FF] to-[#3387FF] text-white hover:opacity-90 px-8 py-4 text-lg"
            >
              {loading ? (
                "Analyzing..."
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  Analyze Reputation
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-400 mb-2">{error}</p>
                  {(error.includes("Insufficient") || error.includes("balance")) && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-400">
                        Get free test USDC from these faucets:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <a
                          href="https://faucet.circle.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-sm text-blue-400 transition-colors"
                        >
                          Circle Faucet
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {transactionHash && (
            <div className="mt-4 flex items-center justify-between bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle2 className="h-5 w-5" />
                <p className="font-semibold">Payment Successful</p>
              </div>
              <a
                href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <span className="text-sm font-mono">
                  {transactionHash.slice(0, 6)}...{transactionHash.slice(-4)}
                </span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          )}

          {address && (
            <button
              onClick={() => setWalletAddress(address)}
              className="mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition-colors"
            >
              Analyze My Wallet
            </button>
          )}
        </Card>

        {/* Results Section */}
        {reputationData && (
          <div className="space-y-6">
            {/* AI Analysis Section */}
            {(aiAnalysis || aiLoading) && (
              <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      AI-Powered Reputation Analysis
                    </h3>
                    <p className="text-sm text-gray-400">Powered by Groq & Llama 3.3 70B</p>
                  </div>
                </div>

                {aiLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                    <p className="ml-4 text-gray-400">Analyzing wallet reputation with AI...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {aiAnalysis?.split('\n\n').map((paragraph, idx) => {
                      // Check if it's a heading (starts with **)
                      if (paragraph.trim().startsWith('**')) {
                        const heading = paragraph.replace(/\*\*/g, '').trim();
                        return (
                          <h4 key={idx} className="text-lg font-bold text-purple-300 mt-6 first:mt-0">
                            {heading}
                          </h4>
                        );
                      }
                      
                      // Check if it's a list item (starts with * or -)
                      if (paragraph.trim().startsWith('*') || paragraph.trim().startsWith('-')) {
                        const items = paragraph.split('\n').filter(line => line.trim());
                        return (
                          <ul key={idx} className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                            {items.map((item, i) => (
                              <li key={i} className="leading-relaxed">
                                {item.replace(/^[\*\-]\s*/, '').replace(/\*\*/g, '')}
                              </li>
                            ))}
                          </ul>
                        );
                      }

                      // Regular paragraph
                      return (
                        <p key={idx} className="text-gray-300 leading-relaxed">
                          {paragraph.replace(/\*\*/g, '')}
                        </p>
                      );
                    })}
                  </div>
                )}
              </Card>
            )}

            {/* Overall Score */}
            <Card className="bg-white/5 border-white/10 p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Overall Reputation</h3>
                  <p className="text-gray-400 font-mono text-sm">{reputationData.address}</p>
                </div>
                <div className={`px-4 py-2 rounded-lg border ${getRiskBadge(reputationData.riskLevel)}`}>
                  <span className="font-semibold">{reputationData.riskLevel.toUpperCase()} RISK</span>
                </div>
              </div>

              <div className="flex items-center justify-center py-12">
                <div className="relative">
                  <svg className="w-48 h-48 transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      className="text-white/10"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${(reputationData.overallScore / 100) * 502.65} 502.65`}
                      className={getScoreColor(reputationData.overallScore)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className={`text-6xl font-bold ${getScoreColor(reputationData.overallScore)}`}>
                      {reputationData.overallScore}
                    </p>
                    <p className="text-gray-400 text-sm mt-2">out of 100</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Key Metrics */}
            <Card className="bg-white/5 border-white/10 p-8">
              <h3 className="text-2xl font-bold mb-6">Key Metrics</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-black/40 p-6 rounded-lg border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <Activity className="h-5 w-5 text-[#0052FF]" />
                    <span className="text-gray-400">Transaction Count</span>
                  </div>
                  <p className="text-3xl font-bold">{reputationData.metrics.transactionCount.toLocaleString()}</p>
                </div>

                <div className="bg-black/40 p-6 rounded-lg border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="h-5 w-5 text-[#3387FF]" />
                    <span className="text-gray-400">Account Age</span>
                  </div>
                  <p className="text-3xl font-bold">{reputationData.metrics.accountAge}</p>
                  <p className="text-sm text-gray-400">days</p>
                </div>

                <div className="bg-black/40 p-6 rounded-lg border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <TrendingUp className="h-5 w-5 text-[#0052FF]" />
                    <span className="text-gray-400">Avg Transaction</span>
                  </div>
                  <p className="text-3xl font-bold">${reputationData.metrics.avgTransactionValue.toFixed(2)}</p>
                </div>

                <div className="bg-black/40 p-6 rounded-lg border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-gray-400">Unique Interactions</span>
                  </div>
                  <p className="text-3xl font-bold">{reputationData.metrics.uniqueInteractions}</p>
                </div>

                <div className="bg-black/40 p-6 rounded-lg border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-gray-400">Contract Calls</span>
                  </div>
                  <p className="text-3xl font-bold">{reputationData.metrics.contractInteractions}</p>
                </div>

                <div className="bg-black/40 p-6 rounded-lg border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-gray-400">Token Diversity</span>
                  </div>
                  <p className="text-3xl font-bold">{reputationData.metrics.tokenDiversity}</p>
                  <p className="text-sm text-gray-400">unique tokens</p>
                </div>
              </div>
            </Card>

            {/* Behavior Patterns */}
            <Card className="bg-white/5 border-white/10 p-8">
              <h3 className="text-2xl font-bold mb-6">Behavior Patterns</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(reputationData.behaviorPatterns).map(([key, value]) => (
                  <div
                    key={key}
                    className={`flex items-center gap-3 p-4 rounded-lg border ${
                      value ? "bg-[#0052FF]/10 border-[#0052FF]/30" : "bg-white/5 border-white/10"
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${value ? "bg-[#0052FF]" : "bg-gray-600"}`} />
                    <span className={value ? "text-white" : "text-gray-400"}>
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Risk Flags & Trust Indicators */}
            <div className="grid md:grid-cols-2 gap-6">
              {reputationData.riskFlags.length > 0 && (
                <Card className="bg-red-400/5 border-red-400/20 p-8">
                  <h3 className="text-xl font-bold mb-4 text-red-400">Risk Flags</h3>
                  <ul className="space-y-3">
                    {reputationData.riskFlags.map((flag, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">{flag}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {reputationData.trustIndicators.length > 0 && (
                <Card className="bg-green-400/5 border-green-400/20 p-8">
                  <h3 className="text-xl font-bold mb-4 text-green-400">Trust Indicators</h3>
                  <ul className="space-y-3">
                    {reputationData.trustIndicators.map((indicator, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <ShieldCheck className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">{indicator}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!reputationData && !loading && !error && (
          <Card className="bg-white/5 border-white/10 p-12 text-center">
            <ShieldCheck className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No Wallet Analyzed Yet</h3>
            <p className="text-gray-400">
              Enter a wallet address above to analyze reputation
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
