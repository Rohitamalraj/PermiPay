// Feature definitions for PermiPay Analytics
// Three core services with permission-metered billing
export interface Feature {
  id: string;
  name: string;
  description: string;
  cost: number; // in USDC
  icon: string;
  category: 'contract-analysis' | 'wallet-analysis';
  details: string;
}

export const FEATURES: Feature[] = [
  {
    id: 'CONTRACT_INSPECTOR',
    name: 'Contract Inspector',
    description: 'Analyse smart contract, view ABI, functions, verification status, and bytecode',
    cost: 0.30,
    icon: '🔧',
    category: 'contract-analysis',
    details: 'Full smart contract analysis including ABI parsing, function signatures, verification status on Etherscan, and bytecode inspection',
  },
  {
    id: 'WALLET_REPUTATION',
    name: 'Wallet Reputation Score',
    description: 'Behavior-based scoring for EVM wallets using on-chain activity analysis',
    cost: 0.40,
    icon: '🛡️',
    category: 'wallet-analysis',
    details: 'Comprehensive reputation scoring based on transaction patterns, contract interactions, token diversity, and historical behavior',
  },
  {
    id: 'ADDRESS_INSIGHTS',
    name: 'Address Insights',
    description: 'Deep wallet analysis with transaction history, token holdings, and activity metrics',
    cost: 0.50,
    icon: '🔍',
    category: 'wallet-analysis',
    details: 'Complete wallet profile with transaction history, ERC-20/721/1155 holdings, DeFi protocol interactions, and activity timeline',
  },
];

export const getFeatureById = (id: string): Feature | undefined => {
  return FEATURES.find(f => f.id === id);
};

export const getTotalFeatureCost = (featureIds: string[]): number => {
  return featureIds.reduce((total, id) => {
    const feature = getFeatureById(id);
    return total + (feature?.cost || 0);
  }, 0);
};
