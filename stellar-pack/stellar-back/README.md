# Getting started with Colyseus backend open-gamefi app

## Base structure

Index inits 2 things: listen and database. Listen uses appconfig to create a colyseus environment.
App configs use MainRoom class as a base server room, that is described in MainRoom.ts
Init databse happens through dbUtils.ts file and initializes MongoDb connection.
MongoDb connection is handled using repos and mikroORM

### Main Room class

This class contains main functions to create, store users and then call the main contract using their keys.
Most of the messages responding contains a system message, that can be shown in logs or on screen.
List of messages contains:

- register: gets login and password, creates a new user, new stellar account starting with a mnemonic phrase,
activates it using friendly bot and stores it in db. Password is stored using salt hashing
- login: gets login and password, salt hashes password to check the match and if successful, sends all keys,
contract balance and mnemonic phrase.
- createWallet: generates a new stellar account and sends keys, no storing
- connectWallet: same as createWallet, but does not generate, instead uses mnemonic phrase to restore account
- payService: updates public wallet for sending XLM
- deposit, withdraw, reward Wallet: calls these functions for main contract, using incoming keys

### Database

dbUtils.ts is used for all repo operations. It has repoOperation function to optimize operation calls.
Currently it has init, get and save users for basic operations with User db oject found in entities folder.