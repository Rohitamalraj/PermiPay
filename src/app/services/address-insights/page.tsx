"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Wallet, DollarSign, ArrowUpRight, ArrowDownRight, Clock, TrendingUp } from "lucide-react";

interface AddressInsight {
  address: string;
  balance: {
    eth: number;
    usd: number;
  };
  tokens: {
    contractAddress: string;
    name: string;
    symbol: string;
    balance: number;
    decimals: number;
    value?: number;
  }[];
  transactions: {
    hash: string;
    from: string;
    to: string;
    value: number;
    timestamp: number;
    isIncoming: boolean;
    success: boolean;
  }[];
  stats: {
    totalTransactions: number;
    totalSent: number;
    totalReceived: number;
    firstActivity: number;
    lastActivity: number;
  };
}

export default function AddressInsightsPage() {
  const { address, isConnected } = useAccount();
  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [insightData, setInsightData] = useState<AddressInsight | null>(null);
  const [error, setError] = useState("");

  const analyzeAddress = async () => {
    if (!walletAddress) {
      setError("Please enter an address");
      return;
    }

    setLoading(true);
    setError("");
    setInsightData(null);

    try {
      // TODO: Implement permission check and auto-billing ($0.50)
      
      const response = await fetch(
        `/api/services/address-insights?address=${walletAddress}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch address insights");
      }

      const data = await response.json();
      setInsightData(data);

    } catch (err: any) {
      setError(err.message || "Failed to analyze address");
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black pt-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Connect Your Wallet</h1>
          <p className="text-gray-400 mb-8">
            Please connect your wallet to use Address Insights
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
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ff9e00] to-[#fbbf24] flex items-center justify-center">
              <Search className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Address Insights</h1>
              <p className="text-gray-400">
                Deep wallet analysis with transaction history, token holdings, and activity metrics
              </p>
            </div>
          </div>

          <Card className="bg-gradient-to-br from-[#ff9e00]/10 to-[#fbbf24]/10 border-[#ff9e00]/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Service Cost</p>
                <p className="text-3xl font-bold text-[#ff9e00]">$0.50</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400 mb-1">Per Analysis</p>
                <p className="text-lg text-white">Charged automatically from permission</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Input Section */}
        <Card className="bg-white/5 border-white/10 p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Enter Address</h2>
          
          <div className="flex gap-4">
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="0x..."
              className="flex-1 px-6 py-4 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#ff9e00] text-lg"
            />
            <Button
              onClick={analyzeAddress}
              disabled={loading}
              className="bg-gradient-to-r from-[#ff9e00] to-[#fbbf24] text-white hover:opacity-90 px-8 py-4 text-lg"
            >
              {loading ? (
                "Analyzing..."
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  Analyze Address
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 text-red-400">
              <span>{error}</span>
            </div>
          )}

          {address && (
            <button
              onClick={() => setWalletAddress(address)}
              className="mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition-colors"
            >
              Analyze My Address
            </button>
          )}
        </Card>

        {/* Results Section */}
        {insightData && (
          <div className="space-y-6">
            {/* Balance Overview */}
            <Card className="bg-white/5 border-white/10 p-8">
              <h3 className="text-2xl font-bold mb-6">Balance Overview</h3>
              <p className="text-gray-400 font-mono text-sm mb-6">{insightData.address}</p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-[#ff9e00]/10 to-[#fbbf24]/10 p-8 rounded-xl border border-[#ff9e00]/30">
                  <div className="flex items-center gap-3 mb-3">
                    <Wallet className="h-6 w-6 text-[#ff9e00]" />
                    <span className="text-gray-400">ETH Balance</span>
                  </div>
                  <p className="text-4xl font-bold mb-2">{insightData.balance.eth.toFixed(4)} ETH</p>
                  <p className="text-lg text-gray-400">${insightData.balance.usd.toFixed(2)} USD</p>
                </div>

                <div className="bg-white/5 p-8 rounded-xl border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <DollarSign className="h-6 w-6 text-[#fbbf24]" />
                    <span className="text-gray-400">Token Holdings</span>
                  </div>
                  <p className="text-4xl font-bold mb-2">{insightData.tokens.length}</p>
                  <p className="text-lg text-gray-400">Unique Tokens</p>
                </div>
              </div>
            </Card>

            {/* Activity Stats */}
            <Card className="bg-white/5 border-white/10 p-8">
              <h3 className="text-2xl font-bold mb-6">Activity Statistics</h3>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="bg-black/40 p-6 rounded-lg border border-white/10">
                  <p className="text-gray-400 text-sm mb-2">Total Transactions</p>
                  <p className="text-3xl font-bold">{insightData.stats.totalTransactions}</p>
                </div>

                <div className="bg-black/40 p-6 rounded-lg border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowUpRight className="h-4 w-4 text-red-400" />
                    <p className="text-gray-400 text-sm">Total Sent</p>
                  </div>
                  <p className="text-3xl font-bold">{insightData.stats.totalSent.toFixed(4)}</p>
                  <p className="text-sm text-gray-400">ETH</p>
                </div>

                <div className="bg-black/40 p-6 rounded-lg border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowDownRight className="h-4 w-4 text-green-400" />
                    <p className="text-gray-400 text-sm">Total Received</p>
                  </div>
                  <p className="text-3xl font-bold">{insightData.stats.totalReceived.toFixed(4)}</p>
                  <p className="text-sm text-gray-400">ETH</p>
                </div>

                <div className="bg-black/40 p-6 rounded-lg border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-[#ff9e00]" />
                    <p className="text-gray-400 text-sm">Last Activity</p>
                  </div>
                  <p className="text-lg font-bold">
                    {new Date(insightData.stats.lastActivity * 1000).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Card>

            {/* Token Holdings */}
            {insightData.tokens.length > 0 && (
              <Card className="bg-white/5 border-white/10 p-8">
                <h3 className="text-2xl font-bold mb-6">Token Holdings</h3>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {insightData.tokens.map((token, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-black/40 p-4 rounded-lg border border-white/10"
                    >
                      <div>
                        <p className="font-semibold text-lg">{token.symbol}</p>
                        <p className="text-sm text-gray-400">{token.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">
                          {token.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                        </p>
                        {token.value && (
                          <p className="text-sm text-gray-400">${token.value.toFixed(2)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Recent Transactions */}
            <Card className="bg-white/5 border-white/10 p-8">
              <h3 className="text-2xl font-bold mb-6">Recent Transactions</h3>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {insightData.transactions.slice(0, 20).map((tx, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-black/40 p-4 rounded-lg border border-white/10 hover:bg-black/60 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`p-2 rounded-lg ${
                        tx.isIncoming ? "bg-green-400/10" : "bg-red-400/10"
                      }`}>
                        {tx.isIncoming ? (
                          <ArrowDownRight className="h-5 w-5 text-green-400" />
                        ) : (
                          <ArrowUpRight className="h-5 w-5 text-red-400" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-mono text-sm text-gray-400">
                            {tx.isIncoming ? "From" : "To"}: {tx.isIncoming ? tx.from.slice(0, 10) : tx.to.slice(0, 10)}...
                          </p>
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(tx.timestamp * 1000).toLocaleString()}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className={`font-semibold ${tx.isIncoming ? "text-green-400" : "text-red-400"}`}>
                          {tx.isIncoming ? "+" : "-"}{tx.value.toFixed(4)} ETH
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {!insightData && !loading && !error && (
          <Card className="bg-white/5 border-white/10 p-12 text-center">
            <Search className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No Address Analyzed Yet</h3>
            <p className="text-gray-400">
              Enter an address above to view detailed insights
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

