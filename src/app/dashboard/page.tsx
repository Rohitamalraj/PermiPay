"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FEATURES } from "@/constants/features";
import { Shield, Clock, DollarSign, Activity, CheckCircle2, XCircle } from "lucide-react";

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const [permissionStatus, setPermissionStatus] = useState<any>(null);
  const [spendingLimit, setSpendingLimit] = useState("10");
  const [duration, setDuration] = useState("30");
  const [isGranting, setIsGranting] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      fetchPermissionStatus();
    }
  }, [isConnected, address]);

  const fetchPermissionStatus = async () => {
    // TODO: Call contract to get permission status
    // Placeholder data for now
    setPermissionStatus({
      hasPermission: false,
      spendingLimit: 0,
      spentAmount: 0,
      remainingBudget: 0,
      expiresAt: 0,
      isActive: false,
    });
  };

  const handleGrantPermission = async () => {
    setIsGranting(true);
    try {
      // TODO: Implement MetaMask Advanced Permissions (ERC-7715) flow
      // 1. Request permission via wallet_grantPermissions
      // 2. User approves in MetaMask with human-readable confirmation
      // 3. App can now execute services without repeated signatures
      
      console.log("Granting permission:", {
        spendingLimit: parseFloat(spendingLimit) * 1e6, // Convert to 6 decimals
        duration: parseInt(duration) * 86400, // Convert days to seconds
      });

      // Placeholder success
      alert("Permission granted! (Contract integration pending)");
      await fetchPermissionStatus();
    } catch (error) {
      console.error("Error granting permission:", error);
      alert("Failed to grant permission");
    } finally {
      setIsGranting(false);
    }
  };

  const handleRevokePermission = async () => {
    // TODO: Implement revoke permission
    alert("Revoke permission (Contract integration pending)");
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black pt-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Connect Your Wallet</h1>
          <p className="text-gray-400 mb-8">
            Please connect your MetaMask wallet to access the dashboard
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-32 px-6 pb-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-[#0052FF] to-[#3387FF] bg-clip-text text-transparent">
              Dashboard
            </span>
          </h1>
          <p className="text-gray-400">
            Grant permission once, access services without repeated signatures
          </p>
        </div>

        {/* Permission Status */}
        <Card className="bg-white/5 border-white/10 p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Permission Status</h2>
              <p className="text-gray-400">
                Your current spending authorization for PermiPay Analytics
              </p>
            </div>
            {permissionStatus?.isActive ? (
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-semibold">Active</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gray-400">
                <XCircle className="h-5 w-5" />
                <span className="font-semibold">No Permission</span>
              </div>
            )}
          </div>

          {permissionStatus?.isActive ? (
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="bg-black/40 p-6 rounded-lg border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="h-5 w-5 text-[#0052FF]" />
                  <span className="text-gray-400">Total Budget</span>
                </div>
                <p className="text-2xl font-bold">
                  ${(permissionStatus.spendingLimit / 1e6).toFixed(2)}
                </p>
              </div>

              <div className="bg-black/40 p-6 rounded-lg border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="h-5 w-5 text-[#3387FF]" />
                  <span className="text-gray-400">Remaining</span>
                </div>
                <p className="text-2xl font-bold text-[#3387FF]">
                  ${(permissionStatus.remainingBudget / 1e6).toFixed(2)}
                </p>
              </div>

              <div className="bg-black/40 p-6 rounded-lg border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-400">Expires</span>
                </div>
                <p className="text-2xl font-bold">
                  {new Date(permissionStatus.expiresAt * 1000).toLocaleDateString()}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-[#0052FF]/10 to-[#3387FF]/10 p-8 rounded-xl border border-[#0052FF]/30 mb-6">
              <h3 className="text-xl font-bold mb-4">Grant Permission to Get Started</h3>
              <p className="text-gray-300 mb-6">
                Set a spending limit and duration. The app will automatically charge for services you use—no repeated signatures needed.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Spending Limit (USDC)
                  </label>
                  <input
                    type="number"
                    value={spendingLimit}
                    onChange={(e) => setSpendingLimit(e.target.value)}
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#0052FF]"
                    placeholder="10.00"
                    step="0.1"
                    min="0"
                  />
                  <p className="text-sm text-gray-400 mt-2">
                    Recommended: $10 for ~20-30 service calls
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#0052FF]"
                    placeholder="30"
                    min="1"
                  />
                  <p className="text-sm text-gray-400 mt-2">
                    Permission expires after this period
                  </p>
                </div>
              </div>

              <Button
                onClick={handleGrantPermission}
                disabled={isGranting}
                className="w-full bg-gradient-to-r from-[#0052FF] to-[#3387FF] text-white hover:opacity-90 py-6 text-lg"
              >
                {isGranting ? (
                  "Requesting Permission..."
                ) : (
                  <>
                    <Shield className="h-5 w-5 mr-2" />
                    Grant Permission via MetaMask
                  </>
                )}
              </Button>
            </div>
          )}

          {permissionStatus?.isActive && (
            <Button
              onClick={handleRevokePermission}
              variant="outline"
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              Revoke Permission
            </Button>
          )}
        </Card>

        {/* Available Services */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Available Services</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <Card
                key={feature.id}
                className="bg-white/5 border-white/10 p-6 hover:bg-white/10 transition-colors"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{feature.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-[#0052FF]">
                    ${feature.cost.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-400">per use</span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <Card className="bg-gradient-to-br from-[#0052FF]/5 to-[#3387FF]/5 border-[#0052FF]/20 p-8">
          <h2 className="text-2xl font-bold mb-6">How Permission-Metered Billing Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0052FF] to-[#3387FF] flex items-center justify-center text-xl font-bold mb-4">
                1
              </div>
              <h3 className="font-bold mb-2">Grant Permission Once</h3>
              <p className="text-gray-400 text-sm">
                Set your budget and duration in MetaMask. Uses ERC-7715 Advanced Permissions.
              </p>
            </div>

            <div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0052FF] to-[#3387FF] flex items-center justify-center text-xl font-bold mb-4">
                2
              </div>
              <h3 className="font-bold mb-2">Use Services Freely</h3>
              <p className="text-gray-400 text-sm">
                Access any service without signing each transaction. App charges automatically.
              </p>
            </div>

            <div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0052FF] to-[#3387FF] flex items-center justify-center text-xl font-bold mb-4">
                3
              </div>
              <h3 className="font-bold mb-2">Track On-Chain</h3>
              <p className="text-gray-400 text-sm">
                All usage is recorded on Base. View complete history via Envio indexer.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
