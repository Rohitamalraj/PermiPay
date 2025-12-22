// Bundler and Paymaster configuration for Advanced Permissions
import { createPublicClient, createWalletClient, http, custom } from 'viem';
import { sepolia } from 'viem/chains';
import { createBundlerClient } from 'viem/account-abstraction';
import { erc7715ProviderActions, erc7710BundlerActions } from '@metamask/smart-accounts-kit/actions';

// Public client for reading blockchain state
export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://rpc.sepolia.org'),
});

// Create Wallet Client for ERC-7715 (connects to MetaMask Flask)
export const createERC7715WalletClient = () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask not found');
  }

  return createWalletClient({
    chain: sepolia,
    transport: custom(window.ethereum),
  }).extend(erc7715ProviderActions());
};

// Create Bundler client with ERC-7710 actions
export const createERC7710BundlerClient = () => {
  return createBundlerClient({
    client: publicClient,
    transport: http(process.env.NEXT_PUBLIC_BUNDLER_URL || ''),
    chain: sepolia,
    paymaster: true, // Use bundler as paymaster
  }).extend(erc7710BundlerActions());
};

// Bundler configuration check
export const isBundlerConfigured = (): boolean => {
  const bundlerUrl = process.env.NEXT_PUBLIC_BUNDLER_URL;
  return !!bundlerUrl && bundlerUrl !== '';
};

// Get Pimlico API key
export const getPimlicoApiKey = (): string => {
  return process.env.NEXT_PUBLIC_PIMLICO_API_KEY || '';
};
