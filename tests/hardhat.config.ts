import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
import "hardhat-tracer";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.18",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    "mantle-testnet": {
      url: "https://rpc.testnet.mantle.xyz/",
      accounts: process.env.PRIV_KEY ? [process.env.PRIV_KEY] : [], // Uses the private key from the .env file if it exists
    },
    "polygon-zkevm-testnet": {
      url: "https://rpc.public.zkevm-test.net",
      accounts: process.env.PRIV_KEY ? [process.env.PRIV_KEY] : [], // Uses the private key from the .env file if it exists
    }
  },
  mocha: {
    timeout: 100_000_000, // sets the timeout to 10 seconds
    bail: true,
    parallel: false,
  },
};

export default config;
