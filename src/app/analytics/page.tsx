'use client';

import { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface GlobalStats {
  totalPermissionsGranted: string;
  activePermissions: string;
  totalRevenue: string;
  totalExecutions: string;
  uniqueUsers: string;
}

interface DailyStat {
  date: string;
  permissionsGranted: number;
  serviceExecutions: number;
  revenue: string;
  contractInspectorCount: number;
  walletReputationCount: number;
  walletAuditCount: number;
}

interface ServiceExecution {
  user: string;
  serviceType: string;
  cost: string;
  timestamp: string;
  transactionHash: string;
}

export default function AnalyticsPage() {
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [recentExecutions, setRecentExecutions] = useState<ServiceExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const envioUrl = process.env.NEXT_PUBLIC_ENVIO_GRAPHQL_URL;
      
      if (!envioUrl) {
        // If Envio is not deployed yet, show placeholder data
        setError('Envio indexer not configured. Deploy indexer to see real-time analytics.');
        setLoading(false);
        return;
      }

      // Fetch global stats
      const globalResponse = await fetch(envioUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query {
              globalStats(id: "global") {
                totalPermissionsGranted
                activePermissions
                totalRevenue
                totalExecutions
                uniqueUsers
              }
            }
          `,
        }),
      });

      // Fetch daily stats
      const dailyResponse = await fetch(envioUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query {
              dailyStats(orderBy: "date", orderDirection: "desc", limit: 30) {
                date
                permissionsGranted
                serviceExecutions
                revenue
                contractInspectorCount
                walletReputationCount
                walletAuditCount
              }
            }
          `,
        }),
      });

      // Fetch recent executions
      const executionsResponse = await fetch(envioUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query {
              serviceExecutions(
                orderBy: "timestamp"
                orderDirection: "desc"
                limit: 10
              ) {
                user
                serviceType
                cost
                timestamp
                transactionHash
              }
            }
          `,
        }),
      });

      const globalData = await globalResponse.json();
      const dailyData = await dailyResponse.json();
      const executionsData = await executionsResponse.json();

      if (globalData.data?.globalStats) {
        setGlobalStats(globalData.data.globalStats);
      }
      if (dailyData.data?.dailyStats) {
        setDailyStats(dailyData.data.dailyStats.reverse());
      }
      if (executionsData.data?.serviceExecutions) {
        setRecentExecutions(executionsData.data.serviceExecutions);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
      setLoading(false);
    }
  };

  // Chart data
  const revenueChartData = {
    labels: dailyStats.map((d) => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Daily Revenue (USDC)',
        data: dailyStats.map((d) => Number(d.revenue) / 1_000_000),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const executionsChartData = {
    labels: dailyStats.map((d) => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Contract Inspector',
        data: dailyStats.map((d) => d.contractInspectorCount),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
      {
        label: 'Wallet Reputation',
        data: dailyStats.map((d) => d.walletReputationCount),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
      },
      {
        label: 'Wallet Audit',
        data: dailyStats.map((d) => d.walletAuditCount),
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
      },
    ],
  };

  const serviceDistributionData = {
    labels: ['Contract Inspector', 'Wallet Reputation', 'Wallet Audit'],
    datasets: [
      {
        data: [
          dailyStats.reduce((sum, d) => sum + d.contractInspectorCount, 0),
          dailyStats.reduce((sum, d) => sum + d.walletReputationCount, 0),
          dailyStats.reduce((sum, d) => sum + d.walletAuditCount, 0),
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(139, 92, 246)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#e5e7eb',
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#9ca3af' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
      y: {
        ticks: { color: '#9ca3af' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#e5e7eb',
          padding: 20,
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
            <p className="mt-4 text-gray-400">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">⚠️ Indexer Not Configured</h2>
            <p className="text-gray-300 mb-6">{error}</p>
            <div className="bg-slate-800/50 rounded-lg p-6 text-left">
              <h3 className="text-white font-semibold mb-3">📝 Setup Instructions:</h3>
              <ol className="text-gray-300 space-y-2 text-sm">
                <li>1. Install Envio CLI (see <code className="bg-slate-700 px-2 py-1 rounded">envio/DEPLOYMENT_GUIDE.md</code>)</li>
                <li>2. Deploy indexer: <code className="bg-slate-700 px-2 py-1 rounded">cd envio && envio deploy</code></li>
                <li>3. Add GraphQL endpoint to <code className="bg-slate-700 px-2 py-1 rounded">.env.local</code></li>
                <li>4. Restart the app to see live analytics</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">📊 Analytics Dashboard</h1>
          <p className="text-gray-400">Real-time insights powered by Envio</p>
        </div>

        {/* Global Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-6">
            <p className="text-blue-300 text-sm font-medium mb-1">Total Permissions</p>
            <p className="text-3xl font-bold text-white">{globalStats?.totalPermissionsGranted || '0'}</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6">
            <p className="text-green-300 text-sm font-medium mb-1">Active Permissions</p>
            <p className="text-3xl font-bold text-white">{globalStats?.activePermissions || '0'}</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-6">
            <p className="text-purple-300 text-sm font-medium mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-white">
              ${globalStats ? (Number(globalStats.totalRevenue) / 1_000_000).toFixed(2) : '0.00'}
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-xl p-6">
            <p className="text-orange-300 text-sm font-medium mb-1">Total Executions</p>
            <p className="text-3xl font-bold text-white">{globalStats?.totalExecutions || '0'}</p>
          </div>
          
          <div className="bg-gradient-to-br from-pink-500/20 to-pink-600/20 border border-pink-500/30 rounded-xl p-6">
            <p className="text-pink-300 text-sm font-medium mb-1">Unique Users</p>
            <p className="text-3xl font-bold text-white">{globalStats?.uniqueUsers || '0'}</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">💰 Daily Revenue</h3>
            <div className="h-64">
              <Line data={revenueChartData} options={chartOptions} />
            </div>
          </div>

          {/* Service Distribution */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">📈 Service Distribution</h3>
            <div className="h-64">
              <Doughnut data={serviceDistributionData} options={doughnutOptions} />
            </div>
          </div>
        </div>

        {/* Service Executions Chart */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">📊 Service Usage Over Time</h3>
          <div className="h-80">
            <Bar data={executionsChartData} options={chartOptions} />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">🕐 Recent Activity</h3>
          {recentExecutions.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No recent activity</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-400 border-b border-slate-700">
                    <th className="pb-3 font-medium">User</th>
                    <th className="pb-3 font-medium">Service</th>
                    <th className="pb-3 font-medium">Cost</th>
                    <th className="pb-3 font-medium">Time</th>
                    <th className="pb-3 font-medium">Transaction</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  {recentExecutions.map((execution, index) => (
                    <tr key={index} className="border-b border-slate-700/50">
                      <td className="py-3 font-mono text-sm">{execution.user.slice(0, 6)}...{execution.user.slice(-4)}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          execution.serviceType === 'CONTRACT_INSPECTOR' ? 'bg-blue-500/20 text-blue-300' :
                          execution.serviceType === 'WALLET_REPUTATION' ? 'bg-green-500/20 text-green-300' :
                          'bg-purple-500/20 text-purple-300'
                        }`}>
                          {execution.serviceType.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3">${(Number(execution.cost) / 1_000_000).toFixed(2)}</td>
                      <td className="py-3 text-sm">
                        {new Date(Number(execution.timestamp) * 1000).toLocaleString()}
                      </td>
                      <td className="py-3">
                        <a
                          href={`https://sepolia.etherscan.io/tx/${execution.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-sm"
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
