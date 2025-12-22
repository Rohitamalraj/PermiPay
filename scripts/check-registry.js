import hre from "hardhat";

async function main() {
  const txHash = "0x116edde490819c1fe65ca246ab1573879c514c2d4ae4f4cac7fd1c3240fb64d0";
  
  console.log("Checking ServiceRegistry deployment:", txHash);
  
  try {
    const receipt = await hre.ethers.provider.getTransactionReceipt(txHash);
    
    if (!receipt) {
      console.log("⏳ Transaction pending...");
      return;
    }
    
    console.log("\n✅ Transaction Mined!");
    console.log("Status:", receipt.status === 1 ? "Success" : "Failed");
    console.log("ServiceRegistry Address:", receipt.contractAddress);
    console.log("Gas Used:", receipt.gasUsed.toString());
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main();
