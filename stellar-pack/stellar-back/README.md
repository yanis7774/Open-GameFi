# Getting started with Colyseus backend open-gamefi app

## Base structure

Index inits 2 things: listen and database. Listen uses appconfig to create a colyseus environment.
App configs use MainRoom class as a base server room, that is described in MainRoom.ts
Init databse happens through dbUtils.ts file and initializes MongoDb connection.
MongoDb connection is handled using repos and mikroORM

### Main Room class

This class contains main functions to create, store users and then call the main contract using their keys.
Most of the messages responding contains a system message, that can be shown in logs or on screen.
Logged in users' info is stored in MainRoomState. It also has an idle game variables

List of messages contains:

- register: gets login and password, creates a new user, new stellar account starting with a mnemonic phrase,
activates it using friendly bot and stores it in db. Password is stored using salt hashing
- login: gets login and password, salt hashes password to check the match and if successful, sends all keys,
contract balance and mnemonic phrase.
- createWallet: generates a new stellar account and sends keys, no storing
- connectWallet: same as createWallet, but does not generate, instead uses mnemonic phrase to restore account
- payService: updates public wallet for sending XLM
- deposit, withdraw, reward Wallet: calls these functions for main contract, using incoming keys
- click, buyGenerator: this is main idle game commands, click gives +1 to currency of player, while
buyGenerator spends currency and gives +1 generator to player

At the creating of Main Room, an interval is launched. It gives players with generators some currency each
second. This is a part of the idle game mechanics.

There is also a separate function that calculates the cost of the next generator (which rises exponentially).

### Idle Game

Idle game is very simple. Player can click a button to gain +1 currency. Player can spend 10 (by default)
currency to get +1 generator. Each generator gives +1 currency a second. There is a block of code at
onJoin and onLeave that helps storing all this data in db without constantly calling it. It also checks
away from game time through lastPresence field to give player currency for his away time.

There is also 2 systems that connect blockchain smart contracts to gameplay: NFT and rewards. Reward system
checks how many rewards are bought on the main contract, each reward multiplies clicking and generator
income. NFT system checks if user has a particular NFT (at least 1) and boosts clicking income by the
generator amount.

### Database

dbUtils.ts is used for all repo operations. It has repoOperation function to optimize operation calls.
Currently it has init, get and save users for basic operations with User db oject found in entities folder.