const { ethers } = require("hardhat");

async function main() {
    const tokenAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
    const walletAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Tu dirección
    
    const TestToken = await ethers.getContractFactory("TestToken");
    const token = await TestToken.attach(tokenAddress);
    
    const balance = await token.balanceOf(walletAddress);
    console.log(`Balance de tokens: ${ethers.formatUnits(balance, 18)}`);
}

main()
    .then(() => process.exit(0))
    .catch(console.error);