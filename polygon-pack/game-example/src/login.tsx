'use client'

import { useCallback, useState } from 'react'
import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card"
import { useRoom } from './backendConnection/roomContext'
import { useUser } from './UserContext'

import Web3 from 'web3';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';

interface WalletState {
  web3: Web3 | null;
  address: string | null;
  chainId: number | null;
  connected: boolean;
}

const initialState: WalletState = {
  web3: null,
  address: null,
  chainId: null,
  connected: false,
};

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      rpc: {
        137: 'https://polygon-rpc.com/', // Polygon Mainnet
      },
    },
  },
};

const web3Modal = new Web3Modal({
  network: 'mainnet',
  cacheProvider: true,
  providerOptions,
});

export default function Login({ onLogin }: { onLogin: (username: string, password: string) => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState<'basic' | 'wallet'>('wallet')
  const { sendMessage } = useRoom()
  const { userMessage } = useUser()
  const [walletState, setWalletState] = useState<WalletState>(initialState);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage("login", {
      login: username,
      password: password,
    })
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage("register", {
      login: username,
      password: password,
    })
  }

  const subscribeProvider = useCallback(async (provider: any) => {
    if (!provider.on) {
      return;
    }

    const resetWalletState = () => {
      setWalletState(initialState);
    };

    provider.on('close', () => resetWalletState());
    provider.on('accountsChanged', async (accounts: string[]) => {
      setWalletState((prevState) => ({
        ...prevState,
        address: accounts[0],
      }));
    });
    provider.on('chainChanged', async (chainId: number) => {
      const web3 = new Web3(provider);
      setWalletState((prevState) => ({
        ...prevState,
        chainId,
        web3,
      }));
    });
  }, []);

  const handleWalletLogin = async () => {
    try {
      const provider = await web3Modal.connect();
      await subscribeProvider(provider);
      const web3 = new Web3(provider);
      const accounts = await web3.eth.getAccounts();
      const address = accounts[0];
      const chainId = Number(await web3.eth.getChainId());

      setWalletState({
        web3,
        address,
        chainId,
        connected: true,
      });
      sendMessage("loginWallet", {
        login: address,
      })
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
          <div className="flex justify-around mt-4">
            <Button variant={activeTab === 'basic' ? 'outline' : 'default'} onClick={() => setActiveTab('basic')}>
              Basic
            </Button>
            <Button variant={activeTab === 'wallet' ? 'outline' : 'default'} onClick={() => setActiveTab('wallet')}>
              Wallet
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {activeTab === 'basic' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium leading-none">Username</label>
                <Input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e: any) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium leading-none">Password</label>
                <Input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e: any) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex space-x-2">
                <Button type="submit" className="flex-1">Login</Button>
                <Button type="button" className="flex-1" onClick={handleRegister}>Register</Button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col items-center">
              <Button onClick={handleWalletLogin}>Login with Wallet</Button>
            </div>
          )}
          <div className="text-center text-sm text-black-500 mt-4">
            {userMessage}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}