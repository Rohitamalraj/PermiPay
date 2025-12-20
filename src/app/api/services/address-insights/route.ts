import { NextRequest, NextResponse } from "next/server";

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const ETHERSCAN_API_URL = "https://api-sepolia.etherscan.io/api";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json(
      { error: "Address is required" },
      { status: 400 }
    );
  }

  try {
    // Fetch ETH balance
    const balanceResponse = await fetch(
      `${ETHERSCAN_API_URL}?module=account&action=balance&address=${address}&tag=latest&apikey=${ETHERSCAN_API_KEY}`
    );
    const balanceData = await balanceResponse.json();
    const ethBalance = balanceData.status === "1" ? parseFloat(balanceData.result) / 1e18 : 0;

    // Rough ETH to USD conversion (would use real price feed in production)
    const ethPriceUSD = 2000; // Placeholder
    const usdBalance = ethBalance * ethPriceUSD;

    // Fetch ERC-20 token balances
    const tokenResponse = await fetch(
      `${ETHERSCAN_API_URL}?module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${ETHERSCAN_API_KEY}`
    );
    const tokenData = await tokenResponse.json();
    const tokenTransfers = tokenData.result || [];

    // Calculate token holdings
    const tokenBalances = calculateTokenBalances(address, tokenTransfers);

    // Fetch transactions
    const txResponse = await fetch(
      `${ETHERSCAN_API_URL}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${ETHERSCAN_API_KEY}`
    );
    const txData = await txResponse.json();
    const transactions = txData.result || [];

    // Calculate stats
    const stats = calculateStats(address, transactions);

    // Format transactions
    const formattedTransactions = transactions.slice(0, 50).map((tx: any) => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: parseFloat(tx.value) / 1e18,
      timestamp: parseInt(tx.timeStamp),
      isIncoming: tx.to.toLowerCase() === address.toLowerCase(),
      success: tx.isError === "0",
    }));

    return NextResponse.json({
      address,
      balance: {
        eth: ethBalance,
        usd: usdBalance,
      },
      tokens: tokenBalances,
      transactions: formattedTransactions,
      stats,
    });
  } catch (error: any) {
    console.error("Address Insights API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch address insights" },
      { status: 500 }
    );
  }
}

function calculateTokenBalances(address: string, transfers: any[]): any[] {
  const balances: Record<string, {
    contractAddress: string;
    name: string;
    symbol: string;
    balance: number;
    decimals: number;
  }> = {};

  transfers.forEach((transfer: any) => {
    const tokenAddress = transfer.contractAddress.toLowerCase();
    const decimals = parseInt(transfer.tokenDecimal);
    const value = parseFloat(transfer.value) / Math.pow(10, decimals);

    if (!balances[tokenAddress]) {
      balances[tokenAddress] = {
        contractAddress: transfer.contractAddress,
        name: transfer.tokenName,
        symbol: transfer.tokenSymbol,
        balance: 0,
        decimals,
      };
    }

    // Add/subtract based on direction
    if (transfer.to.toLowerCase() === address.toLowerCase()) {
      balances[tokenAddress].balance += value;
    } else if (transfer.from.toLowerCase() === address.toLowerCase()) {
      balances[tokenAddress].balance -= value;
    }
  });

  // Filter out zero balances and return array
  return Object.values(balances)
    .filter(token => token.balance > 0.0001)
    .sort((a, b) => b.balance - a.balance);
}

function calculateStats(address: string, transactions: any[]): any {
  if (transactions.length === 0) {
    return {
      totalTransactions: 0,
      totalSent: 0,
      totalReceived: 0,
      firstActivity: 0,
      lastActivity: 0,
    };
  }

  let totalSent = 0;
  let totalReceived = 0;

  transactions.forEach((tx: any) => {
    const value = parseFloat(tx.value) / 1e18;
    
    if (tx.from.toLowerCase() === address.toLowerCase()) {
      totalSent += value;
    } else if (tx.to.toLowerCase() === address.toLowerCase()) {
      totalReceived += value;
    }
  });

  // Transactions are sorted desc, so first in array is most recent
  const lastActivity = parseInt(transactions[0].timeStamp);
  const firstActivity = parseInt(transactions[transactions.length - 1].timeStamp);

  return {
    totalTransactions: transactions.length,
    totalSent,
    totalReceived,
    firstActivity,
    lastActivity,
  };
}
