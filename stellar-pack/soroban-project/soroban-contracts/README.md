# Soroban Smart Contract Projects

This folder contains Soroban smart contracts for the Open GameFi project. It includes a token contract and a main contract for game operations. You can follow this [Medium Guide](https://medium.com/p/39c0b4ed93ea) as an instruction too.

## Table of Contents
1. [Project Structure](#project-structure)
2. [Token Contract](#token-contract)
3. [Main Contract](#main-contract)
4. [Getting Started](#getting-started)
5. [Deployment](#deployment)
6. [Contributing](#contributing)
7. [License](#license)

## Project Structure

The project is organized as follows:

- Root `Cargo.toml` file
- Two separate contract folders:
  - Token contract
  - Main contract

## Token Contract

The token contract can be used to create a custom token for operations in the main contract.

### Features:
- Custom token creation
- Can be used as an NFT contract

### NFT Creation:
1. Mint the desired amount of tokens
2. Lock the issuing account to create a limited supply NFT

## Main Contract

The main contract handles core game operations.

### Functions:
1. **deposit**: Add tokens to the user's local balance
2. **withdraw**: Remove tokens from the user's local balance
3. **balance**: Check the user's local balance of particular tokens
4. **upgrade**: Adds a counter for depleting local balance

All functions operate on the address' local balance of particular tokens.

## Upgrades

You can add any amount of upgrades to the contract, you need to invoke this function from admin wallet:

```bash
stellar contract invoke \
  --id <CONTRACT_ADDRESS> \
  --source <YOUR_STELLAR_SECRET_KEY> \
  --network testnet \
  -- \
  set_upgrade \
  --id <UPGRADE_UNIQUE_ID> \
  --price <UPGRADE_PURCHASE_COST> \
  --max_amount <UPGRADE_LIMIT_AMOUNT>
```

## Getting Started

To set up the project locally:

1. Ensure you have Rust and the Soroban CLI installed
2. Clone the repository
3. Navigate to the smart contract folder
4. Build the contracts:

```bash
cargo build --target wasm32-unknown-unknown --release
```

## Deployment

For detailed deployment instructions, please refer to the main README file in the root directory of the project.

Key steps include:
1. Building the contract
2. Deploying using Soroban CLI
3. Initializing the token contract (if using custom token)

## Additional Resources

- [Soroban Documentation](https://soroban.stellar.org/docs)
- [Stellar Developer Documentation](https://developers.stellar.org/docs)

For any questions or issues, please open an issue in the GitHub repository.