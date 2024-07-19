import { Keypair } from 'stellar-sdk';

export const createWallet = () => {
  const pair = Keypair.random();
  return {
    publicKey: pair.publicKey(),
    secret: pair.secret(),
  };
};

export const connectWallet = (secret) => {
  const pair = Keypair.fromSecret(secret);
  return pair.publicKey();
};