import { useEffect } from 'react';
import { useRoom } from './roomContext';
import { useUser } from '../UserContext';

const ListenerInitializer = () => {
    const { connectedRoom, sendMessage } = useRoom();
    const { setAccountType, setIsLoggedIn, updatePaidGenerators, setUserPublicKey, setUserSecretKey, setPayPublicKey, setServicePrice, setMnemonicPhrase, setBalance, setUserMessage, setUserCurrency, updateGenerators, updateGeneratorsPrice, setUserNftActive } = useUser();

  useEffect(() => {
    if (connectedRoom) {
      connectedRoom.onMessage('createWallet', (message: any) => {
        setUserPublicKey(message.publicKey);
        setUserSecretKey(message.secret);
        setMnemonicPhrase(message.mnemonic);
      });
      connectedRoom.onMessage('connectWallet', (message: any) => {
        setIsLoggedIn(true);
        setUserPublicKey(message.publicKey);
        setAccountType(message.accountType ? message.accountType : "basic");
        setUserSecretKey(message.accountType ? null : message.secretKey);
        setMnemonicPhrase(message.accountType ? null : message.mnemonic);
      });
      connectedRoom.onMessage('balanceUpdate', (message: any) => {
        setBalance(message.balance);
        setUserMessage(message.systemMessage);
      })
      connectedRoom.onMessage('payService', (message: any) => {
        setPayPublicKey(message.publicKey);
        setServicePrice(message.price);
      });
      connectedRoom.onMessage('systemMessage', (message: any) => {
        setUserMessage(message);
      });
      connectedRoom.onMessage("updateClicker", (message: any) => {
        setUserCurrency(message.currency);
        updateGenerators(message.generators);
        updatePaidGenerators(message.paidGenerators);
        updateGeneratorsPrice(message.generatorPrice);
        setUserNftActive(message.nftActive);
      });
      // connectedRoom.onMessage("depositWalletSign", async (message: any) => {
      //   const signedXdr = await signTransaction(message.xdr, {
      //     networkPassphrase: message.network
      //   })
      //   console.log("signed xdr: ", signedXdr);
      //   sendMessage("signedDepositWallet", {signedXdr: signedXdr});
      // })
      // connectedRoom.onMessage("withdrawWalletSign", async (message: any) => {
      //   const signedXdr = await signTransaction(message.xdr, {
      //     networkPassphrase: message.network
      //   })
      //   console.log("signed xdr: ", signedXdr);
      //   sendMessage("signedWithdrawWallet", {signedXdr: signedXdr});
      // })
      // connectedRoom.onMessage("upgradeWalletSign", async (message: any) => {
      //   const signedXdr = await signTransaction(message.xdrObj.xdr, {
      //     networkPassphrase: message.xdrObj.network
      //   })
      //   console.log("signed xdr: ", signedXdr);
      //   sendMessage("signedUpgradeWallet", {index: message.index, signedXdr: signedXdr});
      // })
    }
  }, [setUserPublicKey, connectedRoom]);

  return null;
};

export default ListenerInitializer;