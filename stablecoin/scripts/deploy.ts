import { ethers } from "hardhat";

async function main() {
  const ZUSD = await ethers.getContractFactory("ZUSD");
  const zusd = await ZUSD.deploy();

  await zusd.deployed();

  console.log(
    `ZUSD deployed to ${zusd.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
