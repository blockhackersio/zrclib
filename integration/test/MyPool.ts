import { expect } from "chai";
import { ethers } from "hardhat";

it("Should work", async function () {
  const MyPool = await ethers.getContractFactory("MyPool");
  await MyPool.deploy();
  expect(true).is.true;
});
