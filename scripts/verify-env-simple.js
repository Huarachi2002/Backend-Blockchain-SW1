// Script simple para verificar variables de entorno sin depender de TypeScript
require('dotenv').config();

function main() {
  console.log('Verificando variables de entorno...');
  
  // Verificar PRIVATE_KEY
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error('❌ PRIVATE_KEY no está definida en el archivo .env');
  } else if (privateKey.length !== 64) {
    console.error(`❌ PRIVATE_KEY tiene un formato incorrecto. Debe tener exactamente 64 caracteres hexadecimales sin el prefijo 0x. Longitud actual: ${privateKey.length}`);
  } else {
    console.log('✅ PRIVATE_KEY está correctamente configurada');
  }

  // Verificar SEPOLIA_RPC_URL
  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  if (!rpcUrl) {
    console.error('❌ SEPOLIA_RPC_URL no está definida en el archivo .env');
  } else if (!rpcUrl.startsWith('https://')) {
    console.error('❌ SEPOLIA_RPC_URL tiene un formato incorrecto. Debe comenzar con https://');
  } else {
    console.log('✅ SEPOLIA_RPC_URL está correctamente configurada');
  }
  
  // Verificar PAYMENT_PROCESSOR_ADDRESS
  const contractAddress = process.env.PAYMENT_PROCESSOR_ADDRESS;
  if (!contractAddress) {
    console.log('ℹ️ PAYMENT_PROCESSOR_ADDRESS no está definida. Se configurará después del despliegue.');
  } else if (!contractAddress.startsWith('0x') || contractAddress.length !== 42) {
    console.error('❌ PAYMENT_PROCESSOR_ADDRESS tiene un formato incorrecto. Debe comenzar con 0x y tener 42 caracteres en total.');
  } else {
    console.log('✅ PAYMENT_PROCESSOR_ADDRESS está correctamente configurada');
  }
}

main();
