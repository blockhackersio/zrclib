import { ethers } from "hardhat";
import { AbiCoder } from "ethers/lib/utils";
import { 
    BlocklistVerifier__factory,
    CompliantShieldedPool__factory,
    CompliantTransactionVerifier__factory,
    MockErc20__factory,
    SwapExecutor__factory,
} from "../typechain-types";
import { Account } from "@zrclib/sdk";
import artifact from "@zrclib/sdk/contracts/generated/Hasher.json";
import { tend, time } from "../utils";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

async function deployERC20Token(name: string, symbol: string) {
    // Prepare signers
    const [deployer] = await ethers.getSigners();
  
    const erc20Factory = new MockErc20__factory(deployer);
    const token = await erc20Factory.deploy(name, symbol);
  
    return token;
}

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

    let token = await deployERC20Token("TEST", "TEST");

    return { contract, token };
}
  
it("Test deposit", async function() {
    const TEN = 10 * 1_000_000;

    const [deployer, aliceEth] = await ethers.getSigners();

    let { contract, token } = await loadFixture(setup);

    // CREATE ACCOUNTS
    const alice = await Account.create(contract, aliceEth, "password123");
    await alice.login();

    let tx, t, proof, publicBalance, privateBalance;

    // MINT TOKENS
    token = token.connect(deployer);
    tx = await token.mint(aliceEth.address, TEN);
    await tx.wait();

    contract = contract.connect(aliceEth);
    token = token.connect(aliceEth);

    /// DEPOSIT
    // t = time("Alice creates shield proof for 10 coins");
    // proof = await alice.proveShield(TEN, token.address);
    // tend(t);

    // t = time("Alice approves ERC20 payment");
    // await token.approve(contract.address, TEN);
    // tend(t);

    // t = time("Alice submits transaction");
    // await contract.transact(proof);
    // tend(t);
});

it("Test add leaf to blocklist", async function() {

});

it("Test unable to withdraw from blocked leaf", async function() {

});