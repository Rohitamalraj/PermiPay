"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, CheckCircle2, XCircle, ExternalLink, Zap, Clock, AlertCircle, Info } from "lucide-react";
import { PermissionCard } from "@/components/permissions/PermissionCard";
import { SmartAccountSetup } from "@/components/permissions/SmartAccountSetup";
import { useAdvancedPermissions, ServiceType } from "@/hooks/useAdvancedPermissions";

interface TokenApproval {
  token: {
    address: string;
    name: string;
    symbol: string;
    balance: string;
    decimals: number;
  };
  spender: {
    address: string;
    name: string;
    isVerified: boolean;
    lastUsed: number;
  };
  allowance: string;
  isUnlimited: boolean;
  riskLevel: "high" | "medium" | "low";
  recommendation: string;
}

interface AuditData {
  address: string;
  securityScore: number;
  totalApprovals: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  approvals: TokenApproval[];
  recommendations: string[];
  lastAuditTime: number;
}

export default function WalletAuditPage() {
  const { address, isConnected } = useAccount();
  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [auditData, setAuditData] = useState<AuditData | null>(null);
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

  const permissionStatus = getPermissionStatus(ServiceType.WALLET_AUDIT);
  const hasPermission = permissionStatus?.hasPermission && permissionStatus.isActive;

  const auditWallet = async () => {
    if (!walletAddress) {
      setError("Please enter a wallet address");
      return;
    }

    if (!hasPermission) {
      setShowPermissionCard(true);
      setError("Please grant permission first to use this service");
      return;
    }

    setLoading(true);
    setError("");
    setAuditData(null);
    setTransactionHash(null);
    setAiAnalysis(null);

    try {
      // Execute service using Advanced Permissions
      const txHash = await executeService(
        ServiceType.WALLET_AUDIT,
        walletAddress as `0x${string}`
      );
      
      if (!txHash) {
        throw new Error("Failed to execute service payment");
      }

      setTransactionHash(txHash);

      // Fetch audit data
      const response = await fetch(
        `/api/services/wallet-audit?address=${walletAddress}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch audit data");
      }

      const data = await response.json();
      setAuditData(data);

      // Fetch AI analysis
      setAiLoading(true);
      try {
        console.log("🤖 Fetching AI security analysis...");
        const aiResponse = await fetch("/api/ai/analyze-audit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            address: walletAddress,
            auditData: data,
          }),
        });

        console.log("🤖 AI Response status:", aiResponse.status);

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          console.log("🤖 AI Analysis received");
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
      const errorMessage = err.message || "Failed to audit wallet";
      
      if (errorMessage.includes("transfer amount exceeds balance") || 
          errorMessage.includes("insufficient")) {
        setError("Insufficient USDC balance. You need at least $0.15 USDC to use this service.");
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

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { color: "bg-green-400/10 text-green-400 border-green-400/30", label: "SECURE" };
    if (score >= 50) return { color: "bg-yellow-400/10 text-yellow-400 border-yellow-400/30", label: "NEEDS ATTENTION" };
    return { color: "bg-red-400/10 text-red-400 border-red-400/30", label: "AT RISK" };
  };

  const getRiskColor = (level: string) => {
    if (level === "high") return "text-red-400 bg-red-400/10 border-red-400/30";
    if (level === "medium") return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";
    return "text-green-400 bg-green-400/10 border-green-400/30";
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 30) return `${days} days ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black pt-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Connect Your Wallet</h1>
          <p className="text-gray-400 mb-8">
            Please connect your wallet to use Wallet Security Audit
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
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Wallet Security Audit</h1>
              <p className="text-gray-400">
                Identify risky token approvals and protect your assets
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Service Cost</p>
                  <p className="text-3xl font-bold text-purple-400">$0.15</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400 mb-1">Per Audit</p>
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

          {!hasPermission && (
            <div className="mb-6">
              <PermissionCard
                serviceType={ServiceType.WALLET_AUDIT}
                serviceName="Wallet Security Audit"
                serviceDescription="Scan for risky token approvals and security vulnerabilities"
                serviceIcon={<Shield className="h-5 w-5 text-purple-400" />}
                onPermissionGranted={() => {
                  setShowPermissionCard(false);
                  setError("");
                }}
              />
            </div>
          )}

          <div className="mb-6">
            <SmartAccountSetup />
          </div>
        </div>

        {/* Input Section */}
        <Card className="bg-white/5 border-white/10 p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Enter Wallet Address to Audit</h2>
          
          <div className="flex gap-4">
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="0x..."
              className="flex-1 px-6 py-4 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 text-lg"
            />
            <Button
              onClick={auditWallet}
              disabled={loading}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 px-8 py-4 text-lg"
            >
              {loading ? (
                "Auditing..."
              ) : (
                <>
                  <Shield className="h-5 w-5 mr-2" />
                  Start Audit
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-400">{error}</p>
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
              Audit My Wallet
            </button>
          )}
        </Card>

        {/* Results Section */}
        {auditData && (
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
                      AI Security Analysis
                    </h3>
                    <p className="text-sm text-gray-400">Powered by Groq & Llama 3.3 70B</p>
                  </div>
                </div>

                {aiLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                    <p className="ml-4 text-gray-400">Analyzing security risks with AI...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {aiAnalysis?.split('\n\n').map((paragraph, idx) => {
                      if (paragraph.trim().startsWith('**')) {
                        const heading = paragraph.replace(/\*\*/g, '').trim();
                        return (
                          <h4 key={idx} className="text-lg font-bold text-purple-300 mt-6 first:mt-0">
                            {heading}
                          </h4>
                        );
                      }
                      
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

            {/* Security Score */}
            <Card className="bg-white/5 border-white/10 p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Security Score</h3>
                  <p className="text-gray-400 font-mono text-sm">{auditData.address}</p>
                </div>
                <div className={`px-4 py-2 rounded-lg border ${getScoreBadge(auditData.securityScore).color}`}>
                  <span className="font-semibold">{getScoreBadge(auditData.securityScore).label}</span>
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
                      strokeDasharray={`${(auditData.securityScore / 100) * 502.65} 502.65`}
                      className={getScoreColor(auditData.securityScore)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className={`text-6xl font-bold ${getScoreColor(auditData.securityScore)}`}>
                      {auditData.securityScore}
                    </p>
                    <p className="text-gray-400 text-sm mt-2">out of 100</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 mt-8">
                <div className="text-center p-4 bg-black/40 rounded-lg border border-white/10">
                  <p className="text-2xl font-bold">{auditData.totalApprovals}</p>
                  <p className="text-sm text-gray-400 mt-1">Total</p>
                </div>
                <div className="text-center p-4 bg-red-400/10 rounded-lg border border-red-400/30">
                  <p className="text-2xl font-bold text-red-400">{auditData.highRiskCount}</p>
                  <p className="text-sm text-gray-400 mt-1">High Risk</p>
                </div>
                <div className="text-center p-4 bg-yellow-400/10 rounded-lg border border-yellow-400/30">
                  <p className="text-2xl font-bold text-yellow-400">{auditData.mediumRiskCount}</p>
                  <p className="text-sm text-gray-400 mt-1">Medium Risk</p>
                </div>
                <div className="text-center p-4 bg-green-400/10 rounded-lg border border-green-400/30">
                  <p className="text-2xl font-bold text-green-400">{auditData.lowRiskCount}</p>
                  <p className="text-sm text-gray-400 mt-1">Low Risk</p>
                </div>
              </div>
            </Card>

            {/* Recommendations */}
            {auditData.recommendations.length > 0 && (
              <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30 p-8">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <Info className="h-6 w-6 text-blue-400" />
                  Recommendations
                </h3>
                <ul className="space-y-3">
                  {auditData.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-sm font-bold text-blue-400">{i + 1}</span>
                      </div>
                      <span className="text-gray-300 leading-relaxed">{rec}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Approvals List */}
            <Card className="bg-white/5 border-white/10 p-8">
              <h3 className="text-2xl font-bold mb-6">Token Approvals ({auditData.totalApprovals})</h3>
              
              {auditData.approvals.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="h-16 w-16 text-green-400 mx-auto mb-4" />
                  <h4 className="text-xl font-bold mb-2">No Active Approvals Found</h4>
                  <p className="text-gray-400">
                    Great! Your wallet has no token approvals that could pose a security risk.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {auditData.approvals.map((approval, idx) => (
                    <div
                      key={idx}
                      className={`p-6 rounded-lg border ${
                        approval.riskLevel === "high" 
                          ? "bg-red-500/5 border-red-500/30" 
                          : approval.riskLevel === "medium"
                          ? "bg-yellow-500/5 border-yellow-500/30"
                          : "bg-green-500/5 border-green-500/30"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-xl font-bold">{approval.token.symbol}</h4>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRiskColor(approval.riskLevel)}`}>
                              {approval.riskLevel.toUpperCase()}
                            </span>
                            {approval.isUnlimited && (
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                UNLIMITED
                              </span>
                            )}
                          </div>
                          <p className="text-gray-400 text-sm">{approval.token.name}</p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Approved To</p>
                          <p className="font-mono text-sm">{approval.spender.name}</p>
                          <p className="font-mono text-xs text-gray-500">{approval.spender.address}</p>
                          {!approval.spender.isVerified && (
                            <span className="inline-flex items-center gap-1 text-xs text-yellow-400 mt-1">
                              <AlertTriangle className="h-3 w-3" />
                              Unverified Contract
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Last Used</p>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <p className="text-sm">{formatTimestamp(approval.spender.lastUsed)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-black/40 rounded-lg border border-white/10 mb-4">
                        <p className="text-sm text-gray-400 mb-1">Recommendation</p>
                        <p className="text-sm">{approval.recommendation}</p>
                      </div>

                      <a
                        href={`https://sepolia.etherscan.io/address/${approval.spender.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        View Contract on Etherscan
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Empty State */}
        {!auditData && !loading && !error && (
          <Card className="bg-white/5 border-white/10 p-12 text-center">
            <Shield className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No Wallet Audited Yet</h3>
            <p className="text-gray-400">
              Enter a wallet address above to start security audit
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
