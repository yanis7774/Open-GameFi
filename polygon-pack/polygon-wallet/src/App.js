import React from 'react';
import CreateWallet from './components/CreateWallet';
import ConnectWallet from './components/ConnectWallet';
import ConnectionStatus from './components/ConnectionStatus';
import { useWallet } from './WalletContext';
import ListenerInitializer from './backendConnection/listenerInitializer';
import { useRoom } from './backendConnection/roomContext';
import PayWallet from './components/PayWallet';
import { useUser } from './UserContext';
import Register from './components/Register';
import Authorize from './components/Authorize';
import IdlePart from './components/IdlePart';

function App() {
  const { userMessage } = useUser();

  const handleCreate = (wallet) => {
    //
  };

  const handleConnect = (secret) => {
    //
  };

  return (
    <div className="App">
      <h1>Create New User</h1>
      <Register/>
      <h1>Authorization</h1>
      <Authorize/>
      <h1>System Messages: {userMessage != undefined ? userMessage : "Will be displayed here"}</h1>
      <h1>Stellar Wallet Connection</h1>
      <CreateWallet onCreate={handleCreate} />
      <ConnectWallet onConnect={handleConnect} />
      <IdlePart/>
      <PayWallet/>
      <ListenerInitializer />
    </div>
  );
}

export default App;