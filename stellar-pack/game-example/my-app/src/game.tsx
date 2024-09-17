'use client'

import { useState } from 'react'
import { Button } from "./components/ui/button"
import { Progress } from "./components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card"
import { Sparkles, Coffee, IceCream, Cake } from 'lucide-react'
import { useUser } from './UserContext'
import { useRoom } from './backendConnection/roomContext'

type Generator = {
  id: string
  index: number
  name: string
  baseCost: number
  baseProduction: number
  icon: React.ReactNode
}

const paidGeneratorsObj: Generator[] = [
  { id: 'coffee', index: 0, name: 'Coffee Shop', baseCost: 10, baseProduction: 1, icon: <Coffee className="w-4 h-4 sm:w-6 sm:h-6" /> },
  { id: 'iceCream', index: 1, name: 'Ice Cream Parlor', baseCost: 50, baseProduction: 5, icon: <IceCream className="w-4 h-4 sm:w-6 sm:h-6" /> },
  { id: 'cake', index: 2, name: 'Cake Factory', baseCost: 100, baseProduction: 10, icon: <Cake className="w-4 h-4 sm:w-6 sm:h-6" /> },
]

const generatorsObj: Generator[] = [
  { id: 'coffee', index: 0, name: 'Coffee Shop', baseCost: 10, baseProduction: 1, icon: <Coffee className="w-4 h-4 sm:w-6 sm:h-6" /> },
  { id: 'iceCream', index: 1, name: 'Ice Cream Parlor', baseCost: 50, baseProduction: 5, icon: <IceCream className="w-4 h-4 sm:w-6 sm:h-6" /> },
  { id: 'cake', index: 2, name: 'Cake Factory', baseCost: 100, baseProduction: 10, icon: <Cake className="w-4 h-4 sm:w-6 sm:h-6" /> },
]

export default function Game({}: { currency?: number, setCurrency: (value: number | ((prevValue: number) => number)) => void }) {
  const [taps, setTaps] = useState(0);
  const { currency, balance, userSecretKey, generators, paidGenerators, generatorPrice } = useUser();
  const { sendMessage } = useRoom();

  const handleTap = () => {
    setTaps(prevTaps => prevTaps + 1)
    sendMessage("click", {})
  }

  const buyGenerator = (generator: Generator) => {
    sendMessage("buyGenerator", { index: generator.index })
  }

  const buyPaidGenerator = (generator: Generator) => {
    sendMessage("upgradeWallet", { secret: userSecretKey, index: generator.index })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-4 sm:mb-8 relative"> {/* Added relative positioning to the Card */}
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-center">Tap Game</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="text-3xl sm:text-4xl font-bold mb-2 sm:mb-4">💰 {currency}</div>
            <div className="absolute top-4 right-4 text-xl sm:text-2xl font-bold">🪙 {balance}</div>
            <Progress value={(taps % 10) * 10} className="w-full max-w-[16rem] sm:w-64 mb-2 sm:mb-4" />
            <Button
              size="lg"
              onClick={handleTap}
              className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-4 sm:py-6 px-8 sm:px-12 rounded-full text-xl sm:text-3xl shadow-lg transform transition-all duration-100 active:scale-95 active:shadow-inner"
            >
              <Sparkles className="mr-2 h-6 w-6 sm:h-8 sm:w-8" /> Tap Me!
            </Button>
            <div className="mt-2 sm:mt-4 text-base sm:text-lg">Taps this session: {taps}</div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {generatorsObj.map((generator: Generator) => {
            const level = generators ? generators[generator.index] : 0
            const cost = generatorPrice ? generatorPrice[generator.index] : 0
            return (
              <Card key={generator.id} className="flex flex-col">
                <CardHeader className="p-4">
                  <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                    <span className="flex items-center">
                      {generator.icon}
                      <span className="ml-2">{generator.name}</span>
                    </span>
                    <span className="text-sm font-normal">Level: {level}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-between p-4">
                  <div className="text-xs sm:text-sm mb-2">
                    Producing: {(generator.baseProduction * level)}/s
                  </div>
                  <Button
                    onClick={() => buyGenerator(generator)}
                    disabled={currency < cost}
                    className="w-full mt-2 text-xs sm:text-sm"
                  >
                    Buy for 💰 {cost}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
        <div className="my-4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paidGeneratorsObj.map((generator: Generator) => {
            const level = paidGenerators ? paidGenerators[generator.index] : 0
            const cost = generators ? generator.baseCost : 0
            return (
              <Card key={generator.id} className="flex flex-col">
                <CardHeader className="p-4">
                  <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                    <span className="flex items-center">
                      {generator.icon}
                      <span className="ml-2">{generator.name}</span>
                    </span>
                    <span className="text-sm font-normal">Level: {level}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-between p-4">
                  <div className="text-xs sm:text-sm mb-2">
                    Producing: {(generator.baseProduction * level)}/s
                  </div>
                  <Button
                    onClick={() => buyPaidGenerator(generator)}
                    disabled={balance < cost}
                    className="w-full mt-2 text-xs sm:text-sm"
                  >
                    Buy for 🪙 {cost}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}