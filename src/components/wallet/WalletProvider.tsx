'use client';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { sepolia, mainnet } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { metaMask } from 'wagmi/connectors';
import { WALLETCONNECT_PROJECT_ID } from '@/constants/chains';

// Enhanced Wagmi config with MetaMask Smart Accounts support
const config = createConfig({
  chains: [sepolia, mainnet],
  connectors: [
    metaMask({
      dappMetadata: {
        name: 'PermiPay Analytics',
        url: typeof window !== 'undefined' ? window.location.origin : '',
      },
      // Enable MetaMask Flask features for Advanced Permissions (ERC-7715)
      extensionOnly: false,
      infuraAPIKey: process.env.NEXT_PUBLIC_INFURA_API_KEY,
    }),
  ],
  transports: {
    [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "https://rpc.sepolia.org"),
    [mainnet.id]: http(process.env.NEXT_PUBLIC_MAINNET_RPC_URL || "https://eth.llamarpc.com"),
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
