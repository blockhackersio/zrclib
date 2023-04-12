import { expect } from "chai";
import { ethers } from "hardhat";
import { plonk } from "snarkjs";
import Utxo from "../utils/utxo";
import { Keypair } from "../utils/keypair";
import { prepareTransaction } from "../utils/index";


it("Test transfer", async function () {
  const sender = (await ethers.getSigners())[0]

  const MyPool = await ethers.getContractFactory("MyPool");
  const pool = await MyPool.deploy();

  //deposit parameter
  const depositAmount = 1e7
  const keypair = await Keypair.create()
  const deposit = new Utxo({ amount: depositAmount, keypair: keypair })

  await prepareTransaction({
    outputs: [deposit],
    account: {
      owner: sender.address,
      publicKey: deposit.keypair.address(),
    },
  })


  // const mintAmount = 10;
  // await pool.mint(mintAmount, proof, [2]);
  // const mintedAmount = await pool.mintedAmount();
  // console.log("mintedAmount: " + mintedAmount);
});
