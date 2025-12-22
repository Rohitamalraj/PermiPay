// Bundler and Paymaster configuration for Advanced Permissions
import { createPublicClient, createWalletClient, http, custom } from 'viem';
import { sepolia } from 'viem/chains';
import { createBundlerClient, createPaymasterClient } from 'viem/account-abstraction';
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

// Pimlico Bundler URL for Sepolia
const PIMLICO_BUNDLER_URL = `https://api.pimlico.io/v2/sepolia/rpc?apikey=${process.env.NEXT_PUBLIC_PIMLICO_API_KEY}`;

// Create Pimlico Paymaster Client for gas sponsorship
export const createPimlicoPaymasterClient = () => {
  return createPaymasterClient({
    transport: http(PIMLICO_BUNDLER_URL),
  });
};

// Create Bundler client with ERC-7710 actions and Pimlico paymaster
export const createERC7710BundlerClient = () => {
  const paymasterClient = createPimlicoPaymasterClient();
  
  return createBundlerClient({
    client: publicClient,
    transport: http(PIMLICO_BUNDLER_URL),
    chain: sepolia,
    paymaster: paymasterClient, // Use Pimlico paymaster for gas sponsorship
  }).extend(erc7710BundlerActions());
};

// Bundler configuration check
export const isBundlerConfigured = (): boolean => {
  const apiKey = process.env.NEXT_PUBLIC_PIMLICO_API_KEY;
  return !!apiKey && apiKey !== '';
};

// Get Pimlico API key
export const getPimlicoApiKey = (): string => {
  return process.env.NEXT_PUBLIC_PIMLICO_API_KEY || '';
};
