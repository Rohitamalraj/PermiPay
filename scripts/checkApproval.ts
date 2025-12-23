/**
 * Check Token Approval Script
 * Directly queries the blockchain to verify the approval exists
 */

import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const USDC_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';
const WALLET_ADDRESS = '0x2c32743B801B9c3d53099334e2ac5a8DA39498bC';
const SPENDER_ADDRESS = '0x0000000000000000000000000000000000000001';

const ERC20_ABI = [
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
] as const;

async function main() {
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL),
  });

  console.log('🔍 Checking approval on-chain...\n');
  console.log('Owner:', WALLET_ADDRESS);
  console.log('Spender:', SPENDER_ADDRESS);
  console.log('Token: USDC\n');

  const allowance = await publicClient.readContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [WALLET_ADDRESS as `0x${string}`, SPENDER_ADDRESS as `0x${string}`],
  });

  console.log('📊 Current Allowance:', allowance.toString());
  
  if (allowance > 0n) {
    console.log('✅ Approval exists on-chain!');
    console.log('   Amount:', allowance === BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff') 
      ? 'UNLIMITED' 
      : allowance.toString());
  } else {
    console.log('❌ No approval found');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
