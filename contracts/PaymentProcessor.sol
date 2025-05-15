pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PaymentProcessor is Ownable {
    // Evento para notificar que un pago fue realizado
    event PaymentProcessed(
        address indexed user,
        address indexed token,
        uint256 amount,
        string paymentId,
        uint256 timestamp
    );

    constructor(address owner) Ownable(owner) {
        // Constructor logic if needed
    }

    /**
     * @notice Procesa un pago desde la wallet del usuario
     * @param token Dirección del token que se usará para el pago (ejemplo: USDT)
     * @param amount Monto del token que será cobrado
     * @param paymentId ID único del pago generado por el backend de la app
     */
    function processPayment(address token, uint256 amount, string memory paymentId) external {
        require(amount > 0, "El importe debe ser mayor que 0");
        
        // Transferir el token desde la wallet del usuario hacia el contrato
        IERC20(token).transferFrom(msg.sender, address(this), amount);

        // Emitir evento para notificar el pago
        emit PaymentProcessed(msg.sender, token, amount, paymentId, block.timestamp);
    }


    /**
     * @notice Permite al propietario retirar fondos acumulados en el contrato
     * @param token Dirección del token a retirar
     * @param amount Monto a retirar
     */
    function withdrawTokens(address token, uint256 amount) external onlyOwner{
        require(amount > 0, "El importe debe ser mayor que 0");
        
        // Transferencia de tokens al propietario
        IERC20(token).transfer(msg.sender, amount);
    }
}