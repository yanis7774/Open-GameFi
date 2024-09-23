# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app). You can follow this [Medium Guide](https://medium.com/@opengamefi/14091e253959) as an instruction too.

Run frontend with:

```bash
npm i
npm run start
```

# App Structure

Index.tsx file shows the main app (app.tsx) wrapped in 2 providers: UserProvider, ListenerInitializer and RoomProvider. UserProvider consists of all the needed variables and setter functions, that change them. RoomProvider has variables and functions too, but for backend connections. ListenerInitializer is responsible for connecting to backend and listening to its responses and messages.

The App itself shows Login screen or main app based on the fact of user logging in the game. Before login only login screen is shown. After logging there are two pages and a navigation bar. Navigation bar has the 2 pages buttons and a logout button (which triggers handleLogout function to return to base state). The two pages are Game and Wallet, with Game being the default page. Login, Wallet and Game are separate files with their own logic.

## UserContext

User context has variables stored. They are used for: wallet, currencies, username, prices, etc. The UserContext.tsx has comments for every variables in case more context is needed. useUser() is used everywhere, where these variables are being read or changed.

## Backend Connection

Consists of ListenerInitializer and RoomProvider. RoomProvider automatically connects to colyseus room and stores the connected room. It also has the sendMessage function, that can be imported in other files, when sending messages to server is needed. ListenerInitializer uses connectedRoom from RoomProvider and listens to messages from server, then changes variables with useUser(), updating the frontend state and reacting to server responses.

## Login

Login has 2 modes: basic and freighter. Using freighter, only 1 click is needed to connect using Freighter wallet (by subscribing with it). It is done through handleFreighterLogin() and retrievePublicKey() functions. They use FreighterApi to request access to public wallet address, that will be used later for all wallet operations. When wallet operations arise, a request is sent to server, which builds the transaction and sends it back to front, where freighterapi is called to subscribe this transaction. After accepting, this transaction is ready and is sent back to server to be executed.

Another mode is basic, it uses register/login system. First user registers with any combination of username and password. Server will create a new Stellar wallet instance for the new user. Then user can log in with their username and password. Both login and register is handled by submitting form and sending message to server.

## Wallet

Wallet screen varies depending on account type, but it always shows public address and game balance. Also it has deposit/withdraw interface. For Freighter they launch transaction subscription process and for custodial internal wallets, they automatically do everything using stored data on the server. Deposit and withdraw happend in relation from user's wallet to game balance. So depositing sends tokens from wallet to the game, and withdraw does the reverse operation.

If custodial wallet is connected (through login/password), this page also has a button to show user the secret address and mnemonic phrase.

## Game

The game screen shows a card with current game currency, a tap button to increase the currency by 1 and current session counter. Also it has cards for different types of generators, bought with game currency and game balance (the latter being topped up with tokens from connected wallet). Tapping, buying generators for game currency is done through sending messages to server. Buying with game
balance is done through subscribing, as it is a contract related fucntion call.