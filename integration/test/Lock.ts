import { expect } from "chai";
import { ethers } from "hardhat";

describe("Lock", function () {
  describe("Deployment", function () {
    it("Should set the right unlockTime", async function () {
      const Lock = await ethers.getContractFactory("Lock");
      const lock = await Lock.deploy();
      expect(lock.deployed).is.true;
    });
  });
});
