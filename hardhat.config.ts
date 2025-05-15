import {HardhatUserConfig} from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import "dotenv/config";

// Verifica que las variables de entorno estén definidas
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "";

const config: HardhatUserConfig = {
    solidity: "0.8.20",
    networks: {
      hardhat: {
        chainId: 1337,
      },
      sepolia: {
        url: SEPOLIA_RPC_URL,
        accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
        chainId: 11155111,
      },
    },
    paths: {
      sources: "./contracts",
      tests: "./test",
      cache: "./cache",
      artifacts: "./artifacts"
    }
  };
  
export default config;