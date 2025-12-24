'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import Link from 'next/link';
import { CONTRACTS } from '@/constants/chains';
import { sepolia } from 'viem/chains';

interface UserPermission {
  id: string;
  user: string;
  spendingLimit: string;
  spentAmount: string;
  remainingBudget: string;
  expiresAt: string;
  isActive: boolean;
  grantedAt: string;
  totalExecutions: number;
}

interface UserExecution {
  id: string;
  serviceType: string;
  cost: string;
  timestamp: string;
  transactionHash: string;
}

export default function UserDashboard() {
  const { address, isConnected } = useAccount();
  const [permission, setPermission] = useState<UserPermission | null>(null);
  const [executions, setExecutions] = useState<UserExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Read permission directly from blockchain contract
  const { data: contractPermission, isLoading: contractLoading, refetch } = useReadContract({
    address: CONTRACTS[sepolia.id].PermiPayBilling as `0x${string}`,
    abi: [
      {
        name: 'userPermissions',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'user', type: 'address' }],
        outputs: [
          { name: 'spendingLimit', type: 'uint256' },
          { name: 'spentAmount', type: 'uint256' },
          { name: 'expiresAt', type: 'uint256' },
          { name: 'isActive', type: 'bool' },
          { name: 'sessionAccount', type: 'address' },
        ],
      },
    ],
    functionName: 'userPermissions',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  });

  useEffect(() => {
    if (isConnected && address) {
      fetchUserData();
      refetch(); // Refresh contract data
    } else {
      setLoading(false);
    }
  }, [address, isConnected, refetch]);

  // Update permission state when contract data changes
  useEffect(() => {
    if (contractPermission && address) {
      const [spendingLimit, spentAmount, expiresAt, isActive] = contractPermission as [bigint, bigint, bigint, boolean, string];
      
      if (isActive) {
        setPermission({
          id: `${address}-permission`,
          user: address,
          spendingLimit: spendingLimit.toString(),
          spentAmount: spentAmount.toString(),
          remainingBudget: (spendingLimit - spentAmount).toString(),
          expiresAt: expiresAt.toString(), // Store as-is (already in seconds from contract)
          isActive: true,
          grantedAt: Date.now().toString(),
          totalExecutions: 0, // Will be calculated from executions
        });
      } else {
        setPermission(null);
      }
    }
  }, [contractPermission, address]);

  const fetchUserData = async () => {
    if (!address) return;

    try {
      setLoading(true);
      setError(null);

      const envioUrl = process.env.NEXT_PUBLIC_ENVIO_GRAPHQL_URL;
      
      if (!envioUrl) {
        setError('Analytics not configured');
        setLoading(false);
        return;
      }

      // Fetch user executions only (permission comes from contract)
      const executionsResponse = await fetch(envioUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query {
              ServiceExecution(
                where: {user: {_eq: "${address.toLowerCase()}"}}
                order_by: {timestamp: desc}
                limit: 50
              ) {
                id
                serviceType
                cost
                timestamp
                transactionHash
              }
            }
          `,
        }),
      });

      const executionsData = await executionsResponse.json();

      console.log('Executions response:', executionsData);

      if (executionsData.data?.ServiceExecution) {
        setExecutions(executionsData.data.ServiceExecution);
        console.log('Loaded executions:', executionsData.data.ServiceExecution.length);
      } else if (executionsData.errors) {
        console.error('GraphQL errors:', executionsData.errors);
        setError(`GraphQL error: ${executionsData.errors[0]?.message || 'Unknown error'}`);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'CONTRACT_INSPECTOR':
        return '🔍';
      case 'WALLET_REPUTATION':
        return '⭐';
      case 'WALLET_AUDIT':
        return '🛡️';
      default:
        return '📊';
    }
  };

  const getServiceName = (type: string) => {
    switch (type) {
      case 'CONTRACT_INSPECTOR':
        return 'Contract Inspector';
      case 'WALLET_REPUTATION':
        return 'Wallet Reputation';
      case 'WALLET_AUDIT':
        return 'Wallet Audit';
      default:
        return type;
    }
  };

  const getServiceCost = (type: string) => {
    switch (type) {
      case 'CONTRACT_INSPECTOR':
        return '$0.05';
      case 'WALLET_REPUTATION':
        return '$0.10';
      case 'WALLET_AUDIT':
        return '$0.15';
      default:
        return '$0.00';
    }
  };

  // Calculate service usage breakdown
  const serviceBreakdown = executions.reduce((acc, exec) => {
    const type = exec.serviceType;
    if (!acc[type]) {
      acc[type] = { count: 0, totalCost: 0 };
    }
    acc[type].count++;
    acc[type].totalCost += Number(exec.cost);
    return acc;
  }, {} as Record<string, { count: number; totalCost: number }>);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
            <h1 className="text-3xl font-bold text-white mb-4">🔐 Connect Your Wallet</h1>
            <p className="text-gray-400 mb-6">
              Please connect your wallet to view your personal dashboard
            </p>
            <Link 
              href="/"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">👤 My Dashboard</h1>
          <p className="text-gray-400">
            Personal spending and usage overview for {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Permission Overview */}
        {permission ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-6">
                <p className="text-blue-300 text-sm font-medium mb-1">Total Spent</p>
                <p className="text-3xl font-bold text-white">
                  ${(Number(permission.spentAmount) / 1_000_000).toFixed(2)}
                </p>
                <p className="text-blue-300 text-xs mt-1">
                  of ${(Number(permission.spendingLimit) / 1_000_000).toFixed(2)} limit
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6">
                <p className="text-green-300 text-sm font-medium mb-1">Remaining Budget</p>
                <p className="text-3xl font-bold text-white">
                  ${(Number(permission.remainingBudget) / 1_000_000).toFixed(2)}
                </p>
                <p className="text-green-300 text-xs mt-1">
                  {((Number(permission.remainingBudget) / Number(permission.spendingLimit)) * 100).toFixed(0)}% available
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-6">
                <p className="text-purple-300 text-sm font-medium mb-1">Total Services</p>
                <p className="text-3xl font-bold text-white">{executions.length}</p>
                <p className="text-purple-300 text-xs mt-1">services executed</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-xl p-6">
                <p className="text-orange-300 text-sm font-medium mb-1">Permission Status</p>
                <p className="text-2xl font-bold text-white">
                  {permission.isActive ? (
                    <span className="text-green-400">✓ Active</span>
                  ) : (
                    <span className="text-red-400">✗ Inactive</span>
                  )}
                </p>
                <p className="text-orange-300 text-xs mt-1">
                  Expires {new Date(Number(permission.expiresAt) * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Spending Progress Bar */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">💰 Spending Overview</h3>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-gray-400">
                  Spent: ${(Number(permission.spentAmount) / 1_000_000).toFixed(2)}
                </span>
                <span className="text-gray-400">
                  Limit: ${(Number(permission.spendingLimit) / 1_000_000).toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-4">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all flex items-center justify-center text-xs text-white font-semibold"
                  style={{ 
                    width: `${Math.min((Number(permission.spentAmount) / Number(permission.spendingLimit)) * 100, 100)}%` 
                  }}
                >
                  {((Number(permission.spentAmount) / Number(permission.spendingLimit)) * 100).toFixed(0)}%
                </div>
              </div>
            </div>

            {/* Service Breakdown */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">📊 Service Usage Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(serviceBreakdown).map(([type, data]) => (
                  <div key={type} className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{getServiceIcon(type)}</span>
                      <span className="text-gray-400 text-sm">{data.count}x</span>
                    </div>
                    <h4 className="text-white font-semibold mb-1">{getServiceName(type)}</h4>
                    <p className="text-gray-400 text-sm mb-1">{getServiceCost(type)} per use</p>
                    <p className="text-purple-400 font-semibold">
                      ${(data.totalCost / 1_000_000).toFixed(2)} total
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-yellow-500/20 border border-yellow-500 rounded-xl p-8 mb-8 text-center">
            <h3 className="text-2xl font-bold text-yellow-400 mb-2">⚠️ No Active Permission</h3>
            <p className="text-gray-300 mb-4">
              You haven't granted any spending permissions yet
            </p>
            <Link 
              href="/"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Grant Permission & Start Using Services
            </Link>
          </div>
        )}

        {/* Transaction History */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">📜 Transaction History</h3>
          {executions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No transactions yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-400 border-b border-slate-700">
                    <th className="pb-3 font-medium">Service</th>
                    <th className="pb-3 font-medium">Cost</th>
                    <th className="pb-3 font-medium">Date & Time</th>
                    <th className="pb-3 font-medium">Transaction</th>
                  </tr>
                </thead>
                <tbody>
                  {executions.map((exec) => (
                    <tr key={exec.id} className="border-b border-slate-700/50">
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{getServiceIcon(exec.serviceType)}</span>
                          <span className="text-white font-medium">{getServiceName(exec.serviceType)}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="text-purple-400 font-semibold">
                          ${(Number(exec.cost) / 1_000_000).toFixed(2)}
                        </span>
                      </td>
                      <td className="py-4 text-gray-300">
                        {new Date(Number(exec.timestamp) * 1000).toLocaleString()}
                      </td>
                      <td className="py-4">
                        <a
                          href={`https://sepolia.etherscan.io/tx/${exec.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 font-medium"
                        >
                          View →
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
