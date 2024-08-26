// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract TokenStorage {
    address public admin;

    // Mapping to store balances of each user
    mapping(address => uint256) public balances;

    // Nested mapping to store counters for each address and ID
    mapping(address => mapping(uint256 => uint256)) public counters;

    // Struct to store purchase price and max limit for each ID
    struct IDProperties {
        uint256 purchasePrice;
        uint256 maxLimit;
    }

    // Mapping from ID to its properties
    mapping(uint256 => IDProperties) public idProperties;

    constructor(address newAdmin) {
        require(newAdmin != address(0), "Invalid admin address");
        admin = newAdmin;
    }

    // Function to add new ID properties (admin only)
    function addIDProperties(uint256 id, uint256 purchasePrice, uint256 maxLimit) public returns (uint256) {
        require(msg.sender == admin, "Not authorized");
        idProperties[id] = IDProperties(purchasePrice, maxLimit);

        return 1;
    }

    function getIDPrice(uint256 id) public view returns (uint256) {
        require(idProperties[id].purchasePrice != 0, "Key is not set");
        return idProperties[id].purchasePrice;
    }

    function getIDLimit(uint256 id) public view returns (uint256) {
        require(idProperties[id].purchasePrice != 0, "Key is not set");
        return idProperties[id].maxLimit;
    }

    // Function to deposit tokens to the contract
    function deposit() public payable returns (uint256) {
        require(msg.value > 0, "Amount must be greater than zero");

        balances[msg.sender] += msg.value;

        return balances[msg.sender];
    }

    // Function to view sender balance
    function getBalance() public view returns (uint256) {
        return balances[msg.sender];
    }

    // Withdraw function to withdraw MATIC
    function withdraw(uint256 amount) public returns (bool) {
        require(amount > 0, "Amount must be greater than zero");
        require(balances[msg.sender] >= amount, "Insufficient balance");

        // Update the balance before sending to prevent re-entrancy attacks
        balances[msg.sender] -= amount;

        // Transfer MATIC back to the sender
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        return success;
    }

    function incrementCounter(uint256 id) public returns (uint256) {
        require(balances[msg.sender] >= idProperties[id].purchasePrice, "Insufficient balance to increment counter");

        // Deduct the cost from the user's balance
        balances[msg.sender] -= idProperties[id].purchasePrice;

        // Increment the counter for the given ID
        counters[msg.sender][id]++;

        return counters[msg.sender][id];
    }
    
    // Function to get the counter value for a specific ID
    function getCounter(uint256 id) public view returns (uint256) {
        return counters[msg.sender][id];
    }
}