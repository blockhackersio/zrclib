import { ethers } from "hardhat";
import {
  MockErc20__factory,
  MultiAssetShieldedPool__factory,
  Verifier__factory,
  SwapExecutor__factory,
  MockSwapRouter__factory,
} from "../typechain-types";
import artifact from "@zrclib/sdk/contracts/generated/Hasher.json";

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
  
    return { contract, swapExecutor };
}
  
async function main() {
    let { contract, swapExecutor } = await deployMultiAssetShieldedPool();
    let tokenA = await deployERC20Token("DAI", "DAI");
    let tokenB = await deployERC20Token("LUSD", "LUSD");
    let swapRouter = await deploySwapRouter();
    
    // set up liquidity in swap router
    await tokenA.mint(swapRouter.address, ethers.utils.parseEther("10000"));
    await tokenB.mint(swapRouter.address, ethers.utils.parseEther("10000"));

    console.log("MultiAssetShieldedPool deployed to:", contract.address);
    console.log("SwapExecutor deployed to:", swapExecutor.address);
    console.log("SwapRouter deployed to:", swapRouter.address);
    console.log("TokenA deployed to:", tokenA.address);
    console.log("TokenB deployed to:", tokenB.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});