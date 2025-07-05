require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  // 1) Deploy two mock protocols with different starting APYs
  const [deployer] = await ethers.getSigners();
  console.log("Deploying from:", deployer.address);

  const Mock = await ethers.getContractFactory("MockProtocol");
  const protoA = await Mock.deploy(500);   // 5.00%
  await protoA.deployed();
  const protoB = await Mock.deploy(300);   // 3.00%
  await protoB.deployed();
  console.log("MockA @", protoA.address, "MockB @", protoB.address);

  // 2) Deploy the aggregator pointing at those two
  const Agg = await ethers.getContractFactory("Aggregator");
  const agg = await Agg.deploy(protoA.address, protoB.address);
  await agg.deployed();
  console.log("Aggregator @", agg.address);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
