import { ethers } from "hardhat";

async function main() {
  // deploy ZUSD contract
  const ZUSD = await ethers.getContractFactory("ZUSD");
  const zusd = await ZUSD.deploy();
  await zusd.deployed();
  console.log(
    `ZUSD deployed to ${zusd.address}`
  );

  // deploy trove manager contract
  const TroveManager = await ethers.getContractFactory("TroveManager");
  const troveManager = await TroveManager.deploy();
  await troveManager.deployed();
  console.log(
    `TroveManager deployed to ${troveManager.address}`
  );

  // deploy stability pool contract
  const StabilityPool = await ethers.getContractFactory("StabilityPool");
  const stabilityPool = await StabilityPool.deploy(troveManager.address);
  await stabilityPool.deployed();
  console.log(
    `StabilityPool deployed to ${stabilityPool.address}`
  );
}

main()
