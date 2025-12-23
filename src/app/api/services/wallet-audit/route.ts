import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, parseAbi } from "viem";
import { sepolia } from "viem/chains";

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const ETHERSCAN_API_URL = "https://api.etherscan.io/v2/api";
const SEPOLIA_CHAIN_ID = "11155111";

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL),
});

const ERC20_ABI = parseAbi([
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function name() external view returns (string)',
  'function symbol() external view returns (string)',
  'function decimals() external view returns (uint8)',
  'function balanceOf(address account) external view returns (uint256)',
]);

interface TokenApproval {
  token: {
    address: string;
    name: string;
    symbol: string;
    balance: string;
    decimals: number;
  };
  spender: {
    address: string;
    name: string;
    isVerified: boolean;
    lastUsed: number;
  };
  allowance: string;
  isUnlimited: boolean;
  riskLevel: "high" | "medium" | "low";
  recommendation: string;
}

interface AuditResult {
  address: string;
  securityScore: number;
  totalApprovals: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  approvals: TokenApproval[];
  recommendations: string[];
  lastAuditTime: number;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json(
      { error: "Wallet address is required" },
      { status: 400 }
    );
  }

  try {
    console.log("Starting wallet audit for:", address);

    // Step 1: Get all ERC-20 token transactions
    const tokenTxResponse = await fetch(
      `${ETHERSCAN_API_URL}?chainid=${SEPOLIA_CHAIN_ID}&module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${ETHERSCAN_API_KEY}`
    );

    if (!tokenTxResponse.ok) {
      throw new Error("Failed to fetch token transactions");
    }

    const tokenTxData = await tokenTxResponse.json();
    
    if (tokenTxData.status === "0" && tokenTxData.message !== "No transactions found") {
      console.error("Etherscan API Error:", tokenTxData.message);
      throw new Error(`Etherscan API Error: ${tokenTxData.message}`);
    }

    const transactions = tokenTxData.result || [];
    console.log(`Found ${transactions.length} token transactions`);
    
    // Step 2: Extract unique token and spender addresses from transactions
    const tokenSpenderPairs = new Map<string, Set<string>>();
    
    // Common spender addresses to always check
    const commonSpenders = [
      '0x6B3c3435DfC8dE86018dC311915E8D7af826c3Fa', // PermiPayBilling
      '0x0000000000000000000000000000000000000001', // Test spender
    ];
    
    transactions.forEach((tx: any) => {
      const tokenAddr = tx.contractAddress.toLowerCase();
      if (!tokenSpenderPairs.has(tokenAddr)) {
        tokenSpenderPairs.set(tokenAddr, new Set());
      }
      // Add both 'to' and 'from' as potential spenders
      if (tx.to && tx.to.toLowerCase() !== address.toLowerCase()) {
        tokenSpenderPairs.get(tokenAddr)!.add(tx.to.toLowerCase());
      }
    });
    
    // Add common spenders to all discovered tokens
    for (const [tokenAddr, spenders] of tokenSpenderPairs) {
      commonSpenders.forEach(spender => spenders.add(spender.toLowerCase()));
    }
    
    console.log(`Checking ${tokenSpenderPairs.size} tokens with potential spenders`);

    // Step 3: For each token-spender pair, check current allowance
    const approvals: TokenApproval[] = [];
    
    for (const [tokenAddress, spenders] of tokenSpenderPairs) {
      try {
        // Get token info
        const [name, symbol, decimals, balance] = await Promise.all([
          publicClient.readContract({
            address: tokenAddress as `0x${string}`,
            abi: ERC20_ABI,
            functionName: 'name',
          }).catch(() => 'Unknown Token'),
          publicClient.readContract({
            address: tokenAddress as `0x${string}`,
            abi: ERC20_ABI,
            functionName: 'symbol',
          }).catch(() => 'UNKNOWN'),
          publicClient.readContract({
            address: tokenAddress as `0x${string}`,
            abi: ERC20_ABI,
            functionName: 'decimals',
          }).catch(() => 18),
          publicClient.readContract({
            address: tokenAddress as `0x${string}`,
            abi: ERC20_ABI,
            functionName: 'balanceOf',
            args: [address as `0x${string}`],
          }).catch(() => 0n),
        ]);

        // Check allowances for each spender
        for (const spender of spenders) {
          try {
            const allowance = await publicClient.readContract({
              address: tokenAddress as `0x${string}`,
              abi: ERC20_ABI,
              functionName: 'allowance',
              args: [address as `0x${string}`, spender as `0x${string}`],
            });

            console.log(`Checking ${symbol} approval for ${spender}: ${allowance.toString()}`);

            // Only include if there's an active allowance
            if (allowance > 0n) {
              console.log(`Found approval: ${symbol} -> ${spender} = ${allowance.toString()}`);
              // Check if spender contract is verified
              const verificationResponse = await fetch(
                `${ETHERSCAN_API_URL}?chainid=${SEPOLIA_CHAIN_ID}&module=contract&action=getsourcecode&address=${spender}&apikey=${ETHERSCAN_API_KEY}`
              );
              const verificationData = await verificationResponse.json();
              const isVerified = verificationData.result?.[0]?.SourceCode !== "";
              const contractName = verificationData.result?.[0]?.ContractName || "Unknown Contract";

              // Find last interaction timestamp
              const lastTx = transactions.find((tx: any) => 
                tx.to?.toLowerCase() === spender && 
                tx.contractAddress?.toLowerCase() === tokenAddress
              );
              const lastUsed = lastTx ? parseInt(lastTx.timeStamp) * 1000 : Date.now();

              // Check if unlimited approval
              const unlimitedThreshold = BigInt("57896044618658097711785492504343953926634992332820282019728792003956564819968"); // 2^255
              const isUnlimited = allowance >= unlimitedThreshold;

              // Calculate risk level
              const riskLevel = calculateRiskLevel({
                isUnlimited,
                isVerified,
                lastUsed,
                tokenBalance: balance,
              });

              const approval: TokenApproval = {
                token: {
                  address: tokenAddress,
                  name: name as string,
                  symbol: symbol as string,
                  balance: balance.toString(),
                  decimals: decimals as number,
                },
                spender: {
                  address: spender,
                  name: contractName,
                  isVerified,
                  lastUsed,
                },
                allowance: allowance.toString(),
                isUnlimited,
                riskLevel,
                recommendation: generateRecommendation(riskLevel, isUnlimited, isVerified, lastUsed),
              };

              approvals.push(approval);
            }
          } catch (error) {
            console.error(`Error checking allowance for ${tokenAddress}-${spender}:`, error);
          }
        }
      } catch (error) {
        console.error(`Error processing token ${tokenAddress}:`, error);
      }
    }

    // Step 4: Calculate security metrics
    const highRiskCount = approvals.filter(a => a.riskLevel === "high").length;
    const mediumRiskCount = approvals.filter(a => a.riskLevel === "medium").length;
    const lowRiskCount = approvals.filter(a => a.riskLevel === "low").length;
    
    const securityScore = calculateSecurityScore(approvals);
    const recommendations = generateRecommendations(approvals);

    const result: AuditResult = {
      address,
      securityScore,
      totalApprovals: approvals.length,
      highRiskCount,
      mediumRiskCount,
      lowRiskCount,
      approvals,
      recommendations,
      lastAuditTime: Date.now(),
    };

    console.log(`Audit complete: ${approvals.length} approvals found, score: ${securityScore}`);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in wallet audit:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

function calculateRiskLevel(params: {
  isUnlimited: boolean;
  isVerified: boolean;
  lastUsed: number;
  tokenBalance: bigint;
}): "high" | "medium" | "low" {
  const { isUnlimited, isVerified, lastUsed, tokenBalance } = params;
  
  const risks: string[] = [];
  
  if (isUnlimited) risks.push("unlimited");
  if (!isVerified) risks.push("unverified");
  
  const sixMonthsAgo = Date.now() - (180 * 24 * 60 * 60 * 1000);
  if (lastUsed < sixMonthsAgo) risks.push("inactive");
  
  if (tokenBalance > 0n) risks.push("has-balance");
  
  if (risks.length >= 3 || (isUnlimited && !isVerified)) return "high";
  if (risks.length >= 2) return "medium";
  return "low";
}

function generateRecommendation(
  riskLevel: string,
  isUnlimited: boolean,
  isVerified: boolean,
  lastUsed: number
): string {
  if (riskLevel === "high") {
    if (isUnlimited && !isVerified) {
      return "⚠️ URGENT: Unlimited approval to unverified contract. Revoke immediately.";
    }
    return "⚠️ High risk approval. Consider revoking to protect your funds.";
  }
  
  if (riskLevel === "medium") {
    const sixMonthsAgo = Date.now() - (180 * 24 * 60 * 60 * 1000);
    if (lastUsed < sixMonthsAgo) {
      return "⚡ Not used in 6+ months. Safe to revoke.";
    }
    return "⚡ Moderate risk. Review and consider limiting approval amount.";
  }
  
  return "✅ Low risk. Monitor periodically.";
}

function calculateSecurityScore(approvals: TokenApproval[]): number {
  let score = 100;
  
  approvals.forEach(approval => {
    if (approval.riskLevel === "high") score -= 15;
    else if (approval.riskLevel === "medium") score -= 5;
    else score -= 2;
  });
  
  // Bonus for having few approvals
  if (approvals.length === 0) score = 100;
  else if (approvals.length < 5) score += 10;
  
  return Math.max(0, Math.min(100, score));
}

function generateRecommendations(approvals: TokenApproval[]): string[] {
  const recommendations: string[] = [];
  
  const highRiskCount = approvals.filter(a => a.riskLevel === "high").length;
  const unlimitedCount = approvals.filter(a => a.isUnlimited).length;
  const unverifiedCount = approvals.filter(a => !a.spender.isVerified).length;
  
  const sixMonthsAgo = Date.now() - (180 * 24 * 60 * 60 * 1000);
  const inactiveCount = approvals.filter(a => a.spender.lastUsed < sixMonthsAgo).length;
  
  if (highRiskCount > 0) {
    recommendations.push(`🚨 Revoke ${highRiskCount} high-risk approval${highRiskCount > 1 ? 's' : ''} immediately`);
  }
  
  if (unlimitedCount > 3) {
    recommendations.push(`⚠️ You have ${unlimitedCount} unlimited approvals. Limit amounts when possible.`);
  }
  
  if (unverifiedCount > 0) {
    recommendations.push(`🔍 ${unverifiedCount} approval${unverifiedCount > 1 ? 's' : ''} to unverified contracts. Verify safety before keeping.`);
  }
  
  if (inactiveCount > 0) {
    recommendations.push(`🧹 Remove ${inactiveCount} inactive approval${inactiveCount > 1 ? 's' : ''} not used in 6+ months`);
  }
  
  if (recommendations.length === 0) {
    recommendations.push("✅ Your wallet security looks good! Keep monitoring regularly.");
  }
  
  return recommendations;
}
