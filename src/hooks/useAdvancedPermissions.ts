'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import type { Address } from 'viem';
import { parseUnits } from 'viem';
import { 
  createMetaMaskSmartAccount,
  getStoredSmartAccountAddress,
  storeSmartAccountAddress,
  isSmartAccountDeployed,
  getOrCreateSessionAccount,
  getSessionAccount,
  hasValidSessionAccount,
  clearSessionAccount,
  type MetaMaskSmartAccountType
} from '@/lib/smartAccount';
import { 
  publicClient,
  createERC7715WalletClient,
  createERC7710BundlerClient
} from '@/lib/bundler';
import { CONTRACTS } from '@/constants/chains';
import { sepolia } from 'viem/chains';

// Service types matching PermiPayBilling.sol
export enum ServiceType {
  CONTRACT_INSPECTOR = 0,
  WALLET_REPUTATION = 1,
  WALLET_AUDIT = 2, // Using ADDRESS_INSIGHTS slot in deployed contract
}

// Service pricing (in USDC with 6 decimals)
export const SERVICE_PRICES = {
  [ServiceType.CONTRACT_INSPECTOR]: parseUnits('0.05', 6), // 50000
  [ServiceType.WALLET_REPUTATION]: parseUnits('0.10', 6),  // 100000
  [ServiceType.WALLET_AUDIT]: parseUnits('0.15', 6),       // 150000
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
  const { data: walletClient } = useWalletClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionAccountAddress, setSessionAccountAddress] = useState<Address | null>(null);
  const [smartAccountAddress, setSmartAccountAddress] = useState<Address | null>(null);
  const [smartAccount, setSmartAccount] = useState<MetaMaskSmartAccountType | null>(null);

  // Initialize Smart Account and session account
  useEffect(() => {
    async function initializeAccounts() {
      if (!userAddress || !walletClient) return;

      // Check for stored Smart Account address
      const stored = getStoredSmartAccountAddress(userAddress);
      if (stored) {
        setSmartAccountAddress(stored);
      }

      // Initialize session account
      if (hasValidSessionAccount()) {
        const account = getSessionAccount();
        if (account) {
          setSessionAccountAddress(account.address);
        }
      }
    }

    initializeAccounts();
  }, [userAddress, walletClient]);

  /**
   * Check if user has a MetaMask Smart Account
   * Required for Advanced Permissions (ERC-7715)
   */
  const checkSmartAccount = useCallback(async (): Promise<boolean> => {
    if (!userAddress) return false;

    try {
      // Check if account has code (is a smart contract)
      const code = await publicClient.getCode({ address: userAddress });
      return code !== undefined && code !== '0x';
    } catch (error) {
      console.error('Error checking smart account:', error);
      return false;
    }
  }, [userAddress]);

  /**
   * Create or get MetaMask Smart Account for the user
   * This uses the Smart Accounts Kit to create a counterfactual Smart Account
   * The account won't be deployed until the first transaction
   */
  const setupSmartAccount = useCallback(async (): Promise<MetaMaskSmartAccountType | null> => {
    if (!userAddress || !walletClient) {
      setError('Please connect your wallet first');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check if we already have a Smart Account instance
      if (smartAccount) {
        return smartAccount;
      }

      // Create MetaMask Smart Account using the Kit
      console.log('🔧 Creating MetaMask Smart Account...');
      const account = await createMetaMaskSmartAccount(walletClient);
      
      // Store the address
      setSmartAccountAddress(account.address);
      setSmartAccount(account);
      storeSmartAccountAddress(userAddress, account.address);

      // Check if it's deployed
      const isDeployed = await isSmartAccountDeployed(account.address);
      console.log(`✅ Smart Account ${isDeployed ? 'deployed' : 'counterfactual'} at:`, account.address);

      setIsLoading(false);
      return account;

    } catch (err: unknown) {
      console.error('❌ Error setting up Smart Account:', err);
      const message = err instanceof Error ? err.message : 'Failed to create Smart Account';
      setError(message);
      setIsLoading(false);
      return null;
    }
  }, [userAddress, walletClient, smartAccount]);

  /**
   * Request Advanced Permission from user via MetaMask
   * This uses ERC-7715 Advanced Permissions with Smart Accounts
   */
  const requestPermission = useCallback(async (
    serviceType: ServiceType,
    spendingLimit: bigint = parseUnits('10', 6), // Default $10 USDC
    durationDays: number = 30
  ): Promise<boolean> => {
    if (!userAddress || !walletClient) {
      setError('Please connect your wallet first');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Create ERC-7715 Wallet Client
      console.log('📝 Step 1: Setting up ERC-7715 Wallet Client...');
      const erc7715Client = await createERC7715WalletClient();

      // Step 2: Setup session account using MetaMask Smart Account Kit
      console.log('📝 Step 2: Creating session account...');
      const sessionAccount = getOrCreateSessionAccount();
      setSessionAccountAddress(sessionAccount.address);

      // Step 3: Check if EOA has Smart Account (has code)
      console.log('📝 Step 3: Checking for Smart Account...');
      const code = await publicClient.getCode({ address: userAddress });
      const hasSmartAccount = code !== undefined && code !== '0x';
      
      if (!hasSmartAccount) {
        console.log('ℹ️ No Smart Account detected. MetaMask will prompt to upgrade on permission request.');
      }

      // Step 4: Calculate expiry
      const validUntil = Math.floor(Date.now() / 1000) + (durationDays * 24 * 60 * 60);

      // Step 5: Request execution permissions via ERC-7715
      console.log('📝 Step 4: Requesting execution permissions...');
      
      // Convert values to hex format as required by MetaMask Smart Accounts Kit
      const periodSeconds = durationDays * 24 * 60 * 60;
      const startTime = Math.floor(Date.now() / 1000);
      
      console.log('Permission parameters:', {
        tokenAddress: CONTRACTS[sepolia.id].USDC,
        periodAmount: `0x${spendingLimit.toString(16)}`,
        periodDuration: `0x${periodSeconds.toString(16)}`,
        startTime: `0x${startTime.toString(16)}`,
        endTime: `0x${validUntil.toString(16)}`,
      });
      
      // @ts-ignore - ERC-7715 types may vary between implementations
      const permissionContext = await erc7715Client.requestExecutionPermissions([
        {
          chainId: sepolia.id,
          expiry: validUntil,
          signer: {
            type: 'account',
            data: {
              address: sessionAccount.address,
            },
          },
          permission: {
            type: 'erc20-token-periodic',
            data: {
              tokenAddress: CONTRACTS[sepolia.id].USDC,
              periodAmount: `0x${spendingLimit.toString(16)}`,
              periodDuration: `0x${periodSeconds.toString(16)}`,
              startTime: `0x${startTime.toString(16)}`,
              endTime: `0x${validUntil.toString(16)}`,
            },
          },
          isAdjustmentAllowed: true,
        },
      ]);

      console.log('✅ Permission granted!', permissionContext);

      // Store permission context for later redemption
      // The permissionContext is a string (permissions context) returned by MetaMask
      const storedContext: PermissionContext = {
        permissionId: typeof permissionContext === 'string' ? permissionContext : `${serviceType}-${Date.now()}`,
        serviceType,
        grantedAt: Date.now(),
        expiresAt: validUntil * 1000, // Convert to milliseconds
        spendingLimit: spendingLimit.toString(),
      };

      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(PERMISSION_STORAGE_KEY);
        const permissions = stored ? JSON.parse(stored) : {};
        permissions[`${userAddress}-${serviceType}`] = storedContext;
        localStorage.setItem(PERMISSION_STORAGE_KEY, JSON.stringify(permissions));
      }

      setIsLoading(false);
      return true;

    } catch (err: unknown) {
      console.error('❌ Error requesting permission:', err);
      
      // Provide helpful error messages
      const message = err instanceof Error ? err.message : 'Failed to request permission';
      if (message.includes('User rejected')) {
        setError('Permission request rejected by user');
      } else if (message.includes('not supported')) {
        setError('ERC-7715 not supported. Please update to MetaMask Flask 13.5.0+');
      } else {
        setError(message);
      }
      
      setIsLoading(false);
      return false;
    }
  }, [userAddress, walletClient]);

  /**
   * Execute service using granted permission
   * Flow: Session account calls executeService(user, serviceType) on the billing contract
   */
  const executeService = useCallback(async (
    serviceType: ServiceType,
    targetAddress?: Address
  ): Promise<string | null> => {
    if (!userAddress || !walletClient) {
      setError('Please connect your wallet');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
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

      // Get session account
      const sessionAccount = getSessionAccount();
      if (!sessionAccount) {
        setError('Session account not found. Please request permission again.');
        setIsLoading(false);
        return null;
      }

      console.log('📝 Executing service via session account...');
      
      // Check if permission is registered on-chain
      const { encodeFunctionData, decodeAbiParameters } = await import('viem');
      
      // FIRST: Calculate the counterfactual Smart Account address for the session
      console.log('📝 Calculating session Smart Account address...');
      const { toMetaMaskSmartAccount, Implementation } = await import('@metamask/smart-accounts-kit');
      
      const sessionSmartAccount = await toMetaMaskSmartAccount({
        client: publicClient,
        implementation: Implementation.Hybrid,
        deployParams: [sessionAccount.address, [], [], []],
        deploySalt: '0x',
        signer: {
          account: sessionAccount,
        },
      });

      const sessionSmartAccountAddress = sessionSmartAccount.address;
      console.log('📝 Session Smart Account (counterfactual):', sessionSmartAccountAddress);

      // Read userPermissions to check if permission is registered
      const permissionData = await publicClient.readContract({
        address: CONTRACTS[sepolia.id].PermiPayBilling,
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
        args: [userAddress],
      }) as any[];

      const [spendingLimit, spentAmount, expiresAt, isActive, registeredSession] = permissionData;

      // If permission not registered or session account doesn't match Smart Account, register it
      if (!isActive || registeredSession.toLowerCase() !== sessionSmartAccountAddress.toLowerCase()) {
        console.log('📝 Registering permission on-chain for Smart Account:', sessionSmartAccountAddress);
        
        const grantCallData = encodeFunctionData({
          abi: [
            {
              name: 'grantPermission',
              type: 'function',
              stateMutability: 'nonpayable',
              inputs: [
                { name: 'sessionAccount', type: 'address' },
                { name: 'spendingLimit', type: 'uint256' },
                { name: 'durationSeconds', type: 'uint256' },
              ],
              outputs: [],
            },
          ],
          functionName: 'grantPermission',
          args: [
            sessionSmartAccountAddress, // Register the Smart Account address!
            BigInt(permissionContext.spendingLimit),
            BigInt(Math.floor((permissionContext.expiresAt - Date.now()) / 1000)),
          ],
        });

        // User needs to approve USDC spending first
        console.log('📝 Approving USDC spending...');
        const approveHash = await walletClient.sendTransaction({
          to: CONTRACTS[sepolia.id].USDC,
          data: encodeFunctionData({
            abi: [
              {
                name: 'approve',
                type: 'function',
                inputs: [
                  { name: 'spender', type: 'address' },
                  { name: 'amount', type: 'uint256' },
                ],
                outputs: [{ name: '', type: 'bool' }],
              },
            ],
            functionName: 'approve',
            args: [CONTRACTS[sepolia.id].PermiPayBilling, BigInt(permissionContext.spendingLimit)],
          }),
          chain: sepolia,
        });

        await publicClient.waitForTransactionReceipt({ hash: approveHash });
        console.log('✅ USDC approved');

        // Register permission on-chain with Smart Account address
        const grantHash = await walletClient.sendTransaction({
          to: CONTRACTS[sepolia.id].PermiPayBilling,
          data: grantCallData,
          chain: sepolia,
        });

        await publicClient.waitForTransactionReceipt({ hash: grantHash });
        console.log('✅ Permission registered on-chain for Smart Account:', sessionSmartAccountAddress);
      } else {
        console.log('✅ Permission already registered for Smart Account:', registeredSession);
      }

      // Now execute service via session account with Pimlico paymaster for gas sponsorship
      console.log('📝 Executing service via session Smart Account (gas sponsored by Pimlico)...');
      
      const executeCallData = encodeFunctionData({
        abi: [
          {
            name: 'executeService',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
              { name: 'user', type: 'address' },
              { name: 'serviceType', type: 'uint8' },
            ],
            outputs: [{ name: '', type: 'bool' }],
          },
        ],
        functionName: 'executeService',
        args: [userAddress, serviceType],
      });

      // Use the Smart Account we created earlier
      console.log('📝 Using session Smart Account:', sessionSmartAccountAddress);

      // Create bundler with Pimlico paymaster
      const bundlerClient = await createERC7710BundlerClient();

      // Send UserOperation with Pimlico paymaster sponsoring gas
      console.log('📝 Sending UserOperation with Pimlico paymaster...');
      const userOpHash = await bundlerClient.sendUserOperation({
        account: sessionSmartAccount,
        calls: [
          {
            to: CONTRACTS[sepolia.id].PermiPayBilling,
            data: executeCallData,
            value: 0n,
          },
        ],
      });

      console.log('✅ UserOperation submitted:', userOpHash);

      // Wait for the UserOperation to be included
      console.log('⏳ Waiting for transaction to be mined...');
      const receipt = await bundlerClient.waitForUserOperationReceipt({
        hash: userOpHash,
      });

      console.log('✅ Service executed successfully! Transaction hash:', receipt.receipt.transactionHash);
      setIsLoading(false);
      return receipt.receipt.transactionHash;

    } catch (err: unknown) {
      console.error('❌ Error executing service:', err);
      const message = err instanceof Error ? err.message : 'Failed to execute service';
      setError(message);
      setIsLoading(false);
      return null;
    }
  }, [userAddress, walletClient]);

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
      spentAmount: BigInt(0), // Would need to query contract for actual spent amount
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
    setSmartAccountAddress(null);
    setSmartAccount(null);
  }, []);

  return {
    // State
    isLoading,
    error,
    sessionAccountAddress,
    smartAccountAddress,
    smartAccount,

    // Methods
    requestPermission,
    executeService,
    getPermissionStatus,
    checkSmartAccount,
    setupSmartAccount,
    revokePermissions,
  };
}
