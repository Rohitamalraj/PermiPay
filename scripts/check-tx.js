import hre from "hardhat";

async function main() {
  const txHash = "0xa6d3efcd2e7c3f05ed198f42c11928b6d9d7f255bd4a60a76fed1d5421079eef";
  
  console.log("Checking transaction:", txHash);
  
  try {
    const tx = await hre.ethers.provider.getTransaction(txHash);
    
    if (!tx) {
      console.log("❌ Transaction not found");
      return;
    }
    
    console.log("\nTransaction Details:");
    console.log("From:", tx.from);
    console.log("To:", tx.to || "(Contract Creation)");
    console.log("Block:", tx.blockNumber || "Pending");
    
    if (tx.blockNumber) {
      const receipt = await hre.ethers.provider.getTransactionReceipt(txHash);
      console.log("\n✅ Transaction Mined!");
      console.log("Status:", receipt.status === 1 ? "Success" : "Failed");
      console.log("Contract Address:", receipt.contractAddress);
      console.log("Gas Used:", receipt.gasUsed.toString());
    } else {
      console.log("\n⏳ Transaction pending...");
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main();
