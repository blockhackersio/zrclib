import path from "path";
import { expect } from "chai";
import { ethers } from "hardhat";
import { FakeContract, smock } from '@defi-wonderland/smock';
import { AggregatorV3Interface, TroveManager, StabilityPool, ZUSD } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ShieldedAccount, ShieldedPool } from "@zrclib/tools";

const artifactPath = path.join(
  __dirname,
  "../../tools/contracts/generated/Hasher.json"
);
const artifact = require(artifactPath);

describe("ZUSD", function () {

  let fakePriceFeed: FakeContract<AggregatorV3Interface>
  let troveManager: TroveManager;
  let stabilityPool: StabilityPool;
  let zusd: ZUSD;
  let user: SignerWithAddress;
  let zusdDecimals: number;

  before(async function() {
    [user] = await ethers.getSigners();

    fakePriceFeed = await smock.fake('AggregatorV3Interface');
    fakePriceFeed.decimals.returns(8);
    fakePriceFeed.latestRoundData.returns([0, ethers.utils.parseUnits('2000', 8), 0, 0, 0])

    // deploy trove manager
    const TroveManager = await ethers.getContractFactory("TroveManager");
    troveManager = await TroveManager.deploy();
    await troveManager.deployed();

    // deploy stability pool
    const StabilityPool = await ethers.getContractFactory("StabilityPool");
    stabilityPool = await StabilityPool.deploy(troveManager.address);
    await stabilityPool.deployed();

    // deploy Poseidon hasher contract
    const Hasher = await ethers.getContractFactory(
      artifact.abi,
      artifact.bytecode
    );
    const hasher = await Hasher.deploy();
    await hasher.deployed();

    // deploy ZUSD
    const ZUSD = await ethers.getContractFactory("ZUSD");
    zusd = await ZUSD.deploy(hasher.address, troveManager.address, stabilityPool.address);
    await zusd.deployed();
    zusdDecimals = await zusd.decimals();

    // set addresses
    await troveManager.setAddresses(zusd.address, stabilityPool.address, fakePriceFeed.address);
  });

  it("Price feed should return correct data", async function() {
    const expectedETHPrice = ethers.utils.parseUnits('2000', 8);
    expect(await troveManager.getLatestPrice()).to.equal(expectedETHPrice);
  });

  it("Should be able to deposit ETH collateral and mint ZUSD", async function() {
    // initial balance
    const initialZUSDBalance = await zusd.balanceOf(user.address);
    expect(initialZUSDBalance).to.equal(0);

    // Deposit 1 ETH and mint 1000 ZUSD in public pool
    const zusdMintAmount = ethers.utils.parseUnits("1000", zusdDecimals);
    await troveManager.openTrove(zusdMintAmount, { value: ethers.utils.parseEther("1") });

    // balance after mint
    const newZUSDBalance = await zusd.balanceOf(user.address);
    expect(newZUSDBalance).to.equal(zusdMintAmount);
  });

  it("Should be able to shield ZUSD", async function() {
    // Create shielded pool account
    const account = await ShieldedAccount.fromSigner(user);
    const prover = ShieldedPool.getProver(account);
    const initialZUSDBalance = await zusd.balanceOf(user.address);

    // Create proof
    const deposit = ethers.utils.parseUnits("500", zusdDecimals);
    const shieldProof = await prover.shield(deposit);

    // call verify proof
    await zusd.approve(zusd.address, ethers.utils.parseEther("1000"));
    await zusd.transact(shieldProof);
    const newZUSDBalance = await zusd.balanceOf(user.address);

    // check balance
    expect(newZUSDBalance).to.equal(initialZUSDBalance.sub(deposit));
  });

  // it("Should be able to unshield ZUSD", async function() {
  //   // initial balance
  //   const initialZUSDBalance = await zusd.balanceOf(user.address);

  //   // create unshield proof
  //   const account = await ShieldedAccount.fromSigner(user);
  //   const prover = ShieldedPool.getProver(account);
  //   const withdraw = ethers.utils.parseUnits("250", zusdDecimals);
  //   const unshieldProof = await prover.unshield(withdraw, user.address);
  //   console.log("Unshield proof: ", unshieldProof);
  //   await zusd.transact(unshieldProof);

  //   // new balance
  //   const newZUSDBalance = await zusd.balanceOf(user.address);
  //   expect(newZUSDBalance).to.equal(initialZUSDBalance.add(withdraw));
  // })
});
