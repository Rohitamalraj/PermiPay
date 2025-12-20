// Chain configurations for PermiPay Analytics
import { mainnet, sepolia } from 'wagmi/chains';

export const SUPPORTED_CHAINS = [sepolia, mainnet] as const;

export const DEFAULT_CHAIN = sepolia;

// Contract addresses (to be updated after deployment)
export const CONTRACTS = {
  [sepolia.id]: {
    PermiPayBilling: '0x0000000000000000000000000000000000000000', // TBD - Deploy this first
    ServiceRegistry: '0x0000000000000000000000000000000000000000', // TBD - Deploy this second
    USDC: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Sepolia USDC
  },
  [mainnet.id]: {
    PermiPayBilling: '0x0000000000000000000000000000000000000000', // TBD
    ServiceRegistry: '0x0000000000000000000000000000000000000000', // TBD
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // Mainnet USDC
  },
} as const;

export const ENVIO_ENDPOINT = process.env.NEXT_PUBLIC_ENVIO_ENDPOINT || '';

export const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';
