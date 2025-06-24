pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract PaymentProcessor is Ownable, ReentrancyGuard {
    // Evento para notificar que un pago fue realizado
    event PaymentProcessed(
        address indexed user,
        address indexed token,
        uint256 amount,
        string paymentId,
        uint256 timestamp
    );

    event ExchangeProcessed(
        address indexed fromAddress,
        address indexed toAddress,
        uint256 cryptoAmount,
        string cryptoType,
        uint256 bolivianosAmount,
        string exchangeId,
        uint256 timestamp
    );
    
    event WithdrawalProcessed(
        address indexed toAddress,
        uint256 cryptoAmount,
        string cryptoType,
        uint256 bolivianosAmount,
        string withdrawalId,
        uint256 timestamp
    );

    // Mappings para evitar duplicados
    mapping(string => bool) public processedPayments;
    mapping(string => bool) public processedExchanges;
    mapping(string => bool) public processedWithdrawals;

    constructor(address owner) Ownable(owner) {
        require(owner != address(0), "Direccion del propietario no puede ser cero");
    }

    /**
     * @notice Procesa un pago desde la wallet del usuario
     * @param token Dirección del token que se usará para el pago (ejemplo: USDT)
     * @param amount Monto del token que será cobrado
     * @param paymentId ID único del pago generado por el backend de la app
     */
    function processPayment(address token, uint256 amount, string memory paymentId) external {
        require(!processedPayments[paymentId], "Payment already processed");
        require(amount > 0, "Amount must be greater than 0");
        
        // Marcar como procesado
        processedPayments[paymentId] = true;
        
        // Transferir tokens del usuario al contrato
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        
        emit PaymentProcessed(msg.sender, token, amount, paymentId, block.timestamp);
    }

        // Nueva función para exchanges (cripto → bolivianos)
    function processExchange(
        address fromAddress,
        address toAddress,
        uint256 cryptoAmount,
        string memory cryptoType,
        uint256 bolivianosAmount,
        string memory exchangeId
    ) external onlyOwner nonReentrant {
        require(!processedExchanges[exchangeId], "Exchange already processed");
        require(cryptoAmount > 0, "Crypto amount must be greater than 0");
        require(bolivianosAmount > 0, "Bolivianos amount must be greater than 0");
        
        // Marcar como procesado
        processedExchanges[exchangeId] = true;
        
        // Aquí se registra el exchange (en la práctica, también habría transferencias)
        
        emit ExchangeProcessed(
            fromAddress,
            toAddress,
            cryptoAmount,
            cryptoType,
            bolivianosAmount,
            exchangeId,
            block.timestamp
        );
    }

    // Nueva función para retiros (bolivianos → cripto)
    function processWithdrawal(
        address toAddress,
        uint256 cryptoAmount,
        string memory cryptoType,
        uint256 bolivianosAmount,
        string memory withdrawalId
    ) external onlyOwner nonReentrant {
        require(!processedWithdrawals[withdrawalId], "Withdrawal already processed");
        require(cryptoAmount > 0, "Crypto amount must be greater than 0");
        require(bolivianosAmount > 0, "Bolivianos amount must be greater than 0");
        
        // Marcar como procesado
        processedWithdrawals[withdrawalId] = true;
        
        // Aquí se haría la transferencia de cripto al usuario/entidad
        
        emit WithdrawalProcessed(
            toAddress,
            cryptoAmount,
            cryptoType,
            bolivianosAmount,
            withdrawalId,
            block.timestamp
        );
    }

    /**
     * @notice Permite al propietario retirar fondos acumulados en el contrato
     * @param token Dirección del token a retirar
     * @param amount Monto a retirar
     * @param to Dirección a la que se enviarán los tokens
     */
    // Función para retirar tokens del contrato (solo owner)
    function withdrawTokens(address token, uint256 amount, address to) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        IERC20(token).transfer(to, amount);
    }

    // Función para ver balance de tokens en el contrato
    function getTokenBalance(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }
}