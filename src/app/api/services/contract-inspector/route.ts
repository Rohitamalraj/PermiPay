import { NextRequest, NextResponse } from "next/server";

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
// Etherscan V2 API (Multichain API) - supports multiple chains with chainid parameter
const ETHERSCAN_API_URL = "https://api.etherscan.io/v2/api";
const SEPOLIA_CHAIN_ID = "11155111"; // Sepolia testnet chain ID

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json(
      { error: "Contract address is required" },
      { status: 400 }
    );
  }

  try {
    console.log("Fetching contract data for:", address);
    
    // Fetch contract source code and ABI from Etherscan V2 API
    const response = await fetch(
      `${ETHERSCAN_API_URL}?chainid=${SEPOLIA_CHAIN_ID}&module=contract&action=getsourcecode&address=${address}&apikey=${ETHERSCAN_API_KEY}`
    );

    if (!response.ok) {
      console.error("Etherscan API returned error:", response.status);
      throw new Error("Failed to fetch from Etherscan");
    }

    const data = await response.json();
    console.log("Etherscan response:", JSON.stringify(data).slice(0, 200));

    if (data.status === "0") {
      console.error("Etherscan error:", data.result);
      throw new Error(data.message || data.result || "Contract not found");
    }

    const contractInfo = data.result[0];
    
    if (!contractInfo) {
      throw new Error("No contract data returned from Etherscan");
    }
    
    const isVerified = contractInfo.SourceCode !== "";

    // Parse ABI if available
    let abi = null;
    let functions = null;

    if (isVerified && contractInfo.ABI !== "Contract source code not verified") {
      try {
        abi = JSON.parse(contractInfo.ABI);
        
        // Extract function signatures
        functions = abi
          .filter((item: any) => item.type === "function")
          .map((func: any) => ({
            name: func.name,
            type: func.type,
            inputs: func.inputs || [],
            outputs: func.outputs || [],
            stateMutability: func.stateMutability || "nonpayable",
          }));
      } catch (err) {
        console.error("Failed to parse ABI:", err);
      }
    }

    // Fetch bytecode using V2 API
    const bytecodeResponse = await fetch(
      `${ETHERSCAN_API_URL}?chainid=${SEPOLIA_CHAIN_ID}&module=proxy&action=eth_getCode&address=${address}&tag=latest&apikey=${ETHERSCAN_API_KEY}`
    );

    const bytecodeData = await bytecodeResponse.json();
    const bytecode = bytecodeData.result;

    console.log("Successfully processed contract data");

    return NextResponse.json({
      address,
      isVerified,
      contractName: contractInfo.ContractName || null,
      compilerVersion: contractInfo.CompilerVersion || null,
      abi,
      functions,
      bytecode,
      sourceCode: isVerified ? contractInfo.SourceCode : null,
    });
  } catch (error: any) {
    console.error("Contract Inspector API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze contract" },
      { status: 500 }
    );
  }
}
