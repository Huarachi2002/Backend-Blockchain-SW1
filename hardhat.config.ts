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
        chainId: 31337,
        accounts: {
          count: 20,
          accountsBalance: "10000000000000000000000", // 10,000 ETH por cuenta
        },
        hostname: "0.0.0.0",
        port: 8545
      },
      sepolia: {
        url: SEPOLIA_RPC_URL,
        accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
        chainId: 11155111,
      },
      localhost: {
        url: "http://127.0.0.1:8545",
      },
      ec2: {
        url: `http://${process.env.EC2_PRIVATE_IP || "localhost"}:8545`,
        chainId: 31337,
        accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
        timeout: 60000
      }
    },
    paths: {
      sources: "./contracts",
      tests: "./test",
      cache: "./cache",
      artifacts: "./artifacts"
    }
  };
  
export default config;