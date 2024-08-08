# Soroban Smart Contract Projects

## Project Structure

This folder has an overall Cargo.toml as a root and 2 contracts in several folders. Use the main README
guide to learn how to deploy them.

## Token contract

Can be used to create a custom token for operations in main contract. Installation is described in main README file.

## Main contract

Main contract has 4 basic functions: deposit, withdraw, balance and reward. Reward adds a counter for depleting
local balance. Other 3 functions are simple operations, that operate address' local balance of particular tokens.