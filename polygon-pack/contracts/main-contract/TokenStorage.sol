// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract TokenStorage {
    address public admin;
    uint256 public locked_funds;

    // Mapping to store balances of each user
    mapping(address => uint256) public balances;
    mapping(address => uint256) public balance_exists;

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
        locked_funds = 0;
    }

    function checkLockedFunds() public view returns (uint256) {
        return locked_funds;
    }
    
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function withdrawFreeFunds(uint256 amount) public returns (bool) {
        require(msg.sender == admin, "Not authorized");
        require(amount > getContractBalance() - locked_funds, "Insufficient funds");
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        return true;
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

    function getIDAmount(address counter_address, uint256 id) public view returns (uint256) {
        require(idProperties[id].purchasePrice != 0, "Key is not set");
        return counters[counter_address][id];
    }

    function getIDLimit(uint256 id) public view returns (uint256) {
        require(idProperties[id].purchasePrice != 0, "Key is not set");
        return idProperties[id].maxLimit;
    }

    // Function to deposit tokens to the contract
    function deposit() public payable returns (uint256) {
        require(msg.value > 0, "Amount must be greater than zero");
        balance_exists[msg.sender] = 1;
        balances[msg.sender] += msg.value;
        locked_funds += msg.value;

        return balances[msg.sender];
    }

    // Function to view sender balance
    function getBalance(address address_check) public view returns (uint256) {
        if (balance_exists[address_check] != 0) {
            return balances[address_check];
        } else {
            return 0;
        }
    }

    // Withdraw function to withdraw MATIC
    function withdraw(uint256 amount) public returns (bool) {
        require(amount > 0, "Amount must be greater than zero");
        require(balances[msg.sender] >= amount, "Insufficient balance");

        // Update the balance before sending to prevent re-entrancy attacks
        balances[msg.sender] -= amount;
        locked_funds -= amount;

        // Transfer MATIC back to the sender
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        return success;
    }

    function incrementCounter(uint256 id) public returns (uint256) {
        require(balances[msg.sender] >= idProperties[id].purchasePrice, "Insufficient balance to increment counter");

        // Deduct the cost from the user's balance
        balances[msg.sender] -= idProperties[id].purchasePrice;
        locked_funds -= idProperties[id].purchasePrice;

        // Increment the counter for the given ID
        counters[msg.sender][id]++;

        return counters[msg.sender][id];
    }
}