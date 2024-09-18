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

There are two contracts in this repo:

1. Base contract with deposit, withdraw, and balance functions
2. Token contract (optional, for custom tokens)

### Deploy Main Contract

```bash
cd soroban-project/soroban-contracts
stellar contract build
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/main_contract.wasm \
  --source <YOUR_STELLAR_SECRET_KEY> \
  --network testnet
```

Initialize the contract with admin public key argument

```bash
stellar contract invoke \
  --id <CONTRACT_ADDRESS> \
  --source <YOUR_STELLAR_SECRET_KEY> \
  --network testnet \
  -- \
  initialize \
  --admin <ADMIN_PUBLIC_KEY> \
  --token <TOKEN_CONTRACT_ADDRESS>
```

Add at least one upgrade to the contract (required for example to work, use id 1)

```bash
stellar contract invoke \
  --id <CONTRACT_ADDRESS> \
  --source <YOUR_STELLAR_SECRET_KEY> \
  --network testnet \
  -- \
  set_upgrade \
  --id 1 \
  --price <UPGRADE_PURCHASE_COST> \
  --max_amount <UPGRADE_LIMIT_AMOUNT>
```

### Deploy Token Contract (Optional)
If not using XLM, deploy the custom token contract:

```bash
cd ../soroban-token-contract
stellar contract build
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/soroban-token-contract.wasm \
  --source <YOUR_STELLAR_SECRET_KEY> \
  --network testnet
```

Initialize the token contract:
```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source <YOUR_STELLAR_SECRET_KEY> \
  --network testnet \
  -- \
  initialize \
  --admin <ADMIN_PUBLIC_STELLAR_KEY> \
  --decimal <DECIMAL_AMOUNT_UP_TO_18> \
  --name <TOKEN_NAME> \
  --symbol <TOKEN_SYMBOL>
```

Mint tokens (optional):
```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source <YOUR_STELLAR_SECRET_KEY> \
  --network testnet \
  -- \
  mint \
  --to <RECIPIENT_WALLET> \
  --amount <AMOUNT_TO_MINT>
```
Note: You can get a Stellar account (public and secret key) on Stellar Laboratory.

## Additional Resources

- [Soroban Documentation](https://soroban.stellar.org/docs)
- [Stellar Developer Documentation](https://developers.stellar.org/docs)

For any questions or issues, please open an issue in the GitHub repository.