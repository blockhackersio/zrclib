import { ethers } from "hardhat";
import path from "path";

const artifactPath = path.join(
  __dirname,
  "../../../tools/contracts/generated/Hasher.json"
);
const artifact = require(artifactPath);

async function main() {
  // deploy trove manager
  const TroveManager = await ethers.getContractFactory("TroveManager");
  const troveManager = await TroveManager.deploy();
  await troveManager.deployed();
  console.log("TroveManager deployed to:", troveManager.address);

  // deploy stability pool
  const StabilityPool = await ethers.getContractFactory("StabilityPool");
  const stabilityPool = await StabilityPool.deploy(troveManager.address);
  await stabilityPool.deployed();
  console.log("StabilityPool deployed to:", stabilityPool.address);

  // deploy Poseidon hasher contract
  const Hasher = await ethers.getContractFactory(
    artifact.abi,
    artifact.bytecode
  );
  const hasher = await Hasher.deploy();
  await hasher.deployed();
  console.log("Hasher deployed to:", hasher.address);

  // Deploy the Verifier
  const Verifier = new ethers.getContractFactory("Verifier");
  const verifier = await Verifier.deploy();

  // deploy ZUSD
  const ZUSD = await ethers.getContractFactory("ZUSD");
  const zusd = await ZUSD.deploy(hasher.address, verifier.address, troveManager.address, stabilityPool.address);
  await zusd.deployed();
  console.log("ZUSD deployed to:", zusd.address);

  // set addresses
  const chainlinkAddress = "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e"; // ETH/USD price feed on Goerli
  await troveManager.setAddresses(zusd.address, stabilityPool.address, chainlinkAddress);
}

main()
