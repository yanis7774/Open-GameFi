import React, { createContext, useContext, useState } from 'react';

interface UserContextProps {
  userLogin: any,
  setUserLogin: any,
  userPublicKey: any,
  setUserPublicKey: any,
  userSecretKey: any,
  setUserSecretKey: any,
  userMnemonic: any,
  setUserMnemonic: any,
  userMessage: any,
  setUserMessage: any,
  currency: any,
  setUserCurrency: any,
  generators: number[],
  updateGenerators: any,
  generatorPrice: number[],
  updateGeneratorsPrice: any,
  nftActive: any,
  setUserNftActive: any,
  balance: any,
  setBalance: any,
  servicePrice: any,
  setServicePrice: any,
  payPublicKey: any,
  setPayPublicKey: any,
  mnemonicPhrase: any,
  setMnemonicPhrase: any,
  isLoggedIn: any,
  setIsLoggedIn: any,
  paidGenerators: number[],
  updatePaidGenerators: any
}
const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider = ({ children }:any) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userLogin, setUserLogin] = useState(null);
  const [userPublicKey, setUserPublicKey] = useState(null);
  const [userSecretKey, setUserSecretKey] = useState(null);
  const [userMnemonic, setUserMnemonic] = useState(null);
  const [userMessage, setUserMessage] = useState("System Messages will be displayed here");
  const [currency, setUserCurrency] = useState(0);
  const [paidGenerators, setPaidGenerators] = useState<number[]>([0, 0, 0]);
  function updatePaidGenerators(newGenerators: number[]) {
    setPaidGenerators([...newGenerators])
  }
  const [generators, setGenerators] = useState<number[]>([0, 0, 0])
  function updateGenerators(newGenerators: number[]) {
    setGenerators([...newGenerators])
  }
  const [generatorPrice, setGeneratorPrice] = useState<number[]>([0, 0, 0]);
  function updateGeneratorsPrice(newGenerators: number[]) {
    setGeneratorPrice([...newGenerators])
  }
  const [nftActive, setUserNftActive] = useState<boolean[]>([]);
  const [mnemonicPhrase, setMnemonicPhrase] = useState<string[]>([]);
  const [payPublicKey, setPayPublicKey] = useState(null);
  const [servicePrice, setServicePrice] = useState(null);
  const [balance, setBalance] = useState(null);

  return (
    <UserContext.Provider value={{ paidGenerators, updatePaidGenerators, isLoggedIn, setIsLoggedIn, balance, setBalance, servicePrice, setServicePrice, payPublicKey, setPayPublicKey, mnemonicPhrase, setMnemonicPhrase, userLogin, setUserLogin, userPublicKey, setUserPublicKey, userSecretKey, setUserSecretKey, userMnemonic, setUserMnemonic, userMessage, setUserMessage, currency, setUserCurrency, generators, updateGenerators, generatorPrice, updateGeneratorsPrice, nftActive, setUserNftActive }}>
      {children}
    </UserContext.Provider>
  );
};

export function useUser() {
  const context = useContext(UserContext)
  if (!context) throw new Error('useUser must be used within a UserProvider')
    return context
}