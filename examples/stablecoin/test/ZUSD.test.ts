import path from "path";
import { expect } from "chai";
import { ethers } from "hardhat";
import { FakeContract, smock } from "@defi-wonderland/smock";
import {
  AggregatorV3Interface,
  TroveManager,
  TroveManager__factory,
  StabilityPool,
  StabilityPool__factory,
  ZUSD,
  ZUSD__factory,
  Verifier__factory,
  SwapExecutor,
  SwapExecutor__factory
} from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Account } from "@zrclib/sdk";

const artifactPath = path.join(
  __dirname,
  "../../../sdk/contracts/generated/Hasher.json"
);
const artifact = require(artifactPath);
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

describe("ZUSD", function () {
  let fakePriceFeed: FakeContract<AggregatorV3Interface>;
  let troveManager: TroveManager;
  let stabilityPool: StabilityPool;
  let swapExecutor: SwapExecutor;
  let zusd: ZUSD;
  let user: SignerWithAddress;
  let account: Account;
  let zusdDecimals: number;

  before(async function () {
    [user] = await ethers.getSigners();

    fakePriceFeed = await smock.fake("AggregatorV3Interface");
    fakePriceFeed.decimals.returns(8);
    fakePriceFeed.latestRoundData.returns([
      0,
      ethers.utils.parseUnits("2000", 8),
      0,
      0,
      0,
    ]);

    // deploy trove manager
    const troveManagerFactory = new TroveManager__factory(user);
    troveManager = await troveManagerFactory.deploy();

    // deploy stability pool
    const stabilityPoolFactory = new StabilityPool__factory(user);
    stabilityPool = await stabilityPoolFactory.deploy(troveManager.address);

    // deploy Poseidon hasher contract
    const Hasher = await ethers.getContractFactory(
      artifact.abi,
      artifact.bytecode
    );
    const hasher = await Hasher.deploy();
    await hasher.deployed();

    // Deploy the Verifier
    const verifierFactory = new Verifier__factory(user);
    const verifier = await verifierFactory.deploy();

    // Deploy the Swap Executor
    const swapExecutorFactory = new SwapExecutor__factory(user);
    swapExecutor = await swapExecutorFactory.deploy();

    // deploy ZUSD
    const zusdFactory = new ZUSD__factory(user);
    zusd = await zusdFactory.deploy(
      hasher.address,
      verifier.address,
      troveManager.address,
      stabilityPool.address,
      swapExecutor.address
    );
    zusdDecimals = await zusd.decimals();

    // set addresses
    await troveManager.setAddresses(
      zusd.address,
      stabilityPool.address,
      fakePriceFeed.address
    );
  });

  it("Price feed should return correct data", async function () {
    const expectedETHPrice = ethers.utils.parseUnits("2000", 8);
    expect(await troveManager.getLatestPrice()).to.equal(expectedETHPrice);
  });

  it("Should be able to deposit ETH collateral and mint ZUSD", async function () {
    // initial balance
    const initialZUSDBalance = await zusd.balanceOf(user.address);
    expect(initialZUSDBalance).to.equal(0);

    // Deposit 1 ETH and mint 1000 ZUSD in public pool
    const zusdMintAmount = ethers.utils.parseUnits("1000", zusdDecimals);
    await troveManager.openTrove(zusdMintAmount, {
      value: ethers.utils.parseEther("1"),
    });

    // balance after mint
    const newZUSDBalance = await zusd.balanceOf(user.address);
    expect(newZUSDBalance).to.equal(zusdMintAmount);
  });

  it("Should be able to shield ZUSD", async function () {
    // Create shielded pool account
    account = await Account.create(zusd, user, "password123");
    await account.login();
    const prover = account;
    const initialZUSDBalance = await zusd.balanceOf(user.address);

    // Create proof
    const deposit = ethers.utils.parseUnits("500", zusdDecimals);
    const shieldProof = await prover.proveShield(deposit);

    // call verify proof
    await zusd.approve(zusd.address, ethers.utils.parseEther("1000"));
    await zusd.transact(shieldProof);
    const newZUSDBalance = await zusd.balanceOf(user.address);

    // check balance
    await sleep(10_000); // wait for events to fire after pool
    expect(await account.getBalance()).to.equal(deposit); // private balance
    expect(newZUSDBalance).to.equal(initialZUSDBalance.sub(deposit)); // public balance
  });

  it("Should be able to unshield ZUSD", async function () {
    // initial balance
    const initialZUSDBalance = await zusd.balanceOf(user.address);

    // create unshield proof
    const withdraw = ethers.utils.parseUnits("250", zusdDecimals);
    const unshieldProof = await account.proveUnshield(withdraw, user.address);
    await zusd.transact(unshieldProof);

    // new balance
    const newZUSDBalance = await zusd.balanceOf(user.address);
    expect(newZUSDBalance).to.equal(initialZUSDBalance.add(withdraw));
  });
});
