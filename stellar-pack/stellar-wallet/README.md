# Getting Started with React frontend open-gamefi app

## Base app

The app structure is spread among different js files. Core of the project is index.js
It has the following structure:

```js
  <UserProvider>
    <WalletProvider>
      <RoomProvider>
        <App />
      </RoomProvider>
    </WalletProvider>
  </UserProvider>
```

App class is all the class parts and can be viewed in App.js. It is wrapped in 3 wrappers.
Wallet and User providers store variables for wallet and user. RoomProvider is used for
connecting to backend

### App

App has following blocks:

- Register: has 2 fields for creating new user (login/password)
- Authorize: has 2 fileds to log in using login/password
- Create Wallet: has interface to show current public, secret, mnemonic keys and balance on the main contract.
create wallet also has a create wallet button, that generates a new stellar account without saving it anywhere
- Connect Wallet: has 3 buttons for operating main contract: deposit, withdraw and reward. Also shows a QR code version of current public key
- IdlePart: has 2 interactive buttons for idle game: click increases currency and generator spends currency to give +1 generator. Logic for this
is given in backend section. Here all the info is shown for the game results.
- Pay Wallet: shows a QR code of current address, where XLM can be send to for some purpose
- ListenerInitializer: adds room listener, that is described in Room Provider section

### User/Wallet

This contexts have a set of variables for storing during a session. Current keys, login, system messages, balance and other data.
User context also stores data for Idle Game (accumulated currency, generators, rewards and if NFT is active right now).

### Room Provider

roomContext has a connection function to init a connection with backend server. It also stores the connected room in a state
listenerInitializer inits a listener for reacting to incoming backend messages and calls setting variables in other contexts

## How to adapt

When adding new functionality for backend, add new listener messages in listenerInitializer. When you need to add some visual interface,
create a new class in a separate file and add it into App.js. Removing class blocks can be done in App.js too. New variables should
be added along with a set functions in Wallet and User contexts, which are then imported when needed.