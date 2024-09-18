# Colyseus Backend for Open GameFi App

This guide explains the structure and functionality of the Colyseus backend for the Open GameFi app. You can follow this [Medium Guide](https://opengamefi.medium.com/c6bbb65c473b) as an instruction too.

Run backend with:

```bash
npm i
npm run start
```

## Table of Contents
1. [Base Structure](#base-structure)
2. [Main Room Class](#main-room-class)
3. [Tap-To-Earn](#Tap-To-Earn)
4. [Database](#database)
5. [Getting Started](#getting-started)
6. [Troubleshooting](#troubleshooting)

## Base Structure

The backend is initialized in `index.ts` with two main components:

1. **Listen**: Creates a Colyseus environment using `appconfig`.
   - Utilizes the `MainRoom` class as the base server room (defined in `MainRoom.ts`).
2. **Database**: Initializes MongoDB connection through `dbUtils.ts`.
   - MongoDB connection is managed using repositories and MikroORM.

## Main Room Class

The `MainRoom` class (`MainRoom.ts`) contains core functions for user management and smart contract interactions.

### Key Features:
- User creation and storage
- Smart contract interactions
- Tap-To-Earn logic

### Message Handlers:

1. **register**: 
   - Creates a new user and Stellar account
   - Activates account using a friendly bot
   - Stores user data in the database (password is salt-hashed)

2. **login**: 
   - Validates credentials
   - Returns keys, contract balance, and mnemonic phrase

3. **createWallet**: 
   - Generates a new Stellar account (not stored)

4. **connectWallet**: 
   - Restores account using mnemonic phrase

5. **payService**: 
   - Updates public wallet for XLM transactions

6. **deposit, withdraw, upgradeWallet**: 
   - Interacts with the main contract

7. **click, buyGenerator**: 
   - Implements Tap-To-Earn mechanics

### Additional Features:
- Interval-based currency generation for players with generators
- Dynamic generator cost calculation

## Tap-To-Earn

A simple Tap-To-Earn implementation with the following features:

- Click to gain currency
- Buy generators with currency
- Generators produce currency over time
- Away-from-game time compensation
- Blockchain integration:
  - Upgrade system: Multiplies income based on upgrades bought on the main contract
  - NFT system: Boosts clicking income if the user owns a specific NFT

## Database

Database operations are handled in `dbUtils.ts`:

- `repoOperation` function optimizes operation calls
- Current operations: initialize, get, and save users
- User database object defined in the `entities` folder

## Getting Started

To set up and run the backend:

1. Install dependencies:
```bash
npm install
```
2. Set up your environment variables in a `.env` file (refer to `.env.example` if provided).

3. Start the server:

```bash
npm start
```

## Troubleshooting

If you encounter issues:

1. Check your database connection and credentials
2. Ensure all required environment variables are set
3. Verify that all dependencies are correctly installed

For further assistance, please refer to the project's main documentation or open an issue on the GitHub repository.