'use client';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { sepolia, mainnet } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { injected, metaMask, walletConnect } from 'wagmi/connectors';

// Enhanced Wagmi config with MetaMask Smart Accounts support
const config = createConfig({
  chains: [sepolia, mainnet],
  connectors: [
    injected({
      target: 'metaMask',
    }),
    metaMask({
      dappMetadata: {
        name: 'PermiPay Analytics',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://permipay.app',
        iconUrl: typeof window !== 'undefined' ? `${window.location.origin}/favicon.ico` : '',
      },
    }),
  ],
  transports: {
    [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "https://rpc.sepolia.org"),
    [mainnet.id]: http(process.env.NEXT_PUBLIC_MAINNET_RPC_URL || "https://eth.llamarpc.com"),
  },
  ssr: true,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 60_000,
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
