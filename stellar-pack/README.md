![alt text](https://github.com/yanis7774/Open-GameFi/blob/main/misc/StellarBanner.png?raw=true)

# Setup Guide

This guide will walk you through setting up a full-stack project using Open GameFi.

## Overview

To set up the project, you need to:

1. Deploy the main contract
2. Deploy the token contract (if using a custom token)
3. Launch the backend
4. Set up and run the frontend

## Prerequisites

Ensure you have the following software installed on your system:

- [Node.js](https://nodejs.org/en/download/) (v14.x or later)
- [Rust](https://www.rust-lang.org/tools/install)
- [Soroban CLI](https://soroban.stellar.org/docs/getting-started/installation)
- [Stellar CLI](https://developers.stellar.org/docs/stellar-core/software/stellar-core/)
- [Git](https://git-scm.com/)
- [MongoDB](https://www.mongodb.com/try/download/community)

**Note**: All prerequisites must be properly installed and configured for this starter kit to work

### Rust, Stellar, Node

Installing Rust for linux/macOS:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```
Installing Rust for windows: [setup link](https://medium.com/r/?url=https%3A%2F%2Fstatic.rust-lang.org%2Frustup%2Fdist%2Fi686-pc-windows-gnu%2Frustup-init.exe).

Install Stellar:
```bash
cargo install --locked stellar-cli --features opt
```
If you use linux/macOS and have brew:
```bash
brew install stellar-cli
```

You can install [Node from here](https://nodejs.org/en/download/package-manager).

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yanis7774/Open-GameFi.git
cd Open-GameFi
```

### 2. Deploying contracts

There are two contracts in this repo:

1. Base contract with deposit, withdraw, and balance functions
2. Token contract (optional, for custom tokens)

#### Deploy Main Contract

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

#### Deploy Token Contract (Optional)
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

### 3. Setup and Run Backend

```bash
cd ../../backend
npm install
```

Create an .env file in the backend directory based on .env.default. Update with your contract IDs and other required variables.
Run the backend:

```bash
npm run start
```

### 4. Setup and Run Frontend

```bash
cd ../frontend
npm install
npm run start
```

## Additional Information

- The backend server handles authorization, generates new Stellar wallets, and initiates operations with the main contract.
- The frontend example is a simple app that interacts with the backend functions.
- To deploy outside of testnet, replace "testnet" with your desired network in all commands.
- Check the READMEs inside the backend, frontend, and contract folders for further details.
- The NFT checker function can be toggled in the .env file. If not using NFTs, you can ignore the NFT address and related mechanics.

## Troubleshooting
If you encounter any issues during setup, please check that all prerequisites are correctly installed and that you've followed each step carefully. For persistent problems, refer to our FAQ or open an issue in the GitHub repository.

## Next Steps
After successfully setting up the project, explore the various features and functionalities provided by Open GameFi. Consider customizing the contracts, backend logic, or frontend UI to suit your specific game requirements.

Happy developing!