import { ethers } from "hardhat";

async function main(){
    
    const [deployer] = await ethers.getSigners();
    console.log("Desplegando contrato con la cuenta:", deployer.address);


    const PaymentProcessor = await ethers.getContractFactory("PaymentProcessor");
    const paymentProcessor = await PaymentProcessor.deploy(deployer.address);

    await paymentProcessor.waitForDeployment();
    const paymentProcessorAddress = await paymentProcessor.getAddress();

    console.log("Contrato PaymentProcessor desplegado en:", paymentProcessorAddress);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
    