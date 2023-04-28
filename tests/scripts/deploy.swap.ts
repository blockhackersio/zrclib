import { ethers } from "hardhat";
import {
  MockErc20__factory,
  MockSwapRouter__factory,
  MultiAssetShieldedPool__factory,
  SwapExecutor__factory,
  Verifier__factory,
} from "../typechain-types";
import artifact from "@zrclib/sdk/contracts/generated/Hasher.json";
import { BigNumber } from "ethers";

async function deploySwapRouter() {
  // Prepare signers
  const [deployer] = await ethers.getSigners();

  const swapRouterFactory = new MockSwapRouter__factory(deployer);
  const swapRouter = await swapRouterFactory.deploy();

  return swapRouter;
}

async function deployERC20Token(name: string, symbol: string) {
  // Prepare signers
  const [deployer] = await ethers.getSigners();

  const erc20Factory = new MockErc20__factory(deployer);
  const token = await erc20Factory.deploy(name, symbol);

  return token;
}

async function deployMultiAssetShieldedPool() {
  // Prepare signers
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

  // Deploy the multi asset shielded pool
  const maspFactory = new MultiAssetShieldedPool__factory(deployer);
  const contract = await maspFactory.deploy(
    hasher.address,
    verifier.address,
    swapExecutor.address
  );

  return { contract };
}

async function main() {
  await deployMultiAssetShieldedPool();
  let tokenA = await deployERC20Token("DAI", "DAI");
  let tokenB = await deployERC20Token("LUSD", "LUSD");
  let swapRouter = await deploySwapRouter();
  // Prepare signers
  const [deployer] = await ethers.getSigners();

  tokenA = tokenA.connect(deployer);
  let tx = await tokenA.mint(
    swapRouter.address,
    // Ensure heaps of liquidity
    BigNumber.from(1000).mul(1_000000000000000000000000n)
  );
  await tx.wait();

  tokenB = tokenB.connect(deployer);
  tx = await tokenB.mint(
    swapRouter.address,
    // Ensure heaps of liquidity
    BigNumber.from(1000).mul(1_000000000000000000000000n)
  );
  await tx.wait();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
