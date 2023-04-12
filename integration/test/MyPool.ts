import { expect } from "chai";
import { ethers } from "hardhat";
import { plonk } from "snarkjs";

it("Should work", async function () {
  const MyPool = await ethers.getContractFactory("MyPool");
  const pool = await MyPool.deploy();

  const proof = await generateProof(1, 2, 3);

  const mintAmount = 10;
  await pool.mint(mintAmount, proof, [2]);
  const mintedAmount = await pool.mintedAmount();
  console.log("mintedAmount: " + mintedAmount);
});

async function generateProof(a: number, b: number, c: number): Promise<string> {
  console.log("Generating proof using CIRCOM");

  const { proof } = await plonk.fullProve(
    { a, b },
    `../tools/compiled/transaction_js/transaction.wasm`,
    `../tools/compiled/transaction.zkey`
  );

  const calldata = await plonk.exportSolidityCallData(proof, [c]);
  const [proofString] = calldata.split(",");

  return proofString;
}
