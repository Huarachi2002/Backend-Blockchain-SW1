// scripts/deploy-docker.js
const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    console.log("🚀 DESPLEGANDO CONTRATOS DESDE DOCKER");
    console.log("=" .repeat(40));

    const [deployer] = await ethers.getSigners();
    console.log(`📋 Deployer: ${deployer.address}`);
    
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH`);

    // 1. Desplegar TestToken
    console.log("\n📝 Desplegando TestToken...");
    const TestToken = await ethers.getContractFactory("TestToken");
    const testToken = await TestToken.deploy();
    await testToken.waitForDeployment();
    
    const tokenAddress = await testToken.getAddress();
    console.log(`✅ TestToken: ${tokenAddress}`);

    // 2. Desplegar PaymentProcessor
    console.log("\n📝 Desplegando PaymentProcessor...");
    const PaymentProcessor = await ethers.getContractFactory("PaymentProcessor");
    const paymentProcessor = await PaymentProcessor.deploy(deployer.address);
    await paymentProcessor.waitForDeployment();
    
    const processorAddress = await paymentProcessor.getAddress();
    console.log(`✅ PaymentProcessor: ${processorAddress}`);

    // 3. Actualizar configuración para el contenedor
    const deploymentConfig = {
        environment: "docker-production",
        contracts: {
            testToken: tokenAddress,
            paymentProcessor: processorAddress
        },
        deployer: deployer.address,
        deployedAt: new Date().toISOString(),
        blockNumber: await ethers.provider.getBlockNumber()
    };

    fs.writeFileSync('./docker-deployment.json', JSON.stringify(deploymentConfig, null, 2));
    console.log("📄 Configuración guardada en docker-deployment.json");

    // 4. Modificar .env para el contenedor
    try {
        let envContent = fs.readFileSync('./.env', 'utf8');
        
        envContent = envContent
            .replace(/TEST_TOKEN_ADDRESS=.*/, `TEST_TOKEN_ADDRESS=${tokenAddress}`)
            .replace(/PAYMENT_PROCESSOR_ADDRESS=.*/, `PAYMENT_PROCESSOR_ADDRESS=${processorAddress}`);
        
        if (!envContent.includes('TEST_TOKEN_ADDRESS=')) {
            envContent += `\nTEST_TOKEN_ADDRESS=${tokenAddress}`;
        }
        
        if (!envContent.includes('PAYMENT_PROCESSOR_ADDRESS=')) {
            envContent += `\nPAYMENT_PROCESSOR_ADDRESS=${processorAddress}`;
        }
        
        fs.writeFileSync('./.env', envContent);
        console.log("✅ Archivo .env actualizado");
    } catch (error) {
        console.error("❌ Error actualizando .env:", error.message);
    }

    console.log("\n🎉 DESPLIEGUE DE CONTRATOS COMPLETADO");
    console.log(`📄 TestToken: ${tokenAddress}`);
    console.log(`📄 PaymentProcessor: ${processorAddress}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error:", error);
        process.exit(1);
    });