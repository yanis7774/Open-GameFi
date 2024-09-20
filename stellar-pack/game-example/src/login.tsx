'use client'

import { useState } from 'react'
import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card"
import { useRoom } from './backendConnection/roomContext'
import { useUser } from './UserContext'
import freighterApi from "@stellar/freighter-api";

export default function Login({ onLogin }: { onLogin: (username: string, password: string) => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState<'basic' | 'freighter'>('freighter')
  const { sendMessage } = useRoom()
  const { userMessage } = useUser()

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

  const retrievePublicKey = async () => {
    const accessObj = await freighterApi.requestAccess()
    if (accessObj.error) return accessObj.error
    return accessObj.address
  }

  const handleFreighterLogin = async () => {
    const isAppConnected = await freighterApi.isConnected()
    if ("isConnected" in isAppConnected && isAppConnected.isConnected) {
      //alert("User has Freighter!")
    }
    const result = await retrievePublicKey()
    sendMessage("loginFreighter", {
      login: result,
    })
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
            <Button variant={activeTab === 'freighter' ? 'outline' : 'default'} onClick={() => setActiveTab('freighter')}>
              Freighter
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
              <Button onClick={handleFreighterLogin}>Login with Freighter</Button>
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