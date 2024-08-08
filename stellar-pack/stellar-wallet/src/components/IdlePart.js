import { useWallet } from '../WalletContext';
import { useRoom } from '../backendConnection/roomContext';
import { useUser } from '../UserContext';

const IdlePart = ({ onConnect }) => {
  const { sendMessage } = useRoom();
  const { publicKey } = useWallet();
  const { rewards, currency, generators, generatorPrice, nftActive } = useUser();

  const handleBuyGenerator = () => {
    sendMessage("buyGenerator",{});
  }
  const handleClickCurrency = () => {
    sendMessage("click",{});
  }

  return (
    <div>
      {publicKey && (
        <div>
          <div>
            <p>Idle Game:</p>
          </div>
          <div>
            <button onClick={handleClickCurrency}>Click</button>
            <button onClick={handleBuyGenerator}>Buy Generator</button>
            <div>
              <p>Click to add currency, buy generator for passive income. Rewards multiply all income/clicks. Having NFT makes click base income equal to generators</p>
            </div>
          </div>
          <div>
            <p>Currency: {currency}</p>
          </div>
          <div>
            <p>Generators: {generators}, cost: {generatorPrice}</p>
          </div>
          <div>
            <p>Rewards: {rewards}</p>
          </div>
          <div>
            <p>Nft: {nftActive ? "ACTIVE" : "INACTIVE"}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default IdlePart;