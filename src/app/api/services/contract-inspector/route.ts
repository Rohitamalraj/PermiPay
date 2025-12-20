import { NextRequest, NextResponse } from "next/server";

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const ETHERSCAN_API_URL = "https://api-sepolia.etherscan.io/api";

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
    // Fetch contract source code and ABI from Etherscan
    const response = await fetch(
      `${ETHERSCAN_API_URL}?module=contract&action=getsourcecode&address=${address}&apikey=${ETHERSCAN_API_KEY}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch from Etherscan");
    }

    const data = await response.json();

    if (data.status === "0") {
      throw new Error(data.result || "Contract not found");
    }

    const contractInfo = data.result[0];
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

    // Fetch bytecode
    const bytecodeResponse = await fetch(
      `${ETHERSCAN_API_URL}?module=proxy&action=eth_getCode&address=${address}&tag=latest&apikey=${ETHERSCAN_API_KEY}`
    );

    const bytecodeData = await bytecodeResponse.json();
    const bytecode = bytecodeData.result;

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
