import { useEffect } from 'react';
import { useRoom } from './roomContext';
import { useUser } from '../UserContext';

const ListenerInitializer = () => {
    const { connectedRoom } = useRoom();
    const { setIsLoggedIn, updatePaidGenerators, setUserPublicKey, setUserSecretKey, setPayPublicKey, setServicePrice, setMnemonicPhrase, setBalance, setUserMessage, setUserCurrency, updateGenerators, updateGeneratorsPrice, setUserNftActive } = useUser();

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
        setUserSecretKey(message.secretKey);
        setMnemonicPhrase(message.mnemonic);
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
    }
  }, [setUserPublicKey, connectedRoom]);

  return null;
};

export default ListenerInitializer;