'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@/components/wallet/ConnectButton';
import { Card } from '@/components/ui/card';
import { Activity, TrendingUp, Clock, DollarSign } from 'lucide-react';

interface Permission {
  spendingLimit: string;
  spentAmount: string;
  remainingBudget: string;
  expiresAt: string;
  isActive: boolean;
  grantedAt: string;
  totalExecutions: number;
}

interface ServiceExecution {
  serviceType: string;
  cost: string;
  timestamp: string;
  transactionHash: string;
  remainingBudget: string;
}

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const [permission, setPermission] = useState<Permission | null>(null);
  const [executions, setExecutions] = useState<ServiceExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected && address) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [isConnected, address]);

  const fetchUserData = async () => {
    if (!address) return;

    try {
      setLoading(true);
      setError(null);

      const envioUrl = process.env.NEXT_PUBLIC_ENVIO_GRAPHQL_URL;
      
      if (!envioUrl) {
        setError('Envio indexer not configured');
        setLoading(false);
        return;
      }

      // Fetch user permission
      const permissionResponse = await fetch(envioUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query ($address: String!) {
              permission(id: $address) {
                spendingLimit
                spentAmount
                remainingBudget
                expiresAt
                isActive
                grantedAt
                totalExecutions
              }
            }
          `,
          variables: { address: address.toLowerCase() },
        }),
      });

      // Fetch user executions
      const executionsResponse = await fetch(envioUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query ($user: String!) {
              serviceExecutions(
                where: { user: $user }
                orderBy: "timestamp"
                orderDirection: "desc"
                limit: 50
              ) {
                serviceType
                cost
                timestamp
                transactionHash
                remainingBudget
              }
            }
          `,
          variables: { user: address.toLowerCase() },
        }),
      });

      const permissionData = await permissionResponse.json();
      const executionsData = await executionsResponse.json();

      if (permissionData.data?.permission) {
        setPermission(permissionData.data.permission);
      }
      if (executionsData.data?.serviceExecutions) {
        setExecutions(executionsData.data.serviceExecutions);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to load your data');
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-8">
        <Card className="bg-slate-800/50 border-slate-700 p-12 text-center max-w-md">
          <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6">
            Connect your wallet to view your PermiPay usage history and permission status
          </p>
          <ConnectButton />
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
            <p className="mt-4 text-gray-400">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !permission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">
              {error ? '⚠️ Error Loading Data' : '📭 No Permission Found'}
            </h2>
            <p className="text-gray-300 mb-6">
              {error || 'You haven\'t granted any permissions yet. Visit a service page to get started!'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const totalSpent = Number(permission.spentAmount) / 1_000_000;
  const remainingBudget = Number(permission.remainingBudget) / 1_000_000;
  const spendingLimit = Number(permission.spendingLimit) / 1_000_000;
  const usagePercent = (totalSpent / spendingLimit) * 100;

  const serviceCounts = {
    CONTRACT_INSPECTOR: executions.filter(e => e.serviceType === 'CONTRACT_INSPECTOR').length,
    WALLET_REPUTATION: executions.filter(e => e.serviceType === 'WALLET_REPUTATION').length,
    WALLET_AUDIT: executions.filter(e => e.serviceType === 'WALLET_AUDIT').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">👤 My Profile</h1>
          <p className="text-gray-400 font-mono text-sm">{address}</p>
        </div>

        {/* Permission Status Card */}
        <div className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Permission Status</h2>
              <p className="text-gray-300 text-sm">
                {permission.isActive ? '✅ Active' : '❌ Inactive'}
                {' • '}
                Expires {new Date(Number(permission.expiresAt) * 1000).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">Granted</p>
              <p className="text-white font-medium">
                {new Date(Number(permission.grantedAt) * 1000).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Budget Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-300">Budget Used</span>
              <span className="text-white font-medium">{usagePercent.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
                style={{ width: `${Math.min(usagePercent, 100)}%` }}
              />
            </div>
          </div>

          {/* Budget Details */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-gray-400 text-xs mb-1">Total Limit</p>
              <p className="text-white font-bold text-xl">${spendingLimit.toFixed(2)}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-gray-400 text-xs mb-1">Spent</p>
              <p className="text-orange-400 font-bold text-xl">${totalSpent.toFixed(2)}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-gray-400 text-xs mb-1">Remaining</p>
              <p className="text-green-400 font-bold text-xl">${remainingBudget.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-5 h-5 text-blue-400" />
              <p className="text-gray-400 text-sm">Total Uses</p>
            </div>
            <p className="text-3xl font-bold text-white">{permission.totalExecutions}</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <p className="text-gray-400 text-sm">Contract Inspector</p>
            </div>
            <p className="text-3xl font-bold text-white">{serviceCounts.CONTRACT_INSPECTOR}</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-green-400" />
              <p className="text-gray-400 text-sm">Wallet Reputation</p>
            </div>
            <p className="text-3xl font-bold text-white">{serviceCounts.WALLET_REPUTATION}</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-purple-400" />
              <p className="text-gray-400 text-sm">Wallet Audit</p>
            </div>
            <p className="text-3xl font-bold text-white">{serviceCounts.WALLET_AUDIT}</p>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">📜 Transaction History</h3>
          {executions.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {executions.map((execution, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      execution.serviceType === 'CONTRACT_INSPECTOR' ? 'bg-blue-500/20' :
                      execution.serviceType === 'WALLET_REPUTATION' ? 'bg-green-500/20' :
                      'bg-purple-500/20'
                    }`}>
                      {execution.serviceType === 'CONTRACT_INSPECTOR' ? '🔍' :
                       execution.serviceType === 'WALLET_REPUTATION' ? '⭐' : '🛡️'}
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {execution.serviceType.replace('_', ' ')}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {new Date(Number(execution.timestamp) * 1000).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">
                      -${(Number(execution.cost) / 1_000_000).toFixed(2)}
                    </p>
                    <p className="text-gray-400 text-sm">
                      ${(Number(execution.remainingBudget) / 1_000_000).toFixed(2)} left
                    </p>
                  </div>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${execution.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm ml-4"
                  >
                    View →
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
