const { ethers } = require("hardhat");
const fs = require("fs");
require('dotenv').config();

async function main(){
    console.log("Iniciando despliegue de contratos...");

    //1. Obtener las cuentas
    const [deployer] = await ethers.getSigners();
    console.log("Desplegando desde la cuenta:", deployer.address);

    //2. Desplegar el token ERC20 de prueba
    console.log("Desplegando el TestToken...");
    const TestToken = await ethers.getContractFactory("TestToken");
    const testToken = await TestToken.deploy();
    await testToken.deploymentTransaction().wait();
    const tokenAddress = await testToken.getAddress();
    console.log("TestToken desplegado en:", tokenAddress);

    //3. Desplegar el PaymentProcessor
    console.log("Desplegando el PaymentProcessor...");
    const PaymentProcessor = await ethers.getContractFactory("PaymentProcessor");
    const paymentProcessor = await PaymentProcessor.deploy(deployer.address);
    await paymentProcessor.deploymentTransaction().wait();
    const processorAddress = await paymentProcessor.getAddress();
    console.log("PaymentProcessor desplegado en:", processorAddress);

    //4. Aprobar tokens
    console.log()
}