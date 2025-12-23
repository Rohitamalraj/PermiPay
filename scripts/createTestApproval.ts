/**
 * Create Test Token Approval Script
 * 
 * This script creates a test token approval on Sepolia to demonstrate
 * the Wallet Audit feature detecting risky approvals.
 */

import { createPublicClient, createWalletClient, http, parseUnits } from 'viem';
import { sepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

// USDC on Sepolia
const USDC_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';

// Random spender address (could be any contract)
const SPENDER_ADDRESS = '0x0000000000000000000000000000000000000001';

const PRIVATE_KEY = `0x${process.env.DEPLOYER_PRIVATE_KEY?.replace('0x', '')}` as `0x${string}`;

const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

async function main() {
  console.log('🔧 Creating Test Token Approval...\n');

  const account = privateKeyToAccount(PRIVATE_KEY);
  
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL),
  });

  const walletClient = createWalletClient({
    account,
    chain: sepolia,
    transport: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL),
  });

  console.log('👤 Wallet:', account.address);
  console.log('🪙 Token: USDC Sepolia');
  console.log('📍 Token Address:', USDC_ADDRESS);
  console.log('🎯 Spender:', SPENDER_ADDRESS);
  console.log('');

  // Check current balance
  const balance = await publicClient.readContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [account.address],
  });
  console.log(`💰 Current USDC Balance: ${Number(balance) / 1_000_000} USDC`);

  // Check current allowance
  const currentAllowance = await publicClient.readContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [account.address, SPENDER_ADDRESS],
  });
  console.log(`📊 Current Allowance: ${Number(currentAllowance) / 1_000_000} USDC\n`);

  if (Number(currentAllowance) > 0) {
    console.log('✅ Test approval already exists!');
    console.log('   You can now test the Wallet Audit feature.');
    return;
  }

  // Create unlimited approval (this is what we want to detect as risky!)
  console.log('⚠️  Creating UNLIMITED approval (for testing)...');
  console.log('   This is intentionally risky to demonstrate the audit feature.\n');

  const maxUint256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');

  const hash = await walletClient.writeContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'approve',
    args: [SPENDER_ADDRESS, maxUint256],
  });

  console.log('📝 Transaction sent:', hash);
  console.log('⏳ Waiting for confirmation...\n');

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  if (receipt.status === 'success') {
    console.log('✅ Test approval created successfully!');
    console.log(`   View on Etherscan: https://sepolia.etherscan.io/tx/${hash}\n`);

    // Verify the approval
    const newAllowance = await publicClient.readContract({
      address: USDC_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'allowance',
      args: [account.address, SPENDER_ADDRESS],
    });

    console.log('🔍 Verification:');
    console.log(`   New Allowance: UNLIMITED (${newAllowance.toString()})`);
    console.log('');
    console.log('🎯 Now test the Wallet Audit feature with your address:');
    console.log(`   ${account.address}`);
    console.log('');
    console.log('   The audit should detect:');
    console.log('   • Unlimited approval (HIGH RISK)');
    console.log('   • Unverified spender contract (HIGH RISK)');
    console.log('   • Recommendation to revoke');
  } else {
    console.log('❌ Transaction failed');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
