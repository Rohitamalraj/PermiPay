/**
 * MetaMask Smart Account Creation using Smart Accounts Kit
 * Implements ERC-7715 Advanced Permissions via ERC-7710 delegation
 * 
 * Note: This requires MetaMask Flask 13.5.0+ with Smart Accounts enabled
 */

import { toMetaMaskSmartAccount, Implementation } from '@metamask/smart-accounts-kit';
import type { SmartAccount } from 'permissionless/accounts';
import type { EntryPoint } from 'permissionless/types';
import type { WalletClient, Address } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { generatePrivateKey } from 'viem/accounts';
import { bundlerClient, publicClient } from './bundler';
import { sepolia } from 'viem/chains';

export type MetaMaskSmartAccountType = SmartAccount<EntryPoint, 'MetaMaskSmartAccount'>;

/**
 * Session Account for delegation
 * This is an ephemeral account stored locally that signs transactions on behalf of the user
 */
export interface SessionAccount {
  address: Address;
  privateKey: `0x${string}`;
  createdAt: number;
  expiresAt: number;
}

const SESSION_ACCOUNT_STORAGE_KEY = 'permipay:session-account';

/**
 * Get or create a session account for ERC-7715 delegation
 * Session accounts are stored in localStorage with a 30-day expiry
 */
export function getOrCreateSessionAccount(): ReturnType<typeof privateKeyToAccount> {
  if (typeof window === 'undefined') {
    throw new Error('Session accounts require browser environment');
  }

  // Check for existing session account
  const stored = localStorage.getItem(SESSION_ACCOUNT_STORAGE_KEY);
  if (stored) {
    try {
      const session: SessionAccount = JSON.parse(stored);
      
      // Check if session is still valid
      if (Date.now() < session.expiresAt) {
        console.log('🔑 Using existing session account:', session.address);
        return privateKeyToAccount(session.privateKey);
      } else {
        console.log('⏰ Session account expired, creating new one');
      }
    } catch (error) {
      console.error('Error loading session account:', error);
    }
  }

  // Create new session account
  console.log('🔑 Creating new session account...');
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);
  
  const session: SessionAccount = {
    address: account.address,
    privateKey,
    createdAt: Date.now(),
    expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
  };

  localStorage.setItem(SESSION_ACCOUNT_STORAGE_KEY, JSON.stringify(session));
  console.log('✅ New session account created:', account.address);
  
  return account;
}

/**
 * Get existing session account (without creating a new one)
 */
export function getSessionAccount(): ReturnType<typeof privateKeyToAccount> | null {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem(SESSION_ACCOUNT_STORAGE_KEY);
  if (!stored) return null;

  try {
    const session: SessionAccount = JSON.parse(stored);
    
    // Check if session is still valid
    if (Date.now() < session.expiresAt) {
      return privateKeyToAccount(session.privateKey);
    }
  } catch (error) {
    console.error('Error loading session account:', error);
  }

  return null;
}

/**
 * Check if a valid session account exists
 */
export function hasValidSessionAccount(): boolean {
  return getSessionAccount() !== null;
}

/**
 * Clear session account from storage
 */
export function clearSessionAccount(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_ACCOUNT_STORAGE_KEY);
  console.log('🗑️ Session account cleared');
}

/**
 * Create or get MetaMask Smart Account for a user
 * Uses Hybrid implementation (EOA + passkey support)
 * 
 * @param walletClient - Connected wallet client from wagmi
 * @returns Smart Account instance
 */
export async function createMetaMaskSmartAccount(
  walletClient: WalletClient
): Promise<MetaMaskSmartAccountType> {
  if (!walletClient.account) {
    throw new Error('Wallet client must have an account');
  }

  try {
    const smartAccount = await toMetaMaskSmartAccount({
      client: publicClient,
      implementation: Implementation.Hybrid,
      deployParams: [walletClient.account.address, [], [], []],
      deploySalt: '0x',
      signer: {
        account: walletClient.account,
        walletClient: walletClient,
      },
    });

    console.log('✅ MetaMask Smart Account created:', smartAccount.address);
    return smartAccount;
  } catch (error: any) {
    console.error('❌ Failed to create Smart Account:', error);
    throw new Error(`Smart Account creation failed: ${error.message}`);
  }
}

/**
 * Check if an address is a deployed Smart Account
 * @param address - Address to check
 * @returns true if the address has contract code (is deployed)
 */
export async function isSmartAccountDeployed(address: Address): Promise<boolean> {
  try {
    const code = await publicClient.getCode({ address });
    return code !== undefined && code !== '0x';
  } catch (error) {
    console.error('Error checking Smart Account deployment:', error);
    return false;
  }
}

/**
 * Get the counterfactual Smart Account address without deploying it
 * This is the address the Smart Account will have when deployed
 * 
 * @param walletClient - Connected wallet client
 * @returns The predicted Smart Account address
 */
export async function getSmartAccountAddress(
  walletClient: WalletClient
): Promise<Address> {
  const smartAccount = await createMetaMaskSmartAccount(walletClient);
  return smartAccount.address;
}

/**
 * Storage key for Smart Account address mapping
 */
const SMART_ACCOUNT_STORAGE_KEY = 'permipay:smart-accounts';

/**
 * Store Smart Account address for an EOA
 * @param eoaAddress - User's EOA address
 * @param smartAccountAddress - Smart Account address
 */
export function storeSmartAccountAddress(
  eoaAddress: Address,
  smartAccountAddress: Address
): void {
  if (typeof window === 'undefined') return;

  const stored = localStorage.getItem(SMART_ACCOUNT_STORAGE_KEY);
  const accounts = stored ? JSON.parse(stored) : {};
  accounts[eoaAddress.toLowerCase()] = {
    smartAccountAddress,
    createdAt: Date.now(),
    chainId: sepolia.id,
  };
  localStorage.setItem(SMART_ACCOUNT_STORAGE_KEY, JSON.stringify(accounts));
}

/**
 * Get stored Smart Account address for an EOA
 * @param eoaAddress - User's EOA address
 * @returns Smart Account address if found
 */
export function getStoredSmartAccountAddress(
  eoaAddress: Address
): Address | null {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem(SMART_ACCOUNT_STORAGE_KEY);
  if (!stored) return null;

  const accounts = JSON.parse(stored);
  const entry = accounts[eoaAddress.toLowerCase()];
  return entry?.smartAccountAddress || null;
}
