'use client'

import { useState } from 'react'
import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card"
import { ArrowDownToLine, ArrowUpFromLine, Wallet as WalletIcon } from 'lucide-react'
import { useUser } from './UserContext'
import { useRoom } from './backendConnection/roomContext'

export default function Wallet({ currency = 0, setCurrency }: { currency?: number, setCurrency: (value: number | ((prevValue: number) => number)) => void }) {
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const { balance, userSecretKey } = useUser();
  const { sendMessage } = useRoom();

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount)
    if (!isNaN(amount) && amount > 0) {
      sendMessage("depositWallet",{
        secret: userSecretKey,
        amount: amount,
      })
      setDepositAmount('')
    }
  }

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount)
    if (!isNaN(amount) && amount > 0 && amount <= balance) {
      sendMessage("withdrawWallet",{
        secret: userSecretKey,
        amount: amount,
      })
      setWithdrawAmount('')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 p-4 sm:p-8 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl font-bold text-center flex items-center justify-center">
            <WalletIcon className="mr-2" /> Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-sm font-medium text-gray-500">Current Balance</div>
            <div className="text-3xl font-bold">🪙 {balance}</div>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="deposit" className="block text-sm font-medium text-gray-700 mb-1">
                Deposit Amount
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
              <label htmlFor="withdraw" className="block text-sm font-medium text-gray-700 mb-1">
                Withdraw Amount
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
        </CardContent>
      </Card>
    </div>
  )
}