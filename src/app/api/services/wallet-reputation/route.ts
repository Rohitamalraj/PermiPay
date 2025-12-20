import { NextRequest, NextResponse } from "next/server";

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const ETHERSCAN_API_URL = "https://api-sepolia.etherscan.io/api";

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
    // Fetch transaction list
    const txResponse = await fetch(
      `${ETHERSCAN_API_URL}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${ETHERSCAN_API_KEY}`
    );

    const txData = await txResponse.json();

    if (txData.status === "0" && txData.message !== "No transactions found") {
      throw new Error("Failed to fetch transaction data");
    }

    const transactions = txData.result || [];

    // Fetch ERC-20 token transfers
    const tokenTxResponse = await fetch(
      `${ETHERSCAN_API_URL}?module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${ETHERSCAN_API_KEY}`
    );

    const tokenTxData = await tokenTxResponse.json();
    const tokenTransfers = tokenTxData.result || [];

    // Calculate metrics
    const transactionCount = transactions.length;
    const accountAge = calculateAccountAge(transactions);
    const avgTransactionValue = calculateAvgTxValue(transactions);
    const uniqueInteractions = calculateUniqueInteractions(transactions);
    const contractInteractions = calculateContractInteractions(transactions);
    const tokenDiversity = calculateTokenDiversity(tokenTransfers);

    // Calculate overall score (0-100)
    const overallScore = calculateReputationScore({
      transactionCount,
      accountAge,
      avgTransactionValue,
      uniqueInteractions,
      contractInteractions,
      tokenDiversity,
    });

    // Determine risk level
    const riskLevel = overallScore >= 70 ? "low" : overallScore >= 40 ? "medium" : "high";

    // Identify behavior patterns
    const behaviorPatterns = {
      isActiveTrader: transactionCount > 100,
      isDeFiUser: contractInteractions > 20,
      isNFTCollector: false, // Would need NFT transfer data
      hasLargeTransactions: avgTransactionValue > 1000,
    };

    // Generate risk flags and trust indicators
    const riskFlags = [];
    const trustIndicators = [];

    if (transactionCount < 10) {
      riskFlags.push("Low transaction history - new or inactive wallet");
    }
    if (accountAge < 30) {
      riskFlags.push("Recently created account");
    }
    if (uniqueInteractions < 5) {
      riskFlags.push("Limited interaction with other addresses");
    }

    if (accountAge > 365) {
      trustIndicators.push("Mature account (over 1 year old)");
    }
    if (transactionCount > 100) {
      trustIndicators.push("High activity level");
    }
    if (contractInteractions > 20) {
      trustIndicators.push("Active DeFi participant");
    }
    if (tokenDiversity > 10) {
      trustIndicators.push("Diverse token portfolio");
    }

    return NextResponse.json({
      address,
      overallScore,
      riskLevel,
      metrics: {
        transactionCount,
        accountAge,
        avgTransactionValue,
        uniqueInteractions,
        contractInteractions,
        tokenDiversity,
      },
      behaviorPatterns,
      riskFlags,
      trustIndicators,
    });
  } catch (error: any) {
    console.error("Wallet Reputation API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze wallet" },
      { status: 500 }
    );
  }
}

function calculateAccountAge(transactions: any[]): number {
  if (transactions.length === 0) return 0;
  
  const firstTx = transactions[0];
  const firstTxDate = new Date(parseInt(firstTx.timeStamp) * 1000);
  const now = new Date();
  const ageInDays = Math.floor((now.getTime() - firstTxDate.getTime()) / (1000 * 60 * 60 * 24));
  
  return ageInDays;
}

function calculateAvgTxValue(transactions: any[]): number {
  if (transactions.length === 0) return 0;
  
  const totalValue = transactions.reduce((sum, tx) => {
    return sum + parseFloat(tx.value) / 1e18;
  }, 0);
  
  return totalValue / transactions.length;
}

function calculateUniqueInteractions(transactions: any[]): number {
  const uniqueAddresses = new Set<string>();
  
  transactions.forEach(tx => {
    if (tx.to) uniqueAddresses.add(tx.to.toLowerCase());
    if (tx.from) uniqueAddresses.add(tx.from.toLowerCase());
  });
  
  return uniqueAddresses.size;
}

function calculateContractInteractions(transactions: any[]): number {
  return transactions.filter(tx => tx.input && tx.input !== "0x").length;
}

function calculateTokenDiversity(tokenTransfers: any[]): number {
  const uniqueTokens = new Set<string>();
  
  tokenTransfers.forEach(transfer => {
    if (transfer.contractAddress) {
      uniqueTokens.add(transfer.contractAddress.toLowerCase());
    }
  });
  
  return uniqueTokens.size;
}

function calculateReputationScore(metrics: {
  transactionCount: number;
  accountAge: number;
  avgTransactionValue: number;
  uniqueInteractions: number;
  contractInteractions: number;
  tokenDiversity: number;
}): number {
  // Weighted scoring algorithm
  let score = 0;
  
  // Transaction count (max 20 points)
  score += Math.min(metrics.transactionCount / 5, 20);
  
  // Account age (max 25 points)
  score += Math.min(metrics.accountAge / 30, 25);
  
  // Unique interactions (max 20 points)
  score += Math.min(metrics.uniqueInteractions / 2, 20);
  
  // Contract interactions (max 20 points)
  score += Math.min(metrics.contractInteractions / 2, 20);
  
  // Token diversity (max 15 points)
  score += Math.min(metrics.tokenDiversity, 15);
  
  return Math.min(Math.round(score), 100);
}
