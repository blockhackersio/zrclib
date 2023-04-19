import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
import "hardhat-tracer";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  mocha: {
    timeout: 100_000_000, // sets the timeout to 10 seconds
  },
};

export default config;
