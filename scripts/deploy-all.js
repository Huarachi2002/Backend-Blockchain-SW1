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

    console.log("\n📝 Actualizando archivo .env...");
    const envPath = './.env';
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Actualizar direcciones
    envContent = envContent.replace(
        /PAYMENT_PROCESSOR_ADDRESS=.*/,
        `PAYMENT_PROCESSOR_ADDRESS=${processorAddress}`
    );
    
    if (envContent.includes('TEST_TOKEN_ADDRESS=')) {
        envContent = envContent.replace(
            /TEST_TOKEN_ADDRESS=.*/,
            `TEST_TOKEN_ADDRESS=${tokenAddress}`
        );
    } else {
        envContent += `\nTEST_TOKEN_ADDRESS=${tokenAddress}`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log("✅ Archivo .env actualizado");

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error en el despliegue:", error);
        process.exit(1);
    });