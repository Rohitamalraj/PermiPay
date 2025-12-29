# PermiPay 🚀

**Permission-Metered Web3 Analytics Platform**

PermiPay is a permission-metered Web3 analytics dApp that replaces flat subscriptions with wallet-controlled, pay-per-use access to advanced DeFi insights. Built on MetaMask Advanced Permissions (ERC-7715), it lets users grant a bounded USDC allowance (for example, $5-$10 per month) that the app can spend only when they actually trigger premium features like Contract Inspector, Wallet Audit, and Wallet Reputation analysis. Each advanced query pulls a small, fixed fee (from $0.05 to $0.15) from that allowance, while users retain full control: they can cap spend, see every charge in a real-time dashboard, and revoke permissions at any time—instead of being locked into recurring subscription plans.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15.1.0-black)](https://nextjs.org/)
[![Ethereum](https://img.shields.io/badge/Ethereum-Sepolia-blue)](https://sepolia.etherscan.io/)

---

## 🎯 Key Features

- **🔐 One-Time Permissions**: Grant spending approval once, use services seamlessly
- **⛽ Gasless Transactions**: Pimlico paymaster sponsors all gas fees via ERC-4337
- **📊 Real-time Analytics**: Envio HyperIndex provides instant blockchain event indexing
- **💰 Budget Control**: Set spending limits and expiration dates for permissions
- **🤖 AI-Powered Analysis**: Smart contract security analysis with Groq AI (Llama 3.3 70B)
- **📈 Personal Dashboard**: Track your spending, service usage, and transaction history
- **🔍 Multi-Service Platform**: Contract Inspector, Wallet Audit, Wallet Reputation

---

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 15.1.0 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Web3**: Wagmi 2.x + Viem 2.43.1
- **Charts**: Chart.js

### Blockchain
- **Network**: Ethereum Sepolia Testnet
- **Smart Contracts**: 
  - PermiPayBilling: `0x6B3c3435DfC8dE86018dC311915E8D7af826c3Fa`
  - USDC Token: `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`
- **Account Abstraction**: ERC-4337 (Pimlico)
- **Advanced Permissions**: ERC-7715 (MetaMask)

### Infrastructure
- **Indexer**: Envio HyperIndex v2.32.3
- **GraphQL Endpoint**: `https://indexer.dev.hyperindex.xyz/9e3cfe0/v1/graphql`
- **Bundler/Paymaster**: Pimlico
- **APIs**: Etherscan, Groq AI

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- MetaMask Flask (for ERC-7715 support)
- Sepolia ETH and USDC (for testing)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Rohitamalraj/PermiPay.git
cd PermiPay/permipayapp
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file:
```env
# Blockchain
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
NEXT_PUBLIC_PIMLICO_API_KEY=your_pimlico_key

# Contract Addresses
NEXT_PUBLIC_PERMIPAY_BILLING=0x6B3c3435DfC8dE86018dC311915E8D7af826c3Fa
NEXT_PUBLIC_USDC_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238

# Envio GraphQL
NEXT_PUBLIC_ENVIO_GRAPHQL_URL=https://indexer.dev.hyperindex.xyz/9e3cfe0/v1/graphql

# APIs
ETHERSCAN_API_KEY=your_etherscan_key
GROQ_API_KEY=your_groq_key
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open the app**
Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📖 How It Works

### 1. Grant Permission (One-Time Setup)

```typescript
// User grants spending permission via MetaMask ERC-7715
const permission = await erc7715Client.requestExecutionPermissions([{
  chainId: sepolia.id,
  permission: {
    type: 'erc20-token-periodic',
    data: {
      tokenAddress: USDC_ADDRESS,
      periodAmount: '10000000', // $10.00
      periodDuration: 2592000,  // 30 days
    }
  }
}]);
```

**What happens:**
- User approves $10.00 spending limit for 30 days
- Session account created for gasless transactions
- Permission stored both in MetaMask and on-chain

### 2. Use Services (Gasless & Automatic)

```typescript
// Execute service - automatically deducts payment
const txHash = await executeService(ServiceType.CONTRACT_INSPECTOR, contractAddress);
```

**What happens:**
- No MetaMask popup (permission already granted)
- Pimlico pays gas fees (user pays $0 gas)
- $0.05 USDC automatically deducted from permission
- Transaction completes in ~3 seconds
- Envio indexes event immediately

### 3. Track Activity (Real-time Dashboard)

```graphql
query {
  ServiceExecution(where: {user: {_eq: "0x272f..."}}) {
    serviceType
    cost
    timestamp
    transactionHash
  }
}
```

**What you see:**
- Total spent: $3.80 / $10.00
- Service breakdown: 25 transactions
- Transaction history with Etherscan links
- Permission expiry: Jan 22, 2026

---

## 🎨 Key Pages

### 🏠 Home (`/`)
Landing page with platform overview and feature highlights

### 📊 Analytics (`/analytics`)
- Global platform statistics
- Revenue trends (30-day chart)
- Service usage breakdown
- Active permissions list
- User statistics with progress bars

### 👤 Dashboard (`/dashboard`)
- Personal spending overview
- Permission status (Active/Expired)
- Service usage breakdown
- Complete transaction history
- Budget tracking with progress bars

### 🔍 Contract Inspector (`/services/contract-inspector`)
- Analyze any verified Ethereum contract
- View ABI, functions, and bytecode
- AI-powered security analysis
- Auto-charge $0.05 per analysis
- Gasless execution

### 🛡️ Wallet Audit (`/services/wallet-audit`)
- Comprehensive wallet security analysis
- Transaction pattern analysis
- Auto-charge $0.15 per audit

### ⭐ Wallet Reputation (`/services/wallet-reputation`)
- Wallet reputation scoring
- Activity analysis
- Auto-charge $0.10 per check

---

## 🔐 ERC-7715 Advanced Permissions

### How ERC-7715 Works

**Traditional Flow** (Annoying):
```
User → Click Button → MetaMask Popup → Confirm → Wait → Repeat...
```

**PermiPay Flow** (Seamless):
```
User → Grant Permission Once → Use Services Forever → No Popups! 🎉
```

### Implementation Highlights

**Permission Grant:**
```typescript
// One-time permission grant
await contract.grantPermission(
  sessionAccount,     // Session account address
  10_000_000,        // $10.00 USDC
  2_592_000          // 30 days
);
```

**Gasless Execution:**
```typescript
// Execute via session account (user pays $0 gas)
const userOp = await bundlerClient.sendUserOperation({
  account: sessionSmartAccount,
  calls: [{
    to: PermiPayBilling,
    data: encodeFunctionData({
      functionName: 'executeService',
      args: [userAddress, ServiceType.CONTRACT_INSPECTOR]
    })
  }]
});
```

**Smart Contract Check:**
```solidity
function executeService(address user, uint8 serviceType) external {
    Permission storage permission = userPermissions[user];
    require(permission.isActive, "Permission not active");
    require(block.timestamp <= permission.expiresAt, "Expired");
    
    uint256 cost = servicePrices[serviceType];
    require(permission.spentAmount + cost <= permission.spendingLimit, "Insufficient budget");
    
    IERC20(usdc).transferFrom(user, address(this), cost);
    permission.spentAmount += cost;
    
    emit ServiceExecuted(user, serviceType, cost, msg.sender);
}
```

---

## 📊 Envio HyperIndex Integration

### What Envio Indexes

**Events from PermiPayBilling Contract:**
```yaml
events:
  - PermissionGranted(address,uint256,uint256,uint256)
  - ServiceExecuted(address,uint8,uint256,address)
```

**Real-time Data Available:**
- Permission grants and expirations
- Service executions (25 events indexed)
- User spending totals ($3.80)
- Global platform stats ($3.70 revenue)
- Service type breakdown

### GraphQL Queries

**User Dashboard:**
```graphql
query UserData($address: String!) {
  ServiceExecution(
    where: {user: {_eq: $address}}
    order_by: {timestamp: desc}
    limit: 50
  ) {
    id
    serviceType
    cost
    timestamp
    transactionHash
  }
}
```

**Analytics Dashboard:**
```graphql
query GlobalStats {
  GlobalStats {
    totalRevenue
    totalExecutions
    uniqueUsers
    activePermissions
  }
  
  DailyStats(order_by: {date: desc}, limit: 30) {
    date
    revenue
    executions
  }
}
```

---

## 💳 Service Pricing

| Service | Cost | Description |
|---------|------|-------------|
| 🔍 **Contract Inspector** | $0.05 | Analyze smart contracts, view ABI, AI analysis |
| 🛡️ **Wallet Audit** | $0.15 | Comprehensive wallet security analysis |
| ⭐ **Wallet Reputation** | $0.10 | Wallet reputation scoring and activity analysis |

**Payment Method:** USDC (6 decimals) on Sepolia  
**Gas Fees:** $0 (sponsored by Pimlico)

---

## 🛠️ Project Structure

```
permipayapp/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Home page
│   │   ├── analytics/page.tsx       # Platform analytics
│   │   ├── dashboard/page.tsx       # User dashboard
│   │   └── services/
│   │       ├── contract-inspector/  # Contract analysis
│   │       ├── wallet-audit/        # Wallet security
│   │       └── wallet-reputation/   # Reputation check
│   ├── components/
│   │   ├── permissions/             # Permission UI components
│   │   └── ui/                      # Reusable UI components
│   ├── hooks/
│   │   └── useAdvancedPermissions.ts # ERC-7715 logic
│   ├── lib/
│   │   ├── smartAccount.ts          # Smart account creation
│   │   └── bundler.ts               # Pimlico integration
│   └── constants/
│       └── chains.ts                # Contract addresses
├── contracts/
│   └── PermiPayBilling.sol          # Main billing contract
└── Envio/
    ├── config.yaml                  # Envio configuration
    └── src/EventHandlers.ts         # Event indexing logic
```

---

## 🧪 Testing

### Test with Real Services

1. **Get Sepolia ETH**: [Sepolia Faucet](https://sepoliafaucet.com/)
2. **Get Sepolia USDC**: [USDC Faucet](https://faucet.circle.com/)
3. **Install MetaMask Flask**: [Download](https://chromewebstore.google.com/detail/metamask-flask-developmen/ljfoeinjpaedjfecbmggjgodbgkmjkjk)
4. **Grant Permission**: Visit app, connect wallet, grant $10 permission
5. **Use Services**: Analyze contracts, check wallets, track spending

### View on Blockchain

- **Transactions**: [Sepolia Etherscan](https://sepolia.etherscan.io/)
- **Contract**: `0x6B3c3435DfC8dE86018dC311915E8D7af826c3Fa`
- **Your Dashboard**: Shows all 25 transactions indexed by Envio

---

## 📈 Live Stats (Current Deployment)

- **Total Users**: 2
- **Active Permissions**: 2
- **Total Revenue**: $3.70
- **Total Executions**: 25
- **Envio Status**: ✅ Fully synced (100%)
- **Indexer Latency**: ~2-3 seconds

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 🔗 Links

- **GitHub**: [https://github.com/Rohitamalraj/PermiPay](https://github.com/Rohitamalraj/PermiPay)
- **Live Demo**: Coming soon
- **Envio Dashboard**: [https://envio.dev](https://envio.dev)
- **Pimlico**: [https://pimlico.io](https://pimlico.io)

---

## 🙏 Acknowledgments

- **Envio** for real-time blockchain indexing
- **Pimlico** for gasless transaction infrastructure
- **MetaMask** for ERC-7715 Advanced Permissions
- **Groq** for AI-powered contract analysis
- **Etherscan** for verified contract data

---

## 📧 Contact

For questions or support, please open an issue on GitHub.

Built with ❤️ using Next.js, Envio, and ERC-7715
