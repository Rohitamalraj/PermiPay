"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Code, CheckCircle2, AlertCircle, ExternalLink, Search, Zap } from "lucide-react";
import { PermissionCard } from "@/components/permissions/PermissionCard";
import { SmartAccountSetup } from "@/components/permissions/SmartAccountSetup";
import { useAdvancedPermissions, ServiceType } from "@/hooks/useAdvancedPermissions";

interface ContractData {
  address: string;
  isVerified: boolean;
  contractName?: string;
  compilerVersion?: string;
  abi?: any[];
  bytecode?: string;
  sourceCode?: string;
  functions?: {
    name: string;
    type: string;
    inputs: any[];
    outputs: any[];
    stateMutability: string;
  }[];
}

export default function ContractInspectorPage() {
  const { address, isConnected } = useAccount();
  const [contractAddress, setContractAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [contractData, setContractData] = useState<ContractData | null>(null);
  const [error, setError] = useState("");
  const [showPermissionCard, setShowPermissionCard] = useState(false);

  const { 
    executeService, 
    getPermissionStatus,
    isLoading: permissionLoading 
  } = useAdvancedPermissions();

  const permissionStatus = getPermissionStatus(ServiceType.CONTRACT_INSPECTOR);
  const hasPermission = permissionStatus?.hasPermission && permissionStatus.isActive;

  const analyzeContract = async () => {
    if (!contractAddress) {
      setError("Please enter a contract address");
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
    setContractData(null);

    try {
      // Execute service using Advanced Permissions (charges $0.30 automatically)
      const userOpHash = await executeService(ServiceType.CONTRACT_INSPECTOR);
      
      if (!userOpHash) {
        throw new Error("Failed to execute service payment");
      }

      // Fetch contract data from Etherscan API
      const response = await fetch(
        `/api/services/contract-inspector?address=${contractAddress}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch contract data");
      }

      const data = await response.json();
      setContractData(data);

    } catch (err: any) {
      setError(err.message || "Failed to analyze contract");
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
            Please connect your wallet to use Contract Inspector
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
              <Code className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Contract Inspector</h1>
              <p className="text-gray-400">
                Analyze smart contracts • View ABI • Check verification • Inspect bytecode
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="bg-gradient-to-br from-[#0052FF]/10 to-[#3387FF]/10 border-[#0052FF]/30 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Service Cost</p>
                  <p className="text-3xl font-bold text-[#0052FF]">$0.30</p>
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
          {!hasPermission && showPermissionCard && (
            <div className="mb-6">
              <PermissionCard
                serviceType={ServiceType.CONTRACT_INSPECTOR}
                serviceName="Contract Inspector"
                serviceDescription="Deep analysis of smart contracts on Ethereum"
                serviceIcon={<Code className="h-5 w-5 text-blue-400" />}
                onPermissionGranted={() => setShowPermissionCard(false)}
              />
            </div>
          )}

          {/* Smart Account Check */}
          {!hasPermission && !showPermissionCard && (
            <div className="mb-6">
              <SmartAccountSetup />
            </div>
          )}
        </div>

        {/* Input Section */}
        <Card className="bg-white/5 border-white/10 p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Enter Contract Address</h2>
          
          <div className="flex gap-4">
            <input
              type="text"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              placeholder="0x..."
              className="flex-1 px-6 py-4 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#0052FF] text-lg"
            />
            <Button
              onClick={analyzeContract}
              disabled={loading}
              className="bg-gradient-to-r from-[#0052FF] to-[#3387FF] text-white hover:opacity-90 px-8 py-4 text-lg"
            >
              {loading ? (
                "Analyzing..."
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  Analyze Contract
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 text-red-400">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => setContractAddress("0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238")}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition-colors"
            >
              Try USDC on Sepolia
            </button>
            <button
              onClick={() => setContractAddress("0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9")}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition-colors"
            >
              Try WETH on Sepolia
            </button>
          </div>
        </Card>

        {/* Results Section */}
        {contractData && (
          <div className="space-y-6">
            {/* Verification Status */}
            <Card className="bg-white/5 border-white/10 p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Contract Overview</h3>
                  <p className="text-gray-400 font-mono text-sm">{contractData.address}</p>
                </div>
                {contractData.isVerified ? (
                  <div className="flex items-center gap-2 text-green-400 bg-green-400/10 px-4 py-2 rounded-lg">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-semibold">Verified</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-yellow-400 bg-yellow-400/10 px-4 py-2 rounded-lg">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-semibold">Not Verified</span>
                  </div>
                )}
              </div>

              {contractData.isVerified && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Contract Name</p>
                    <p className="text-lg font-semibold">{contractData.contractName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Compiler Version</p>
                    <p className="text-lg font-mono">{contractData.compilerVersion}</p>
                  </div>
                </div>
              )}

              <a
                href={`https://sepolia.etherscan.io/address/${contractData.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 text-[#0052FF] hover:text-[#3387FF] transition-colors"
              >
                View on Etherscan
                <ExternalLink className="h-4 w-4" />
              </a>
            </Card>

            {/* Functions */}
            {contractData.functions && contractData.functions.length > 0 && (
              <Card className="bg-white/5 border-white/10 p-8">
                <h3 className="text-2xl font-bold mb-6">Contract Functions</h3>
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {contractData.functions.map((func, index) => (
                    <div
                      key={index}
                      className="bg-black/40 p-6 rounded-lg border border-white/10"
                    >
                      <div className="flex items-center gap-4 mb-3">
                        <span className="font-mono text-lg font-semibold text-[#0052FF]">
                          {func.name}
                        </span>
                        <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-medium">
                          {func.type}
                        </span>
                        <span className="px-3 py-1 bg-[#0052FF]/20 text-[#0052FF] rounded-full text-xs font-medium">
                          {func.stateMutability}
                        </span>
                      </div>

                      {func.inputs.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-400 mb-2">Inputs:</p>
                          <div className="space-y-1">
                            {func.inputs.map((input: any, i: number) => (
                              <p key={i} className="font-mono text-sm text-gray-300">
                                {input.type} {input.name}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {func.outputs.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-400 mb-2">Outputs:</p>
                          <div className="space-y-1">
                            {func.outputs.map((output: any, i: number) => (
                              <p key={i} className="font-mono text-sm text-gray-300">
                                {output.type} {output.name}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* ABI */}
            {contractData.abi && (
              <Card className="bg-white/5 border-white/10 p-8">
                <h3 className="text-2xl font-bold mb-6">Contract ABI</h3>
                <pre className="bg-black/40 p-6 rounded-lg border border-white/10 overflow-x-auto text-sm font-mono text-gray-300 max-h-[400px] overflow-y-auto">
                  {JSON.stringify(contractData.abi, null, 2)}
                </pre>
              </Card>
            )}

            {/* Bytecode */}
            {contractData.bytecode && (
              <Card className="bg-white/5 border-white/10 p-8">
                <h3 className="text-2xl font-bold mb-6">Contract Bytecode</h3>
                <div className="bg-black/40 p-6 rounded-lg border border-white/10 overflow-x-auto">
                  <p className="text-xs font-mono text-gray-400 break-all">
                    {contractData.bytecode}
                  </p>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Empty State */}
        {!contractData && !loading && !error && (
          <Card className="bg-white/5 border-white/10 p-12 text-center">
            <Code className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No Contract Analyzed Yet</h3>
            <p className="text-gray-400">
              Enter a contract address above to start analyzing
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
