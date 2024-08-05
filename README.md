# Open-GameFi
An open source library for creating mini-games on different blockchains

# Setup
To setup, you need to do the following:

- Deploy main contract
- Deploy token contract (if custom token is needed)
- Launch backend

## Prerequisites

Ensure you have the following software installed on your system:

- [Node.js](https://nodejs.org/en/download/) (v14.x or later)
- [Rust](https://www.rust-lang.org/tools/install)
- [Soroban CLI](https://soroban.stellar.org/docs/getting-started/installation)
- [Stellar CLI](https://developers.stellar.org/docs/stellar-core/software/stellar-core/)
- [Git](https://git-scm.com/)
- [MongoDB](https://www.mongodb.com/try/download/community)

## Getting Started

### Clone the Repository

Clone the repository
```bash
git clone <https://github.com/yanis7774/Open-GameFi.git>
cd <Open-GameFi>
```

### Install backend

```bash
cd stellar-back
npm install
```

Create an .env file in the backend directory. Add the required environment variables, following the .env.default in the same folder
Backend can be run with

```bash
npm run start
```

Backend server is used for authorization, generating new Stellar wallets and initiating operations with main contract

### Install frontend

To install and run a React App example for interacting with backend server, use from root folder:

```bash
cd stellar-wallet
npm install
npm run start
```

Frontend example is a simple app, that calls for backend functions

### Deploying contracts

There are 2 contracts in this repo, base contract with deposit, withdraw, balance functions and a token contract.
If not using XLM, deploy the custom token contract, otherwise you may ignore it.

To deploy the contract, use the following commands in contract folders:

```bash
stellar contract build

stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/<CONTRACT_NAME>.wasm \
  --source <YOUR STELLAR SECRET KEY> \
  --network testnet
```

Token contract's name is "soroban_token_contract", main contract is "hello_world". You can get a stellar account (public and secret key)
on [Stellar Laboratory](https://laboratory.stellar.org/#account-creator?network=public)

After deploying the token contract, you need to invoke an initialization function to initialize the token:

```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source <YOUR STELLAR SECRET KEY> \
  --network testnet \
  -- \
  initialize \
  --admin <ADMIN PUBLIC STELLAR KEY> \
  --decimal <DECIMEL AMOUNT, UP TO 18> \
  --name <TOKEN NAME> \
  --symbol <TOKEN SYMBOL>
```

Then you can mint some amount to any wallet:

```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source <YOUR STELLAR SECRET KEY> \
  --network testnet \
  -- \
  mint \
  --to <WALLET TO RECEIVE TOKENS> \
  --amount <AMOUNT TO MINT>
```

Token and main contracts' ids should be transferred in .env of backend part

## Next Steps

Check out readmes inside of backend, frontend and contract folders for further details and information
To deploy outside of testnet, change all testnet in bash commands above for desired network.