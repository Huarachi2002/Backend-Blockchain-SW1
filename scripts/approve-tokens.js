const { ethers } = require("hardhat");
require('dotenv').config();

async function main() {
    const tokenAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // Dirección de tu token desplegado
    const paymentProcessorAddress = process.env.PAYMENT_PROCESSOR_ADDRESS; // Dirección de tu contrato
    
    console.log(`Aprobando tokens de ${tokenAddress} para ser usados por ${paymentProcessorAddress}`);
    
    const TestToken = await ethers.getContractFactory("TestToken");
    const token = await TestToken.attach(tokenAddress);
    
    // En ethers.js v6, parseEther está directamente en ethers, no en utils
    const tx = await token.approve(paymentProcessorAddress, ethers.parseUnits("1000", 18));
    
    // Esperar a que la transacción se confirme
    await tx.wait();
    
    console.log("Tokens aprobados para gastar. Hash de transacción:", tx.hash);
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });