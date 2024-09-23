import React, { createContext, useContext, useState } from 'react';

interface UserContextProps {
  userLogin: any,
  setUserLogin: any,
  userPublicKey: any,
  setUserPublicKey: any,
  userSecretKey: any,
  setUserSecretKey: any,
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
  updatePaidGenerators: any,
  accountType: any,
  setAccountType: any
}
const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider = ({ children }:any) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false) // bool variable, is user logged in right now
  const [accountType, setAccountType] = useState("basic") // Type of account connected, basic with login/password or Freighter wallet conneciton ("freighter")
  const [userLogin, setUserLogin] = useState(null); // Login of user (username, nickname)
  const [userPublicKey, setUserPublicKey] = useState(null); // Stellar wallet public address
  const [userSecretKey, setUserSecretKey] = useState(null); // Stellar wallet secret address (in case of custodial wallet)
  const [userMessage, setUserMessage] = useState("System Messages will be displayed here"); // System messages, to show user action progress
  const [currency, setUserCurrency] = useState(0); // Game currency, that is being tapped
  const [paidGenerators, setPaidGenerators] = useState<number[]>([0, 0, 0]); // Amount of generators bought for wallet currency
  function updatePaidGenerators(newGenerators: number[]) {
    setPaidGenerators([...newGenerators])
  }
  const [generators, setGenerators] = useState<number[]>([0, 0, 0]) // Amount of generators bought for game currency
  function updateGenerators(newGenerators: number[]) {
    setGenerators([...newGenerators])
  }
  const [generatorPrice, setGeneratorPrice] = useState<number[]>([0, 0, 0]); // Prices for basic generators (bought for game currency)
  function updateGeneratorsPrice(newGenerators: number[]) {
    setGeneratorPrice([...newGenerators])
  }
  const [nftActive, setUserNftActive] = useState<boolean[]>([]); // Is NFT active for user
  const [mnemonicPhrase, setMnemonicPhrase] = useState<string>(""); // Mnemonic phrase (in case of custodial wallet)
  const [payPublicKey, setPayPublicKey] = useState(null); // Public key for a paying by QR code module, if added
  const [servicePrice, setServicePrice] = useState(null); // Base price for paying by QR code module
  const [balance, setBalance] = useState(null); // Wallet currency (it can be deposited/withdrawn from connected wallet)

  return (
    <UserContext.Provider value={{ accountType, setAccountType, paidGenerators, updatePaidGenerators, isLoggedIn, setIsLoggedIn, balance, setBalance, servicePrice, setServicePrice, payPublicKey, setPayPublicKey, mnemonicPhrase, setMnemonicPhrase, userLogin, setUserLogin, userPublicKey, setUserPublicKey, userSecretKey, setUserSecretKey, userMessage, setUserMessage, currency, setUserCurrency, generators, updateGenerators, generatorPrice, updateGeneratorsPrice, nftActive, setUserNftActive }}>
      {children}
    </UserContext.Provider>
  );
};

export function useUser() {
  const context = useContext(UserContext)
  if (!context) throw new Error('useUser must be used within a UserProvider')
    return context
}