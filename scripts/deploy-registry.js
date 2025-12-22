import hre from "hardhat";

async function main() {
  console.log("\n🚀 Deploying ServiceRegistry...\n");
  
  const [deployer] = await hre.ethers.getSigners();
  const BILLING_ADDRESS = "0x6B3c3435DfC8dE86018dC311915E8D7af826c3Fa";
  
  console.log("Deployer:", await deployer.getAddress());
  console.log("Billing Contract:", BILLING_ADDRESS);
  
  const ServiceRegistry = await hre.ethers.getContractFactory("ServiceRegistry");
  console.log("\nDeploying...");
  
  const registry = await ServiceRegistry.deploy();
  const deploymentTx = registry.deploymentTransaction();
  console.log("TX hash:", deploymentTx.hash);
  
  await registry.waitForDeployment();
  const address = await registry.getAddress();
  
  console.log("\n✅ ServiceRegistry deployed to:", address);
  console.log("   (Services automatically initialized in constructor)")
  
  console.log("\n🎉 All contracts deployed and configured!");
  console.log("\n📋 Contract Addresses:");
  console.log("PermiPayBilling:", BILLING_ADDRESS);
  console.log("ServiceRegistry:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
