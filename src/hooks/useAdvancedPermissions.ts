'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAccount } from 'wagmi';
import type { Address } from 'viem';
import { parseUnits } from 'viem';
import { 
  getOrCreateSessionAccount, 
  getSessionAccount, 
  clearSessionAccount,
  hasValidSessionAccount 
} from '@/lib/sessionAccount';
import { bundlerClient } from '@/lib/bundler';
import { CONTRACTS } from '@/constants/chains';
import { sepolia } from 'viem/chains';

// Service types matching PermiPayBilling.sol
export enum ServiceType {
  CONTRACT_INSPECTOR = 0,
  WALLET_REPUTATION = 1,
  ADDRESS_INSIGHTS = 2,
}

// Service pricing (in USDC with 6 decimals)
export const SERVICE_PRICES = {
  [ServiceType.CONTRACT_INSPECTOR]: parseUnits('0.30', 6), // 300000
  [ServiceType.WALLET_REPUTATION]: parseUnits('0.40', 6),  // 400000
  [ServiceType.ADDRESS_INSIGHTS]: parseUnits('0.50', 6),   // 500000
} as const;

// Permission status for a service
export interface PermissionStatus {
  hasPermission: boolean;
  spendingLimit: bigint;
  spentAmount: bigint;
  expiresAt: number;
  isActive: boolean;
  remainingBudget: bigint;
}

// Permission context stored in localStorage
interface PermissionContext {
  permissionId: string;
  serviceType: ServiceType;
  grantedAt: number;
  expiresAt: number;
  spendingLimit: string;
}

const PERMISSION_STORAGE_KEY = 'permipay_permissions';

export function useAdvancedPermissions() {
  const { address: userAddress } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionAccountAddress, setSessionAccountAddress] = useState<Address | null>(null);

  // Initialize session account address
  useEffect(() => {
    if (hasValidSessionAccount()) {
      const account = getSessionAccount();
      if (account) {
        setSessionAccountAddress(account.address);
      }
    }
  }, []);

  /**
   * Check if user has a MetaMask Smart Account
   * Required for Advanced Permissions (ERC-7715)
   */
  const checkSmartAccount = useCallback(async (): Promise<boolean> => {
    if (!userAddress) return false;

    try {
      // Check if account has code (is a smart contract)
      const code = await bundlerClient.getCode({ address: userAddress });
      return code !== undefined && code !== '0x';
    } catch (error) {
      console.error('Error checking smart account:', error);
      return false;
    }
  }, [userAddress]);

  /**
   * Request Advanced Permission from user via MetaMask
   * This shows the MetaMask UI with human-readable permission details
   */
  const requestPermission = useCallback(async (
    serviceType: ServiceType,
    spendingLimit: bigint = parseUnits('10', 6), // Default $10 USDC
    durationDays: number = 30
  ): Promise<boolean> => {
    if (!userAddress) {
      setError('Please connect your wallet first');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Check if user has Smart Account
      const hasSmartAccount = await checkSmartAccount();
      if (!hasSmartAccount) {
        setError('Please upgrade to a MetaMask Smart Account first');
        setIsLoading(false);
        return false;
      }

      // 2. Get or create session account
      const sessionAccount = getOrCreateSessionAccount();
      setSessionAccountAddress(sessionAccount.address);

      // 3. Calculate expiry
      const expiresAt = Date.now() + (durationDays * 24 * 60 * 60 * 1000);
      const servicePriceLimit = SERVICE_PRICES[serviceType];

      // 4. Request permission via wallet_grantPermissions (ERC-7715)
      // Note: This requires MetaMask Flask 13.5.0+
      const provider = (window as any).ethereum;
      
      if (!provider) {
        setError('MetaMask not found');
        setIsLoading(false);
        return false;
      }

      const permission = await provider.request({
        method: 'wallet_grantPermissions',
        params: [{
          signer: {
            type: 'account',
            data: {
              id: sessionAccount.address,
            },
          },
          permissions: [{
            type: 'erc20-transfer',
            data: {
              token: CONTRACTS[sepolia.id].USDC,
              amount: spendingLimit.toString(),
              recipient: CONTRACTS[sepolia.id].PermiPayBilling,
            },
            policies: [
              {
                type: 'value-limit',
                data: { 
                  limit: servicePriceLimit.toString() 
                },
              },
              {
                type: 'time-frame',
                data: {
                  validAfter: Date.now(),
                  validUntil: expiresAt,
                },
              },
            ],
          }],
        }],
      });

      // 5. Store permission context
      const permissionContext: PermissionContext = {
        permissionId: permission.permissionId || `${serviceType}-${Date.now()}`,
        serviceType,
        grantedAt: Date.now(),
        expiresAt,
        spendingLimit: spendingLimit.toString(),
      };

      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(PERMISSION_STORAGE_KEY);
        const permissions = stored ? JSON.parse(stored) : {};
        permissions[`${userAddress}-${serviceType}`] = permissionContext;
        localStorage.setItem(PERMISSION_STORAGE_KEY, JSON.stringify(permissions));
      }

      setIsLoading(false);
      return true;

    } catch (err: any) {
      console.error('Error requesting permission:', err);
      setError(err.message || 'Failed to request permission');
      setIsLoading(false);
      return false;
    }
  }, [userAddress, checkSmartAccount]);

  /**
   * Execute service using granted permission
   * No MetaMask popup required!
   */
  const executeService = useCallback(async (
    serviceType: ServiceType,
    targetAddress?: Address
  ): Promise<string | null> => {
    if (!userAddress) {
      setError('Please connect your wallet');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get session account
      const sessionAccount = getSessionAccount();
      if (!sessionAccount) {
        setError('No session account found. Please request permission first.');
        setIsLoading(false);
        return null;
      }

      // Get permission context
      const stored = localStorage.getItem(PERMISSION_STORAGE_KEY);
      const permissions = stored ? JSON.parse(stored) : {};
      const permissionKey = `${userAddress}-${serviceType}`;
      const permissionContext = permissions[permissionKey];

      if (!permissionContext) {
        setError('No permission found. Please request permission first.');
        setIsLoading(false);
        return null;
      }

      // Check expiry
      if (Date.now() > permissionContext.expiresAt) {
        setError('Permission expired. Please request new permission.');
        setIsLoading(false);
        return null;
      }

      // Execute via bundler (gasless transaction)
      const userOpHash = await bundlerClient.sendUserOperation({
        account: sessionAccount,
        calls: [{
          to: CONTRACTS[sepolia.id].PermiPayBilling,
          data: `0x${serviceType.toString(16).padStart(64, '0')}`, // Simplified - should encode properly
          value: 0n,
        }],
      });

      setIsLoading(false);
      return userOpHash;

    } catch (err: any) {
      console.error('Error executing service:', err);
      setError(err.message || 'Failed to execute service');
      setIsLoading(false);
      return null;
    }
  }, [userAddress]);

  /**
   * Get permission status for a service
   */
  const getPermissionStatus = useCallback((
    serviceType: ServiceType
  ): PermissionStatus | null => {
    if (!userAddress) return null;

    const stored = localStorage.getItem(PERMISSION_STORAGE_KEY);
    const permissions = stored ? JSON.parse(stored) : {};
    const permissionKey = `${userAddress}-${serviceType}`;
    const permissionContext = permissions[permissionKey];

    if (!permissionContext) return null;

    const isExpired = Date.now() > permissionContext.expiresAt;
    const spendingLimit = BigInt(permissionContext.spendingLimit);

    return {
      hasPermission: !isExpired,
      spendingLimit,
      spentAmount: 0n, // Would need to query contract for actual spent amount
      expiresAt: permissionContext.expiresAt,
      isActive: !isExpired,
      remainingBudget: spendingLimit,
    };
  }, [userAddress]);

  /**
   * Revoke all permissions and clear session
   */
  const revokePermissions = useCallback(() => {
    clearSessionAccount();
    if (typeof window !== 'undefined') {
      localStorage.removeItem(PERMISSION_STORAGE_KEY);
    }
    setSessionAccountAddress(null);
  }, []);

  return {
    // State
    isLoading,
    error,
    sessionAccountAddress,

    // Methods
    requestPermission,
    executeService,
    getPermissionStatus,
    checkSmartAccount,
    revokePermissions,
  };
}
