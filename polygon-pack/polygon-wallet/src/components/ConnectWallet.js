import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { useWallet } from '../WalletContext';
import { useRoom } from '../backendConnection/roomContext';

const ConnectWallet = ({ onConnect }) => {
  const [amount, setAmount] = useState('');
  const { sendMessage } = useRoom();
  const { publicKey, secretKey } = useWallet();

  const handleDeposit = () => {
    sendMessage("depositWallet",{
      amount: amount,
      secret: secretKey
    });
  };
  const handleWithdraw = () => {
    sendMessage("withdrawWallet",{
      amount: amount,
      secret: secretKey
    });
  };
  const handleReward = () => {
    sendMessage("rewardWallet",{
      secret: secretKey
    })
  }

  return (
    <div>
      {publicKey && (
        <div>
          <input
          type="text"
          placeholder="Enter Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          />
          <button onClick={handleDeposit}>Deposit</button>
          <button onClick={handleWithdraw}>Withdraw</button>
          <button onClick={handleReward}>Reward</button>
          <div>
            <p>Connected Public Key: {publicKey}</p>
            <QRCode value={publicKey} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectWallet;