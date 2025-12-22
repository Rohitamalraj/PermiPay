import hre from "hardhat";

async function main() {
  console.log("\n========================================");
  console.log("🚀 PermiPay Contract Deployment");
  console.log("========================================\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Contract parameters
  const USDC_SEPOLIA = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
  const TREASURY_ADDRESS = deployer.address; // Using deployer as treasury

  console.log("📋 Deployment Parameters:");
  console.log("   USDC Contract:", USDC_SEPOLIA);
  console.log("   Treasury Address:", TREASURY_ADDRESS);
  console.log("\n⏳ Deploying PermiPayBilling (ERC-7715)...\n");

  // Deploy PermiPayBilling (using fully qualified name)
  const PermiPayBilling = await hre.ethers.getContractFactory("contracts/PermiPayBilling_ERC7715.sol:PermiPayBilling");
  const permiPayBilling = await PermiPayBilling.deploy(USDC_SEPOLIA, TREASURY_ADDRESS);

  await permiPayBilling.waitForDeployment();
  const billingAddress = await permiPayBilling.getAddress();

  console.log("✅ PermiPayBilling deployed to:", billingAddress);

  // Deploy ServiceRegistry (optional)
  console.log("\n⏳ Deploying ServiceRegistry...\n");

  const ServiceRegistry = await hre.ethers.getContractFactory("ServiceRegistry");
  const serviceRegistry = await ServiceRegistry.deploy();

  await serviceRegistry.waitForDeployment();
  const registryAddress = await serviceRegistry.getAddress();

  console.log("✅ ServiceRegistry deployed to:", registryAddress);

  console.log("\n========================================");
  console.log("🎉 Deployment Complete!");
  console.log("========================================\n");

  console.log("📋 Deployed Contract Addresses:");
  console.log("   PermiPayBilling:", billingAddress);
  console.log("   ServiceRegistry:", registryAddress);

  console.log("\n📝 Next Steps:");
  console.log("1. Update your .env file:");
  console.log(`   NEXT_PUBLIC_PERMIPAY_BILLING_CONTRACT=${billingAddress}`);
  console.log(`   NEXT_PUBLIC_SERVICE_REGISTRY_CONTRACT=${registryAddress}`);
  console.log("\n2. Update src/constants/chains.ts with these addresses");
  console.log("\n3. Verify contracts on Etherscan:");
  console.log(`   npx hardhat verify --network sepolia ${billingAddress} "${USDC_SEPOLIA}" "${TREASURY_ADDRESS}"`);
  console.log(`   npx hardhat verify --network sepolia ${registryAddress}`);
  
  console.log("\n4. View on Etherscan:");
  console.log(`   https://sepolia.etherscan.io/address/${billingAddress}`);
  console.log(`   https://sepolia.etherscan.io/address/${registryAddress}`);

  console.log("\n========================================\n");

  // Wait for block confirmations before verifying
  console.log("⏳ Waiting for block confirmations...\n");
  await permiPayBilling.deploymentTransaction().wait(5);
  await serviceRegistry.deploymentTransaction().wait(5);

  // Verify on Etherscan
  console.log("🔍 Verifying contracts on Etherscan...\n");

  try {
    await hre.run("verify:verify", {
      address: billingAddress,
      constructorArguments: [USDC_SEPOLIA, TREASURY_ADDRESS],
    });
    console.log("✅ PermiPayBilling verified on Etherscan");
  } catch (error) {
    console.log("⚠️  Verification failed:", error.message);
  }

  try {
    await hre.run("verify:verify", {
      address: registryAddress,
      constructorArguments: [],
    });
    console.log("✅ ServiceRegistry verified on Etherscan");
  } catch (error) {
    console.log("⚠️  Verification failed:", error.message);
  }

  console.log("\n✨ All done! Your contracts are deployed and verified.\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
