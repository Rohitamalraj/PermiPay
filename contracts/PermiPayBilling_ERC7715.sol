// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/**
 * @title PermiPayBilling
 * @notice Permission-metered billing contract for PermiPay Analytics with ERC-7715 Integration
 * @dev Integrates with MetaMask Advanced Permissions for gasless, pre-authorized payments
 * 
 * Core Features:
 * 1. Users grant spending permissions once via MetaMask (ERC-7715)
 * 2. Session accounts execute service charges automatically without repeated signatures
 * 3. Three services: Contract Inspector ($0.30), Wallet Reputation ($0.40), Address Insights ($0.50)
 * 4. Full ERC-4337 compatibility for account abstraction
 */

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract PermiPayBilling {
    // USDC contract on Ethereum Sepolia (6 decimals)
    IERC20 public immutable USDC;
    address public immutable treasury;
    address public owner;

    // Service IDs and pricing (in USDC with 6 decimals)
    enum ServiceType {
        CONTRACT_INSPECTOR,    // $0.30 = 300000 (0.30 * 1e6)
        WALLET_REPUTATION,     // $0.40 = 400000 (0.40 * 1e6)
        ADDRESS_INSIGHTS       // $0.50 = 500000 (0.50 * 1e6)
    }

    mapping(ServiceType => uint256) public servicePrices;

    // Permission tracking for ERC-7715 integration
    struct Permission {
        uint256 spendingLimit;     // Total USDC authorized
        uint256 spentAmount;       // Amount already spent
        uint256 expiresAt;         // Permission expiry timestamp
        bool isActive;             // Permission status
        address sessionAccount;    // Session account address (delegate)
    }

    mapping(address => Permission) public userPermissions;

    // Session account authorization
    mapping(address => mapping(address => bool)) public authorizedSessions;

    // Usage tracking for Envio indexing
    event PermissionGranted(
        address indexed user,
        address indexed sessionAccount,
        uint256 spendingLimit,
        uint256 expiresAt,
        uint256 timestamp
    );

    event ServiceExecuted(
        address indexed user,
        address indexed sessionAccount,
        uint8 indexed serviceType,
        uint256 cost,
        uint256 remainingBudget,
        uint256 timestamp
    );

    event PermissionRevoked(
        address indexed user,
        address indexed sessionAccount,
        uint256 timestamp
    );

    event PermissionUpdated(
        address indexed user,
        uint256 newSpendingLimit,
        uint256 newExpiresAt,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor(address _usdc, address _treasury) {
        USDC = IERC20(_usdc);
        treasury = _treasury;
        owner = msg.sender;

        // Initialize service prices
        servicePrices[ServiceType.CONTRACT_INSPECTOR] = 300000; // $0.30
        servicePrices[ServiceType.WALLET_REPUTATION] = 400000;  // $0.40
        servicePrices[ServiceType.ADDRESS_INSIGHTS] = 500000;   // $0.50
    }

    /**
     * @notice Grant permission for a session account to execute services
     * @dev Called by user's smart account when granting Advanced Permission (ERC-7715)
     * @param sessionAccount The session account address that will execute services
     * @param spendingLimit Maximum USDC that can be spent
     * @param durationSeconds Permission duration in seconds
     */
    function grantPermission(
        address sessionAccount,
        uint256 spendingLimit,
        uint256 durationSeconds
    ) external {
        require(sessionAccount != address(0), "Invalid session account");
        require(spendingLimit > 0, "Invalid spending limit");
        require(durationSeconds > 0, "Invalid duration");

        uint256 expiresAt = block.timestamp + durationSeconds;

        userPermissions[msg.sender] = Permission({
            spendingLimit: spendingLimit,
            spentAmount: 0,
            expiresAt: expiresAt,
            isActive: true,
            sessionAccount: sessionAccount
        });

        authorizedSessions[msg.sender][sessionAccount] = true;

        emit PermissionGranted(
            msg.sender,
            sessionAccount,
            spendingLimit,
            expiresAt,
            block.timestamp
        );
    }

    /**
     * @notice Execute a service and charge the user
     * @dev Called by session account on behalf of user (ERC-7715 delegation)
     * @param user The user's smart account address
     * @param serviceType The type of service being executed
     */
    function executeService(
        address user,
        ServiceType serviceType
    ) external returns (bool) {
        Permission storage permission = userPermissions[user];

        // Validate permission
        require(permission.isActive, "Permission not active");
        require(permission.expiresAt > block.timestamp, "Permission expired");
        require(authorizedSessions[user][msg.sender], "Session not authorized");

        uint256 cost = servicePrices[serviceType];
        require(cost > 0, "Invalid service");

        uint256 newSpent = permission.spentAmount + cost;
        require(newSpent <= permission.spendingLimit, "Spending limit exceeded");

        // Update spent amount
        permission.spentAmount = newSpent;

        // Transfer USDC from user to treasury
        bool success = USDC.transferFrom(user, treasury, cost);
        require(success, "USDC transfer failed");

        uint256 remainingBudget = permission.spendingLimit - newSpent;

        emit ServiceExecuted(
            user,
            msg.sender,
            uint8(serviceType),
            cost,
            remainingBudget,
            block.timestamp
        );

        // Auto-revoke if budget exhausted
        if (remainingBudget == 0) {
            permission.isActive = false;
            emit PermissionRevoked(user, msg.sender, block.timestamp);
        }

        return true;
    }

    /**
     * @notice Revoke permission
     * @dev Can be called by user to revoke their permission
     */
    function revokePermission() external {
        Permission storage permission = userPermissions[msg.sender];
        require(permission.isActive, "Permission not active");

        permission.isActive = false;
        authorizedSessions[msg.sender][permission.sessionAccount] = false;

        emit PermissionRevoked(
            msg.sender,
            permission.sessionAccount,
            block.timestamp
        );
    }

    /**
     * @notice Check if a session can execute a service
     * @param user User's smart account address
     * @param sessionAccount Session account address
     * @param serviceType Service to execute
     */
    function canExecuteService(
        address user,
        address sessionAccount,
        ServiceType serviceType
    ) external view returns (bool) {
        Permission memory permission = userPermissions[user];

        if (!permission.isActive) return false;
        if (permission.expiresAt <= block.timestamp) return false;
        if (!authorizedSessions[user][sessionAccount]) return false;

        uint256 cost = servicePrices[serviceType];
        if (permission.spentAmount + cost > permission.spendingLimit) return false;

        return true;
    }

    /**
     * @notice Get permission details
     */
    function getPermission(address user) 
        external 
        view 
        returns (
            uint256 spendingLimit,
            uint256 spentAmount,
            uint256 expiresAt,
            bool isActive,
            address sessionAccount
        ) 
    {
        Permission memory permission = userPermissions[user];
        return (
            permission.spendingLimit,
            permission.spentAmount,
            permission.expiresAt,
            permission.isActive,
            permission.sessionAccount
        );
    }

    /**
     * @notice Update service pricing (owner only)
     */
    function updateServicePrice(ServiceType serviceType, uint256 newPrice) 
        external 
        onlyOwner 
    {
        servicePrices[serviceType] = newPrice;
    }

    /**
     * @notice Update owner
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }
}
