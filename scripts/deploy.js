// scripts/deploy.js
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // 1) Deploy two instances of MockProtocol with different APYs
  const Mock = await ethers.getContractFactory("MockProtocol");

  // e.g. 500 = 5.00% APY
  const mockA = await Mock.deploy(500);
  await mockA.deployed();
  console.log("MockProtocol A deployed to:", mockA.address);

  // e.g. 300 = 3.00% APY
  const mockB = await Mock.deploy(300);
  await mockB.deployed();
  console.log("MockProtocol B deployed to:", mockB.address);

  // 2) Deploy your Aggregator pointing at the two MockProtocol addresses
  const Aggregator = await ethers.getContractFactory("Aggregator");
  const agg = await Aggregator.deploy(mockA.address, mockB.address);
  await agg.deployed();
  console.log("Aggregator deployed to:", agg.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
