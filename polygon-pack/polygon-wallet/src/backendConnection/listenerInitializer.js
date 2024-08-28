import { useEffect } from 'react';
import { useWallet } from '../WalletContext';
import { useRoom } from './roomContext';
import { useUser } from '../UserContext';

const ListenerInitializer = () => {
    const { setPublicKey, setSecretKey, setMnemonicPhrase, setBalance } = useWallet();
    const { connectedRoom } = useRoom();
    const { setUserMessage, setUserCurrency, setUserGenerators, setUserRewards, setUserGeneratorPrice, setUserNftActive } = useUser();

  useEffect(() => {
    if (connectedRoom) {
      connectedRoom.onMessage('createWallet', (message) => {
        setPublicKey(message.publicKey);
        setSecretKey(message.secret);
        setMnemonicPhrase(message.mnemonic);
      });
      connectedRoom.onMessage('connectWallet', (message) => {
        setPublicKey(message.publicKey);
        setSecretKey(message.secretKey);
        setMnemonicPhrase(message.mnemonic);
        setBalance(message.balance);
      });
      connectedRoom.onMessage('balanceUpdate', (message) => {
        setBalance(message.balance);
        setUserMessage(message.systemMessage);
      })
      connectedRoom.onMessage('systemMessage', (message) => {
        setUserMessage(message);
      });
      connectedRoom.onMessage("updateClicker", (message) => {
        setUserCurrency(message.currency);
        setUserGenerators(message.generators);
        setUserRewards(message.rewards);
        setUserGeneratorPrice(message.generatorPrice);
        setUserNftActive(message.nftActive);
      });
    }
  }, [setPublicKey, connectedRoom]);

  return null;
};

export default ListenerInitializer;