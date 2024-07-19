import React from 'react';
import QRCode from 'react-qr-code';
import { useWallet } from '../WalletContext';

const PayWallet = () => {
  const { payPublicKey, servicePrice } = useWallet();

  return (
    <div>
      {payPublicKey && servicePrice && (
        <div>
          <p>Pay here: {payPublicKey}</p>
          <QRCode value={`web+stellar:pay?destination=${payPublicKey}&amount=${servicePrice}`} />
        </div>
      )}
    </div>
  );
};

export default PayWallet;