import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";
import "@nomicfoundation/hardhat-verify";
import "@typechain/hardhat";
import "@nomicfoundation/hardhat-chai-matchers";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    hardhat: {},
    "lisk-sepolia": {
      url: process.env.LISK_SEPOLIA_RPC_URL || process.env.RPC_URL || "https://rpc.sepolia-api.lisk.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 1_000_000_000,
    },
  },
  etherscan: {
    apiKey: {
      "lisk-sepolia": process.env.LISK_BLOCKSCOUT_API_KEY || "123",
    },
    customChains: [
      {
        network: "lisk-sepolia",
        chainId: 4202,
        urls: {
          apiURL: "https://sepolia-blockscout.lisk.com/api",
          browserURL: "https://sepolia-blockscout.lisk.com",
        },
      },
    ],
  },
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v5",
  },
};

export default config;
