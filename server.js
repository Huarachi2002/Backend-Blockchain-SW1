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
    "function processPayment(address token, uint256 amount, string memory paymentId) external",
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

        console.log(`Transaction hash: ${tx.hash}`);
        res.json({succes: true, txHash: tx.hash})
    } catch (error) {
        console.error('Error procesando el pago:', error);
        res.status(500).json({success: false, error: 'Error procesando el pago'});
    }
});

app.get('/listen-payments', async (req, res) => {
    paymentProcessor.on("PaymentProcessed", (user, token, amount, paymentId, timestamp) => {
        console.log(`Pago recibido: ${amount} de ${user} usando ${token}`);
    })

    res.send("Escuchando enventos de pagos");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor escuchando en el puerto ${PORT}`));