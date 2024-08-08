import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userLogin, setUserLogin] = useState(null);
  const [userPublicKey, setUserPublicKey] = useState(null);
  const [userSecretKey, setUserSecretKey] = useState(null);
  const [userMnemonic, setUserMnemonic] = useState(null);
  const [userMessage, setUserMessage] = useState(null);
  const [rewards, setUserRewards] = useState(null);
  const [currency, setUserCurrency] = useState(null);
  const [generators, setUserGenerators] = useState(null);
  const [generatorPrice, setUserGeneratorPrice] = useState(null);
  const [nftActive, setUserNftActive] = useState(null);

  return (
    <UserContext.Provider value={{ userLogin, setUserLogin, userPublicKey, setUserPublicKey, userSecretKey, setUserSecretKey, userMnemonic, setUserMnemonic, userMessage, setUserMessage, rewards, setUserRewards, currency, setUserCurrency, generators, setUserGenerators, generatorPrice, setUserGeneratorPrice, nftActive, setUserNftActive }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);