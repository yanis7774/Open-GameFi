'use client'

import { useEffect, useState } from 'react'
import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card"
import { ArrowDownToLine, ArrowUpFromLine, Wallet as WalletIcon } from 'lucide-react'
import { useUser } from './UserContext'
import { useRoom } from './backendConnection/roomContext'
import { ethers } from 'ethers';
import { contractABI } from './contract'

export default function Wallet({ currency = 0, setCurrency }: { currency?: number, setCurrency: (value: number | ((prevValue: number) => number)) => void }) {
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const { accountType, balance, userSecretKey, mnemonicPhrase, userPublicKey } = useUser()
  const { sendMessage } = useRoom()

  useEffect(() => {
    const initializeSigner = async () => {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        try {
          const signer = await provider.getSigner();
          setSigner(signer);
        } catch (error) {
          console.error("Failed to get signer", error);
        }
      }
    };

    initializeSigner();
  }, []);

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount)
    if (!isNaN(amount) && amount > 0) {
      if (accountType === "wallet") {
        if (!signer) {
          console.error("Signer not initialized");
          return;
        }
    
        try {
          const contract = new ethers.Contract("0xFA32024489F5CA7757e6629D7193f41657f2920D", contractABI, signer);
          
          // Prepare the transaction
          const depositAmount = ethers.parseEther(`${amount}`);
          const tx = await contract.deposit({ value: depositAmount });
    
          console.log('Transaction sent:', tx.hash);
    
          // Wait for the transaction to be mined
          const receipt = await tx.wait();
          console.log('Transaction confirmed:', receipt.transactionHash);
          sendMessage("updateBalance",{});
        } catch (error) {
          console.error('Error handling deposit:', error);
        }
      } else {
        sendMessage("depositWallet", {
          secret: userSecretKey,
          amount: amount,
        })
      }
      setDepositAmount('')
    }
  }

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount)
    if (!isNaN(amount) && amount > 0 && amount <= balance) {
      if (accountType === "wallet") {
        const contract = new ethers.Contract("0xFA32024489F5CA7757e6629D7193f41657f2920D", contractABI, signer);
          
        // Prepare the transaction
        const tx = await contract.withdraw(ethers.parseEther(`${amount}`));
  
        console.log('Transaction sent:', tx.hash);
  
        // Wait for the transaction to be mined
        const receipt = await tx.wait();
        console.log('Transaction confirmed:', receipt.transactionHash);
        sendMessage("updateBalance",{});
      } else {
        sendMessage("withdrawWallet", {
          secret: userSecretKey,
          amount: amount,
        })
      }
      setWithdrawAmount('')
    }
  }
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 p-4 sm:p-8 flex items-center justify-center">
      <Card className="w-full max-w-lg"> {/* Made card wider */}
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-bold text-center flex items-center justify-center"> {/* Made font smaller */}
            <WalletIcon className="mr-2" /> Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-xs font-medium text-gray-500">User Public Address</div> {/* Made font smaller */}
            <div className="text-xs font-bold break-words">{userPublicKey}</div> {/* Made font smaller */}
            <div className="text-xs font-medium text-gray-500">Game Balance</div> {/* Made font smaller */}
            <div className="text-2xl font-bold">🪙 {balance}</div> {/* Made font smaller */}
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="deposit to game" className="block text-sm font-medium text-gray-700 mb-1">
                Deposit to Game
              </label>
              <div className="flex space-x-2">
                <Input
                  id="deposit"
                  type="number"
                  min="0"
                  step="1"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Enter amount to deposit"
                />
                <Button onClick={handleDeposit} className="whitespace-nowrap">
                  <ArrowDownToLine className="mr-2 h-4 w-4" /> Deposit
                </Button>
              </div>
            </div>
            <div>
              <label htmlFor="withdraw from game" className="block text-sm font-medium text-gray-700 mb-1">
                Withdraw from Game
              </label>
              <div className="flex space-x-2">
                <Input
                  id="withdraw"
                  type="number"
                  min="0"
                  step="1"
                  max={currency}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Enter amount to withdraw"
                />
                <Button onClick={handleWithdraw} className="whitespace-nowrap">
                  <ArrowUpFromLine className="mr-2 h-4 w-4" /> Withdraw
                </Button>
              </div>
            </div>
          </div>
          {accountType !== "wallet" && (
            <div className="text-center">
              <Button onClick={() => setShowPrivateKey(prev => !prev)} className="whitespace-nowrap">
                Show Private Key
              </Button>
              {showPrivateKey && (
                <div className="mt-4">
                  <div className="text-xs font-medium text-gray-500">Your Private Key:</div> {/* Made font smaller */}
                  <div className="text-xs font-bold break-words">{userSecretKey}</div> {/* Made font smaller */}
                  <div className="text-xs font-medium text-gray-500">Your Mnemonic Phrase:</div> {/* Made font smaller */}
                  <div className="text-xs font-bold">{mnemonicPhrase}</div> {/* Made font smaller */}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}