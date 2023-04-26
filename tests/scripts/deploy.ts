import { ethers } from "hardhat";
import artifact from "@zrclib/sdk/contracts/generated/Hasher.json";
import {
  SwapExecutor__factory,
  Verifier__factory,
  ZRC20__factory,
} from "../typechain-types";

async function main() {
  const [deployer] = await ethers.getSigners();

  // Deploy the poseidon hasher
  const { abi, bytecode } = artifact;
  const Hasher = await ethers.getContractFactory(abi, bytecode);
  const hasher = await Hasher.deploy();

  // Deploy the Verifier
  const verifierFactory = new Verifier__factory(deployer);
  const verifier = await verifierFactory.deploy();

  // Deploy the Swap Executor
  const swapExecutorFactory = new SwapExecutor__factory(deployer);
  const swapExecutor = await swapExecutorFactory.deploy();

  // Deploy the ZRC20 passing in the hasher and verifier
  const zrc20Factory = new ZRC20__factory(deployer);
  const contract = await zrc20Factory.deploy(
    hasher.address,
    verifier.address,
    swapExecutor.address
  );

  return { contract };
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
