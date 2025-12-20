// Session Account Management for Advanced Permissions
import { privateKeyToAccount, generatePrivateKey } from 'viem/accounts';
import type { Address, PrivateKeyAccount } from 'viem';

const SESSION_ACCOUNT_KEY = 'permipay_session_account';
const SESSION_EXPIRY_KEY = 'permipay_session_expiry';

export interface SessionAccountData {
  address: Address;
  privateKey: `0x${string}`;
  createdAt: number;
  expiresAt: number;
}

/**
 * Create a new session account for Advanced Permissions
 * Session accounts are temporary accounts that hold delegated permissions
 */
export function createSessionAccount(): PrivateKeyAccount {
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);
  
  const sessionData: SessionAccountData = {
    address: account.address,
    privateKey,
    createdAt: Date.now(),
    expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
  };
  
  // Store in localStorage (client-side only)
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_ACCOUNT_KEY, JSON.stringify(sessionData));
  }
  
  return account;
}

/**
 * Get existing session account from storage
 */
export function getSessionAccount(): PrivateKeyAccount | null {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem(SESSION_ACCOUNT_KEY);
  if (!stored) return null;
  
  try {
    const data: SessionAccountData = JSON.parse(stored);
    
    // Check if expired
    if (Date.now() > data.expiresAt) {
      clearSessionAccount();
      return null;
    }
    
    return privateKeyToAccount(data.privateKey);
  } catch (error) {
    console.error('Failed to parse session account:', error);
    return null;
  }
}

/**
 * Get or create session account
 */
export function getOrCreateSessionAccount(): PrivateKeyAccount {
  const existing = getSessionAccount();
  if (existing) return existing;
  
  return createSessionAccount();
}

/**
 * Clear session account from storage
 */
export function clearSessionAccount(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_ACCOUNT_KEY);
    localStorage.removeItem(SESSION_EXPIRY_KEY);
  }
}

/**
 * Check if session account exists and is valid
 */
export function hasValidSessionAccount(): boolean {
  const account = getSessionAccount();
  return account !== null;
}

/**
 * Get session account address without loading full account
 */
export function getSessionAccountAddress(): Address | null {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem(SESSION_ACCOUNT_KEY);
  if (!stored) return null;
  
  try {
    const data: SessionAccountData = JSON.parse(stored);
    
    if (Date.now() > data.expiresAt) {
      return null;
    }
    
    return data.address;
  } catch {
    return null;
  }
}
