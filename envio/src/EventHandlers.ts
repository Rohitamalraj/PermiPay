import {
  PermiPayBilling,
  Permission,
  ServiceExecution,
  GlobalStats,
  DailyStats,
} from "generated";

// Helper to get or create global stats
function getOrCreateGlobalStats(context: any): GlobalStats {
  let stats = context.GlobalStats.get("global");
  if (!stats) {
    stats = {
      id: "global",
      totalPermissionsGranted: 0n,
      activePermissions: 0n,
      totalRevenue: 0n,
      totalExecutions: 0n,
      uniqueUsers: 0n,
      lastUpdated: 0n,
    };
  }
  return stats;
}

// Helper to get or create daily stats
function getOrCreateDailyStats(timestamp: bigint, context: any): DailyStats {
  const date = new Date(Number(timestamp) * 1000);
  const dateStr = date.toISOString().split('T')[0];
  
  let stats = context.DailyStats.get(dateStr);
  if (!stats) {
    stats = {
      id: dateStr,
      date: dateStr,
      permissionsGranted: 0,
      permissionsRevoked: 0,
      serviceExecutions: 0,
      revenue: 0n,
      uniqueUsers: 0,
      contractInspectorCount: 0,
      walletReputationCount: 0,
      walletAuditCount: 0,
    };
  }
  return stats;
}

/**
 * Handler for PermissionGranted event
 * Emitted when a user grants spending permission to the app
 */
PermiPayBilling.PermissionGranted.handler(async ({ event, context }) => {
  const { user, spendingLimit, expiresAt, timestamp } = event.params;

  // Create or update permission entity
  const permission: Permission = {
    id: user.toLowerCase(),
    user: user.toLowerCase(),
    spendingLimit,
    spentAmount: 0n,
    remainingBudget: spendingLimit,
    expiresAt,
    isActive: true,
    grantedAt: timestamp,
    revokedAt: undefined,
    totalExecutions: 0,
  };

  context.Permission.set(permission);

  // Update global stats
  const globalStats = getOrCreateGlobalStats(context);
  globalStats.totalPermissionsGranted += 1n;
  globalStats.activePermissions += 1n;
  globalStats.uniqueUsers += 1n;
  globalStats.lastUpdated = timestamp;
  context.GlobalStats.set(globalStats);

  // Update daily stats
  const dailyStats = getOrCreateDailyStats(timestamp, context);
  dailyStats.permissionsGranted += 1;
  dailyStats.uniqueUsers += 1;
  context.DailyStats.set(dailyStats);
});

/**
 * Handler for ServiceExecuted event
 * Emitted when a user accesses a service and gets charged
 */
PermiPayBilling.ServiceExecuted.handler(async ({ event, context }) => {
  const { user, serviceType, cost, remainingBudget, timestamp } = event.params;
  const txHash = event.transaction.hash;

  // Create service execution record
  const executionId = `${txHash}-${event.logIndex}`;
  const execution: ServiceExecution = {
    id: executionId,
    permission: user.toLowerCase(),
    user: user.toLowerCase(),
    serviceType: ["CONTRACT_INSPECTOR", "WALLET_REPUTATION", "WALLET_AUDIT"][serviceType],
    cost,
    remainingBudget,
    timestamp,
    transactionHash: txHash,
  };

  context.ServiceExecution.set(execution);

  // Update permission
  const permission = context.Permission.get(user.toLowerCase());
  if (permission) {
    permission.spentAmount += cost;
    permission.remainingBudget = remainingBudget;
    permission.totalExecutions += 1;
    context.Permission.set(permission);
  }

  // Update global stats
  const globalStats = getOrCreateGlobalStats(context);
  globalStats.totalRevenue += cost;
  globalStats.totalExecutions += 1n;
  globalStats.lastUpdated = timestamp;
  context.GlobalStats.set(globalStats);

  // Update daily stats
  const dailyStats = getOrCreateDailyStats(timestamp, context);
  dailyStats.serviceExecutions += 1;
  dailyStats.revenue += cost;
  
  // Increment specific service counter
  if (serviceType === 0) {
    dailyStats.contractInspectorCount += 1;
  } else if (serviceType === 1) {
    dailyStats.walletReputationCount += 1;
  } else if (serviceType === 2) {
    dailyStats.walletAuditCount += 1;
  }
  
  context.DailyStats.set(dailyStats);
});

/**
 * Handler for PermissionRevoked event
 * Emitted when a user manually revokes their permission
 */
PermiPayBilling.PermissionRevoked.handler(async ({ event, context }) => {
  const { user, timestamp } = event.params;

  // Update permission
  const permission = context.Permission.get(user.toLowerCase());
  if (permission) {
    permission.isActive = false;
    permission.revokedAt = timestamp;
    context.Permission.set(permission);
  }

  // Update global stats
  const globalStats = getOrCreateGlobalStats(context);
  globalStats.activePermissions -= 1n;
  globalStats.lastUpdated = timestamp;
  context.GlobalStats.set(globalStats);

  // Update daily stats
  const dailyStats = getOrCreateDailyStats(timestamp, context);
  dailyStats.permissionsRevoked += 1;
  context.DailyStats.set(dailyStats);
});
