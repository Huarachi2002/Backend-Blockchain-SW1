async function main() {
    const TestToken = await ethers.getContractFactory("TestToken");
    const token = await TestToken.deploy();
    
    // Espera a que la transacción se confirme
    await token.deploymentTransaction().wait();
    
    // Forma correcta de obtener la dirección en ethers.js v6
    const tokenAddress = await token.getAddress();
    
    console.log("Test Token deployed to:", tokenAddress);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });