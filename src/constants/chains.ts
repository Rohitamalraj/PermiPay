// Chain configurations for PermiPay Analytics
import { mainnet, sepolia } from 'wagmi/chains';

export const SUPPORTED_CHAINS = [sepolia, mainnet] as const;

export const DEFAULT_CHAIN = sepolia;

// Contract addresses (Updated after deployment on Sepolia)
export const CONTRACTS = {
  [sepolia.id]: {
    PermiPayBilling: '0x6B3c3435DfC8dE86018dC311915E8D7af826c3Fa', // ✅ Deployed & Verified
    ServiceRegistry: '0xC3a4B65224D8Fd4D3c7661175Ff5551e509675ff', // ✅ Deployed & Verified
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
