import { ethers } from "hardhat";
import { AbiCoder } from "ethers/lib/utils";
import {
  Blocklist,
  BlocklistVerifier__factory,
  CompliantShieldedPool__factory,
  CompliantTransactionVerifier__factory,
  MockErc20__factory,
  SwapExecutor__factory,
} from "../typechain-types";
import { Account } from "@zrclib/sdk";
import artifact from "@zrclib/sdk/contracts/generated/Hasher.json";
import { toFixedHex } from "@zrclib/sdk";
import { fieldToString, poseidonHash } from "@zrclib/sdk/src/poseidon";
import { generateGroth16Proof } from "@zrclib/sdk";
import { tend, time, waitUntil } from "../utils";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";

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
  const transactionVerifierFactory = new CompliantTransactionVerifier__factory(
    deployer
  );
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

  // Get the blocklist contract
  const blocklistAddress = await contract.blocklistTree();
  const blocklist = (await ethers.getContractAt(
    "Blocklist",
    blocklistAddress
  )) as Blocklist;

  let token = await deployERC20Token("TEST", "TEST");

  return { contract, blocklist, token };
}

it("Test unable to withdraw from blocked leaf", async function () {
  const TEN = 10 * 1_000_000;

  const [deployer, aliceEth] = await ethers.getSigners();

  let { contract, blocklist, token } = await loadFixture(setup);

  // CREATE ACCOUNTS
  const alice = await Account.create(
    contract,
    aliceEth,
    "password123",
    1,
    undefined,
    blocklist
  );
  await alice.login();

  let tx, t, proof, publicBalance, privateBalance;

  // MINT TOKENS
  token = token.connect(deployer);
  tx = await token.mint(aliceEth.address, TEN);
  await tx.wait();

  contract = contract.connect(aliceEth);
  token = token.connect(aliceEth);

  /// DEPOSIT
  t = time("Alice creates shield proof for 10 coins");
  proof = await alice.proveShield(TEN, token.address, undefined, true);
  tend(t);

  t = time("Alice approves ERC20 payment");
  await token.approve(contract.address, TEN);
  tend(t);

  t = time("Alice submits transaction");
  await contract.transact(proof);
  tend(t);

  /// Check balances
  t = time("Check that Alice's ERC20 balance is 0");
  await waitUntil(
    () => token.balanceOf(aliceEth.address),
    (bal) => bal.eq(0)
  );
  tend(t);

  t = time("Check Alice's private balance is 10");
  await waitUntil(
    () => alice.getBalance(token.address),
    (bal) => bal.eq(TEN) // Transfer to the darkside worked! :)
  );
  tend(t);

  /// BLOCK ALICE'S DEPOSIT NOTE
  const indexToBlock = 0; // Alice's deposit note is at index 0
  let blocklistTree = await alice.getBlocklist();
  // get the path siblings for the index
  const pathElements = blocklistTree.path(indexToBlock).pathElements;

  // get the new root after inserting the blocked leaf
  const oldRoot = blocklistTree.root;
  blocklistTree.update(indexToBlock, fieldToString(poseidonHash([1])));
  const newRoot = blocklistTree.root;

  // form input
  let input = {
    pathIndices: indexToBlock,
    pathElements: pathElements,
    oldRoot: oldRoot,
    newRoot: newRoot,
  };

  // generate proof
  const blockProof = await generateGroth16Proof(input, "blocklist");

  // submit proof to the contract
  t = time("Governance blocks deposit note");
  await blocklist.blockDeposit(
    {
      proof: blockProof,
      oldRoot: toFixedHex(oldRoot),
      newRoot: toFixedHex(newRoot),
    },
    indexToBlock
  );
  tend(t);

  /// WITHDRAW FROM BLOCKED NOTE
  t = time("Alice creates a proof to unshield 10");
  let throwError = false;
  try {
    await alice.proveUnshield(
      TEN,
      aliceEth.address,
      token.address,
      undefined,
      true
    );
  } catch (e) {
    throwError = true;
  }
  tend(t);
  expect(throwError).to.be.true;
});
