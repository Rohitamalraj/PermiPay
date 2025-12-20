// Bundler and Paymaster configuration for Advanced Permissions
import { createPublicClient, createWalletClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { createBundlerClient, createPaymasterClient } from 'viem/account-abstraction';

// Public client for reading blockchain state
export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://rpc.sepolia.org'),
});

// Bundler client for submitting user operations
export const bundlerClient = createBundlerClient({
  client: publicClient,
  transport: http(process.env.NEXT_PUBLIC_BUNDLER_URL || ''),
  chain: sepolia,
});

// Paymaster client for gas sponsorship (optional)
export const paymasterClient = createPaymasterClient({
  transport: http(process.env.NEXT_PUBLIC_PAYMASTER_URL || ''),
});

// Bundler configuration check
export const isBundlerConfigured = (): boolean => {
  const bundlerUrl = process.env.NEXT_PUBLIC_BUNDLER_URL;
  return !!bundlerUrl && bundlerUrl !== '';
};

// Get Pimlico API key
export const getPimlicoApiKey = (): string => {
  return process.env.NEXT_PUBLIC_PIMLICO_API_KEY || '';
};
