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
- [Git](https://git-scm.com/)
- [MongoDB](https://www.mongodb.com/try/download/community)

**Note**: All prerequisites must be properly installed and configured for this starter kit to work.

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yanis7774/Open-GameFi.git
cd Open-GameFi
```

### 2. Deploying contract

There is a contract in this repo, first we need to deploy it.

#### Deploy Main Contract

Fill in the .env file with your polygon private key, public address and rpc url.
```bash
cd contracts/main-contract
npm install
node deploy.js
```

The contract will be deployed on polygon mainnet by default, you can check it on polygonscan, the console will output the contract address.
Admin for contract is the public key of the address that was specified in the .env file.

#### Modify contract

If you want to modify the contract, you can do so by editing the contract.sol file.
If you do that, you need to upload the .sol file to https://remix.ethereum.org/ and compile it. (you can view compilation info in the left-side tab)
After that you will be able to get the new bytecode which you will need to put in the .env file.
You will also need to change the deploy.js file to use the new API. Then deploy the contract.

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