import { useEffect } from 'react';
import { useWallet } from '../WalletContext';
import { useRoom } from './roomContext';
import { useUser } from '../UserContext';

const ListenerInitializer = () => {
    const { setPublicKey, setSecretKey, setPayPublicKey, setServicePrice, setMnemonicPhrase } = useWallet();
    const { connectedRoom } = useRoom();
    const { setUserMessage } = useUser();

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
      });
      connectedRoom.onMessage('payService', (message) => {
        setPayPublicKey(message.publicKey);
        setServicePrice(message.price);
      });
      connectedRoom.onMessage('systemMessage', (message) => {
        setUserMessage(message);
      });
    }
  }, [setPublicKey, connectedRoom]);

  return null;
};

export default ListenerInitializer;