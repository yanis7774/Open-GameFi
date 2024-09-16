# React Frontend for Open GameFi App

This guide explains the structure and customization of the React frontend for the Open GameFi app.

## Project Structure

The app's core structure is defined in `index.js`:

```jsx
<UserProvider>
  <WalletProvider>
    <RoomProvider>
      <App />
    </RoomProvider>
  </WalletProvider>
</UserProvider>
```

The App component (defined in App.js) is wrapped in three context providers:

- UserProvider: Manages user-related state
- WalletProvider: Handles wallet information
- RoomProvider: Manages backend connection

## Main Components
### App (App.js)
The App component consists of several key blocks:

1. Register: Creates new users (login/password)
2. Authorize: Logs in existing users (login/password)
3. Create Wallet:

- Displays current public, secret, and mnemonic keys
- Shows balance on the main contract
- Includes a button to generate a new Stellar account (not saved)

4. Connect Wallet:

- Provides buttons for main contract operations: deposit, withdraw, and reward
- Displays a QR code of the current public key

5. IdlePart:

- Implements Tap-To-Earn mechanics
- Displays game results and provides interaction buttons

6. Pay Wallet: Shows a QR code for the current address to receive XLM
7. ListenerInitializer: Sets up room listeners for backend communication

## Context Providers
### UserProvider and WalletProvider
These contexts store session-related information:

- User data (login, game state)
- Wallet data (keys, balance)
- System messages

## RoomProvider
Manages the backend connection:

- Provides a connection function to initialize backend communication
- Stores the connected room in its state

## ListenerInitializer
Initializes listeners for backend messages and updates other contexts accordingly.
## Customization Guide
### Adding New Functionality

1. Backend Integration:

- Add new listener messages in listenerInitializer

2. UI Components:

- Create a new component in a separate file
- Import and add the component to App.js

3. State Management:

- Add new variables and setter functions in UserProvider or WalletProvider
- Import and use these in your components as needed

## Removing Features
To remove existing features, locate and remove the corresponding component from App.js.

## Best Practices

1. Modularity: Keep each component in a separate file for better organization.
2. State Management: Use context providers for global state, and local state for component-specific data.
3. Error Handling: Implement proper error handling in components and API calls.
4. Responsive Design: Ensure your UI is responsive for various screen sizes.
5. Code Comments: Add comments to explain complex logic or component purposes.

## Getting Started
To run the frontend locally:

```bash
cd path/to/frontend
npm install
npm start
```

The app will be available at http://localhost:3000 by default.

## Troubleshooting
If you encounter issues:

1. Check the console for error messages
2. Ensure all dependencies are correctly installed
3. Verify that the backend server is running and accessible

For further assistance, please refer to the project's main documentation or open an issue on the GitHub repository.