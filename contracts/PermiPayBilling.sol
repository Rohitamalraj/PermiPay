// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/**
 * @title PermiPayBilling
 * @notice Permission-metered billing contract for PermiPay Analytics
 * @dev Integrates with MetaMask Advanced Permissions (ERC-7715) for gasless, pre-authorized payments
 * 
 * Core Features:
 * 1. Users grant spending permissions once via MetaMask
 * 2. App executes service charges automatically without repeated signatures
 * 3. Three services: Contract Inspector ($0.30), Wallet Reputation ($0.40), Address Insights ($0.50)
 */

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract PermiPayBilling {
    // USDC contract on Base (6 decimals)
    IERC20 public immutable USDC;
    address public immutable treasury;

    // Service IDs and pricing (in USDC with 6 decimals)
    enum ServiceType {
        CONTRACT_INSPECTOR,    // $0.30 = 300000 (0.30 * 1e6)
        WALLET_REPUTATION,     // $0.40 = 400000 (0.40 * 1e6)
        ADDRESS_INSIGHTS       // $0.50 = 500000 (0.50 * 1e6)
    }

    mapping(ServiceType => uint256) public servicePrices;

    // Permission tracking
    struct Permission {
        uint256 spendingLimit;     // Total USDC authorized
        uint256 spentAmount;       // Amount already spent
        uint256 expiresAt;         // Permission expiry timestamp
        bool isActive;             // Permission status
    }

    mapping(address => Permission) public userPermissions;

    // Usage tracking for Envio indexing
    event PermissionGranted(
        address indexed user,
        uint256 spendingLimit,
        uint256 expiresAt,
        uint256 timestamp
    );

    event ServiceExecuted(
        address indexed user,
        ServiceType indexed serviceType,
        uint256 cost,
        uint256 remainingBudget,
        uint256 timestamp
    );

    event PermissionRevoked(
        address indexed user,
        uint256 timestamp
    );

    constructor(address _usdc, address _treasury) {
        USDC = IERC20(_usdc);
        treasury = _treasury;

        // Initialize service prices (USDC has 6 decimals)
        servicePrices[ServiceType.CONTRACT_INSPECTOR] = 300000;  // $0.30
        servicePrices[ServiceType.WALLET_REPUTATION] = 400000;   // $0.40
        servicePrices[ServiceType.ADDRESS_INSIGHTS] = 500000;    // $0.50
    }

    /**
     * @notice Grant permission for the app to spend on user's behalf
     * @dev Called once by user via MetaMask Advanced Permissions
     * @param spendingLimit Total USDC amount authorized (with 6 decimals)
     * @param duration Permission validity period in seconds
     */
    function grantPermission(uint256 spendingLimit, uint256 duration) external {
        require(spendingLimit > 0, "Spending limit must be positive");
        require(duration > 0, "Duration must be positive");
        require(
            USDC.balanceOf(msg.sender) >= spendingLimit,
            "Insufficient USDC balance"
        );

        userPermissions[msg.sender] = Permission({
            spendingLimit: spendingLimit,
            spentAmount: 0,
            expiresAt: block.timestamp + duration,
            isActive: true
        });

        emit PermissionGranted(msg.sender, spendingLimit, block.timestamp + duration, block.timestamp);
    }

    /**
     * @notice Execute a service and charge the user automatically
     * @dev Called by the app backend when user accesses a service
     * @param user Address of the user accessing the service
     * @param serviceType Type of service being accessed
     */
    function executeService(address user, ServiceType serviceType) external returns (bool) {
        Permission storage permission = userPermissions[user];

        // Validate permission
        require(permission.isActive, "No active permission");
        require(block.timestamp < permission.expiresAt, "Permission expired");

        uint256 cost = servicePrices[serviceType];
        require(
            permission.spentAmount + cost <= permission.spendingLimit,
            "Insufficient permission budget"
        );

        // Execute payment
        require(
            USDC.transferFrom(user, treasury, cost),
            "USDC transfer failed"
        );

        // Update spent amount
        permission.spentAmount += cost;
        uint256 remaining = permission.spendingLimit - permission.spentAmount;

        emit ServiceExecuted(user, serviceType, cost, remaining, block.timestamp);

        return true;
    }

    /**
     * @notice Revoke permission manually
     */
    function revokePermission() external {
        require(userPermissions[msg.sender].isActive, "No active permission");
        userPermissions[msg.sender].isActive = false;
        emit PermissionRevoked(msg.sender, block.timestamp);
    }

    /**
     * @notice Check if user has sufficient permission budget for a service
     * @param user User address
     * @param serviceType Service to check
     */
    function canExecuteService(address user, ServiceType serviceType) external view returns (bool) {
        Permission memory permission = userPermissions[user];
        
        if (!permission.isActive || block.timestamp >= permission.expiresAt) {
            return false;
        }

        uint256 cost = servicePrices[serviceType];
        return permission.spentAmount + cost <= permission.spendingLimit;
    }

    /**
     * @notice Get user's current permission status
     */
    function getPermissionStatus(address user) external view returns (
        uint256 spendingLimit,
        uint256 spentAmount,
        uint256 remainingBudget,
        uint256 expiresAt,
        bool isActive
    ) {
        Permission memory permission = userPermissions[user];
        return (
            permission.spendingLimit,
            permission.spentAmount,
            permission.spendingLimit - permission.spentAmount,
            permission.expiresAt,
            permission.isActive && block.timestamp < permission.expiresAt
        );
    }
}
