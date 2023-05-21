import { ethers } from "hardhat";
import { AbiCoder } from "ethers/lib/utils";
import { 
    BlocklistVerifier__factory,
    CompliantShieldedPool__factory,
    CompliantTransactionVerifier__factory,
    MockErc20__factory,
    SwapExecutor__factory,
} from "../typechain-types";
import artifact from "@zrclib/sdk/contracts/generated/Hasher.json";

async function setup() {
    // Prepare signers
    const [deployer] = await ethers.getSigners();

    // Deploy the poseidon hasher
    const { abi, bytecode } = artifact;
    const Hasher = await ethers.getContractFactory(abi, bytecode);
    const hasher = await Hasher.deploy();

    // Deploy the Verifiers
    const transactionVerifierFactory = new CompliantTransactionVerifier__factory(deployer);
    const transactionVerifier = await transactionVerifierFactory.deploy();
    const blocklistVerifierFactory = new BlocklistVerifier__factory(deployer);
    const blocklistVerifier = await blocklistVerifierFactory.deploy();

    // Deploy the Swap Executor
    const swapExecutorFactory = new SwapExecutor__factory(deployer);
    const swapExecutor = await swapExecutorFactory.deploy();

    // Deploy the shielded pool passing in the verifier
    const shieldedPoolFactory = new CompliantShieldedPool__factory(deployer);
    const contract = await shieldedPoolFactory.deploy(
        hasher.address,
        transactionVerifier.address,
        blocklistVerifier.address,
        swapExecutor.address
    );
  
    return { contract };
}

async function deployERC20Token(name: string, symbol: string) {
    // Prepare signers
    const [deployer] = await ethers.getSigners();
  
    const erc20Factory = new MockErc20__factory(deployer);
    const token = await erc20Factory.deploy(name, symbol);
  
    return token;
}
  
it("Test deposit", async function() {

});

it("Test add leaf to blocklist", async function() {

});

it("Test unable to withdraw from blocked leaf", async function() {

});