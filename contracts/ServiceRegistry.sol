// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/**
 * @title ServiceRegistry
 * @notice Registry for PermiPay Analytics services
 * @dev Manages service metadata and pricing updates
 */
contract ServiceRegistry {
    address public owner;

    struct Service {
        string name;
        string description;
        uint256 price;
        bool isActive;
        uint256 totalExecutions;
    }

    mapping(uint8 => Service) public services;
    uint8 public serviceCount;

    event ServiceAdded(uint8 indexed serviceId, string name, uint256 price);
    event ServiceUpdated(uint8 indexed serviceId, uint256 newPrice);
    event ServiceToggled(uint8 indexed serviceId, bool isActive);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        
        // Initialize three core services
        _addService("Contract Inspector", "Smart contract analysis", 300000);
        _addService("Wallet Reputation", "Behavior-based wallet scoring", 400000);
        _addService("Address Insights", "Deep wallet analysis", 500000);
    }

    function _addService(string memory name, string memory description, uint256 price) private {
        services[serviceCount] = Service({
            name: name,
            description: description,
            price: price,
            isActive: true,
            totalExecutions: 0
        });
        
        emit ServiceAdded(serviceCount, name, price);
        serviceCount++;
    }

    function updateServicePrice(uint8 serviceId, uint256 newPrice) external onlyOwner {
        require(serviceId < serviceCount, "Invalid service");
        services[serviceId].price = newPrice;
        emit ServiceUpdated(serviceId, newPrice);
    }

    function toggleService(uint8 serviceId, bool isActive) external onlyOwner {
        require(serviceId < serviceCount, "Invalid service");
        services[serviceId].isActive = isActive;
        emit ServiceToggled(serviceId, isActive);
    }

    function incrementExecutions(uint8 serviceId) external {
        require(serviceId < serviceCount, "Invalid service");
        services[serviceId].totalExecutions++;
    }

    function getService(uint8 serviceId) external view returns (
        string memory name,
        string memory description,
        uint256 price,
        bool isActive,
        uint256 totalExecutions
    ) {
        Service memory service = services[serviceId];
        return (service.name, service.description, service.price, service.isActive, service.totalExecutions);
    }
}
