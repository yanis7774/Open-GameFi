import React, { createContext, useContext, useState } from 'react';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [publicKey, setPublicKey] = useState(null);
  const [secretKey, setSecretKey] = useState(null);
  const [mnemonicPhrase, setMnemonicPhrase] = useState(null);
  const [balance, setBalance] = useState(null);

  console.log('WalletProvider rendered', { publicKey });

  return (
    <WalletContext.Provider value={{ publicKey, setPublicKey, secretKey, setSecretKey, mnemonicPhrase, setMnemonicPhrase, balance, setBalance }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);