import hre from "hardhat";

async function main() {
  console.log("Starting deployment...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", await deployer.getAddress());
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "ETH");
  
  const USDC_SEPOLIA = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
  const TREASURY = await deployer.getAddress();
  
  console.log("\nGetting contract factory...");
  const PermiPayBilling = await hre.ethers.getContractFactory(
    "contracts/PermiPayBilling_ERC7715.sol:PermiPayBilling"
  );
  
  console.log("Deploying contract...");
  const contract = await PermiPayBilling.deploy(USDC_SEPOLIA, TREASURY);
  
  console.log("Waiting for deployment transaction...");
  const deploymentTx = contract.deploymentTransaction();
  console.log("Deployment TX hash:", deploymentTx.hash);
  
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  
  console.log("\n✅ Contract deployed to:", address);
  console.log("TX:", deploymentTx.hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
