const express = require('express');
const bodyParser = require('body-parser');
const { ethers } = require('ethers');
require('dotenv').config();

const app = express();

app.use(bodyParser.json());

const provider = new ethers.JsonRpcProvider(process.env.LOCAL_RPC_URL); //process.env.SEPOLIA_RPC_URL 
const privateKey = process.env.PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider);
const paymentProcessorAddress = process.env.PAYMENT_PROCESSOR_ADDRESS;

// ABI del contrato PaymentProcessor
const paymentProcessorABI = [
    "event PaymentProcessed(address indexed user, address indexed token, uint256 amount, string paymentId, uint256 timestamp)",
    "event ExchangeProcessed(address indexed fromAddress, address indexed toAddress, uint256 cryptoAmount, string cryptoType, uint256 amount, string exchangeId, uint256 timestamp)",
    "event WithdrawalProcessed(address indexed toAddress, uint256 cryptoAmount, string cryptoType, uint256 amount, string withdrawalId, uint256 timestamp)",
    "function processPayment(address token, uint256 amount, string memory paymentId) external",
    "function processExchange(address fromAddress, address toAddress, uint256 cryptoAmount, string memory cryptoType, uint256 amount, string memory exchangeId) external",
    "function processWithdrawal(address toAddress, uint256 cryptoAmount, string memory cryptoType, uint256 amount, string memory withdrawalId) external",
    "function owner() external view returns (address)"
];

const paymentProcessor = new ethers.Contract(paymentProcessorAddress, paymentProcessorABI, wallet);

// Ruta para procesar el pago
app.post('/process-payment', async (req, res) => {
    try {
        const { tokenAddress, amount, paymentId } = req.body;	

        // Crear transacion para procesar el pago
        const tx = await paymentProcessor
            .connect(wallet)
            .processPayment(tokenAddress, ethers.parseUnits(amount.toString(), 18), paymentId);

        console.log(`Pago procesado - Transaction hash: ${tx.hash}`);

        // Obtener gas fee de la transacción
        const receipt = await tx.wait();
        const gasFee = receipt.gasUsed * receipt.gasPrice;

        res.json({
            success: true, 
            txHash: tx.hash,
            gasFee: parseFloat(ethers.formatEther(gasFee))
        });
    } catch (error) {
        console.error('Error procesando el pago:', error);
        res.status(500).json({success: false, error: 'Error procesando el pago'});
    }
});

// RUTA: Procesar exchange cripto → bolivianos
app.post('/process-exchange', async (req, res) => {
    try {
        const { fromAddress, toAddress, cryptoAmount, cryptoType, amount, exchangeId } = req.body;

        console.log(`Procesando exchange: ${cryptoAmount} ${cryptoType} → ${amount} Divisa Pais`);

        // En un escenario real, aquí harías:
        // 1. Verificar que el usuario tenga suficientes tokens
        // 2. Transferir tokens del usuario a la aplicación
        // 3. Registrar el exchange en el contrato

        const tx = await paymentProcessor
            .connect(wallet)
            .processExchange(
                fromAddress,
                toAddress,
                ethers.parseUnits(cryptoAmount.toString(), 18),
                cryptoType,
                ethers.parseUnits(amount.toString(), 18),
                exchangeId
            );

        console.log(`Exchange procesado - Transaction hash: ${tx.hash}`);
        
        const receipt = await tx.wait();
        const gasFee = receipt.gasUsed * receipt.gasPrice;

        res.json({
            success: true, 
            txHash: tx.hash,
            gasFee: parseFloat(ethers.formatEther(gasFee)),
            exchangeRate: amount / cryptoAmount
        });
    } catch (error) {
        console.error('Error procesando exchange:', error);
        res.status(500).json({success: false, error: 'Error procesando exchange'});
    }
});

// RUTA: Procesar retiro bolivianos → cripto (NUEVA)
app.post('/process-withdrawal', async (req, res) => {
    try {
        const { toAddress, cryptoAmount, cryptoType, amount, withdrawalId } = req.body;

        console.log(`Procesando retiro: ${amount} DIVISA PAIS → ${cryptoAmount} ${cryptoType} a ${toAddress}`);

        const tx = await paymentProcessor
            .connect(wallet)
            .processWithdrawal(
                toAddress,
                ethers.parseUnits(cryptoAmount.toString(), 18),
                cryptoType,
                ethers.parseUnits(amount.toString(), 18),
                withdrawalId
            );

        console.log(`Retiro procesado - Transaction hash: ${tx.hash}`);
        
        const receipt = await tx.wait();
        const gasFee = receipt.gasUsed * receipt.gasPrice;

        res.json({
            success: true, 
            txHash: tx.hash,
            gasFee: parseFloat(ethers.formatEther(gasFee)),
            exchangeRate: cryptoAmount / amount
        });
    } catch (error) {
        console.error('Error procesando retiro:', error);
        res.status(500).json({success: false, error: 'Error procesando retiro'});
    }
});

// RUTA: Obtener tasas de cambio actuales (NUEVA)
app.get('/exchange-rates', async (req, res) => {
    try {
        // En un escenario real, obtendrías estas tasas de una API externa
        // Por ahora, valores simulados
        const rates = {
            'ETH': 14500.0,  // 1 ETH = 14,500 BOB
            'BTC': 450000.0, // 1 BTC = 450,000 BOB
            'USDT': 6.9,     // 1 USDT = 6.9 BOB
            'TOKEN': 1.0     // 1 TOKEN = 1 BOB (token de prueba)
        };

        res.json(rates);
    } catch (error) {
        console.error('Error obteniendo tasas:', error);
        res.status(500).json({error: 'Error obteniendo tasas de cambio'});
    }
});


// RUTA: Escuchar eventos de pagos, exchanges y retiros
app.get('/listen-payments', async (req, res) => {
    // Listener para pagos
    paymentProcessor.on("PaymentProcessed", (user, token, amount, paymentId, timestamp) => {
        console.log(`🎫 Pago recibido: ${ethers.formatUnits(amount, 18)} de ${user} usando ${token}`);
        console.log(`📋 Payment ID: ${paymentId}`);
    });

    // Listener para exchanges
    paymentProcessor.on("ExchangeProcessed", (fromAddress, toAddress, cryptoAmount, cryptoType, amount, exchangeId, timestamp) => {
        console.log(`💱 Exchange procesado: ${ethers.formatUnits(cryptoAmount, 18)} ${cryptoType} → ${ethers.formatUnits(amount, 18)} BOB`);
        console.log(`📋 Exchange ID: ${exchangeId}`);
    });

    // Listener para retiros
    paymentProcessor.on("WithdrawalProcessed", (toAddress, cryptoAmount, cryptoType, amount, withdrawalId, timestamp) => {
        console.log(`💰 Retiro procesado: ${ethers.formatUnits(amount, 18)} BOB → ${ethers.formatUnits(cryptoAmount, 18)} ${cryptoType}`);
        console.log(`📋 Withdrawal ID: ${withdrawalId}`);
    });

    res.send("Escuchando eventos de pagos, exchanges y retiros");
});

// Añadir este endpoint para healthchecks
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        services: {
            blockchain: 'online',
            api: 'online'
        }
    });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Servidor escuchando en el puerto ${PORT}`));