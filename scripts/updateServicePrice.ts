/**
 * Update Service Price Script
 * 
 * This script updates the price of a service in the PermiPayBilling contract.
 * Only the contract owner can execute this function.
 */

import { createPublicClient, createWalletClient, http, parseUnits } from 'viem';
import { sepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const CONTRACT_ADDRESS = '0x6B3c3435DfC8dE86018dC311915E8D7af826c3Fa';
const PRIVATE_KEY = `0x${process.env.DEPLOYER_PRIVATE_KEY?.replace('0x', '')}` as `0x${string}`;

// Service Types
enum ServiceType {
  CONTRACT_INSPECTOR = 0,
  WALLET_REPUTATION = 1,
  WALLET_AUDIT = 2, // Using ADDRESS_INSIGHTS slot
}

const CONTRACT_ABI = [
  {
    name: 'updateServicePrice',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'serviceType', type: 'uint8' },
      { name: 'newPrice', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    name: 'servicePrices',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'uint8' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'treasury',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
] as const;

async function main() {
  console.log('🔧 Updating Service Prices...\n');

  // Create clients
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL),
  });

  const account = privateKeyToAccount(PRIVATE_KEY);
  const walletClient = createWalletClient({
    account,
    chain: sepolia,
    transport: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL),
  });

  console.log('📍 Contract:', CONTRACT_ADDRESS);
  console.log('👤 Owner:', account.address);
  console.log('');

  // Check current prices
  console.log('📊 Current Prices:');
  const contractInspectorPrice = await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'servicePrices',
    args: [ServiceType.CONTRACT_INSPECTOR],
  });
  console.log(`   Contract Inspector: $${Number(contractInspectorPrice) / 1_000_000} USDC`);

  const walletReputationPrice = await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'servicePrices',
    args: [ServiceType.WALLET_REPUTATION],
  });
  console.log(`   Wallet Reputation: $${Number(walletReputationPrice) / 1_000_000} USDC`);

  const walletAuditPrice = await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'servicePrices',
    args: [ServiceType.WALLET_AUDIT],
  });
  console.log(`   Wallet Audit: $${Number(walletAuditPrice) / 1_000_000} USDC`);

  // Check treasury address
  const treasury = await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'treasury',
  });
  console.log('\n💰 Treasury Address:', treasury);
  console.log('   (This is where service fees are sent)');

  // Update Wallet Audit price to $0.15
  console.log('\n🔄 Updating Wallet Audit price to $0.15...');
  const newPrice = parseUnits('0.15', 6); // $0.15 = 150000 (0.15 * 1e6)

  const hash = await walletClient.writeContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'updateServicePrice',
    args: [ServiceType.WALLET_AUDIT, newPrice],
    maxFeePerGas: parseUnits('50', 9), // 50 gwei
    maxPriorityFeePerGas: parseUnits('2', 9), // 2 gwei priority
  });

  console.log('📝 Transaction Hash:', hash);
  console.log('🔗 View on Etherscan:', `https://sepolia.etherscan.io/tx/${hash}`);
  console.log('⏳ Waiting for confirmation (this may take a few minutes on Sepolia)...');

  try {
    const receipt = await publicClient.waitForTransactionReceipt({ 
      hash,
      timeout: 300_000, // 5 minutes timeout
    });
    console.log('✅ Transaction confirmed!');
    
    // Verify new price
    const updatedPrice = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'servicePrices',
      args: [ServiceType.WALLET_AUDIT],
    });

    console.log('\n✅ Price Updated Successfully!');
    console.log(`   New Wallet Audit Price: $${Number(updatedPrice) / 1_000_000} USDC`);
  } catch (error) {
    console.log('\n⚠️  Transaction submitted but confirmation timed out.');
    console.log('   Please check Etherscan link above to verify the transaction status.');
    console.log('   The price update will be active once the transaction is confirmed.');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
