// CreateWallet.js
import React from 'react';
import { useRoom } from '../backendConnection/roomContext';
import { useWallet } from '../WalletContext';

const CreateWallet = ({ onCreate }) => {
  const { publicKey, secretKey, mnemonicPhrase } = useWallet();
  const { sendMessage } = useRoom();

  const handleCreate = () => {
    sendMessage("createWallet");
  };

  return (
    <div>
      <button onClick={handleCreate}>Create Wallet</button>
      {publicKey && secretKey && (
        <div>
          <p>Public Key: {publicKey}</p>
          <p>Secret: {secretKey}</p>
          <p>Mnemonic: {mnemonicPhrase}</p>
        </div>
      )}
    </div>
  );
};

export default CreateWallet;