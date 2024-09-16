'use client'

import { useState } from 'react'
import { Button } from "./components/ui/button"
import Login from './login'
import Wallet from './wallet'
import Game from './game'
import { useUser } from './UserContext'
import { useRoom } from './backendConnection/roomContext'

export default function App() {
  const [currentPage, setCurrentPage] = useState('game')
  const [currency, setCurrency] = useState(0);
  const {isLoggedIn, setIsLoggedIn, userMessage} = useUser();
  const { sendMessage } = useRoom();

  const handleLogin = (username: string, password: string) => {
    // In a real app, you'd verify the credentials here
    console.log(`Logging in with username: ${username} and password: ${password}`)
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setCurrentPage('game')
    setCurrency(0)  // Reset currency on logout
    sendMessage("logout",{});
  }

  if (!isLoggedIn) {
    return (
      <>
        <Login onLogin={handleLogin} />
      </>
    )
  }

  return (
<div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-500 to-pink-500">
  <nav className="bg-white bg-opacity-20 p-4">
    <div className="flex justify-center space-x-4">
      <Button
        onClick={() => setCurrentPage('game')}
        variant={currentPage === 'game' ? 'default' : 'outline'}
      >
        Game
      </Button>
      <Button
        onClick={() => setCurrentPage('wallet')}
        variant={currentPage === 'wallet' ? 'default' : 'outline'}
      >
        Wallet
      </Button>
      <Button onClick={handleLogout} variant="destructive">
        Logout
      </Button>
    </div>
  </nav>
  <main className="flex-grow">
    <div className="text-center text-white p-2">
      {userMessage}
    </div>
    {currentPage === 'game' ? (
      <Game currency={currency} setCurrency={setCurrency} />
    ) : (
      <Wallet currency={currency} setCurrency={setCurrency} />
    )}
  </main>
</div>
  )
}