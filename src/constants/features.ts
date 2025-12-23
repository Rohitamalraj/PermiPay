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
    cost: 0.05,
    icon: '🔧',
    category: 'contract-analysis',
    details: 'Full smart contract analysis including ABI parsing, function signatures, verification status on Etherscan, and bytecode inspection',
  },
  {
    id: 'WALLET_REPUTATION',
    name: 'Wallet Reputation Score',
    description: 'Behavior-based scoring for EVM wallets using on-chain activity analysis',
    cost: 0.10,
    icon: '🛡️',
    category: 'wallet-analysis',
    details: 'Comprehensive reputation scoring based on transaction patterns, contract interactions, token diversity, and historical behavior',
  },
  {
    id: 'WALLET_AUDIT',
    name: 'Wallet Security Audit',
    description: 'Scan for risky token approvals and get actionable security recommendations',
    cost: 0.15,
    icon: '🔒',
    category: 'wallet-analysis',
    details: 'Proactive security check that identifies unlimited approvals, unverified contracts, and inactive permissions with AI-powered risk analysis',
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
