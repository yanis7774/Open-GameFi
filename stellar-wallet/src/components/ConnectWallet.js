import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { useWallet } from '../WalletContext';
import { useRoom } from '../backendConnection/roomContext';

const ConnectWallet = ({ onConnect }) => {
  const [secret, setSecret] = useState('');
  const { sendMessage } = useRoom();
  const { publicKey } = useWallet();

  const handleConnect = () => {
    sendMessage("connectWallet",{mnemonic: secret})
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Enter Mnemonic"
        value={secret}
        onChange={(e) => setSecret(e.target.value)}
      />
      <button onClick={handleConnect}>Connect Wallet</button>
      {publicKey && (
        <div>
          <p>Connected Public Key: {publicKey}</p>
          <QRCode value={publicKey} />
        </div>
      )}
    </div>
  );
};

export default ConnectWallet;