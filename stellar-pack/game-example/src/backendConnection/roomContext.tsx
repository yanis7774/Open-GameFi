import React, { createContext, useContext, useState, useEffect } from 'react'
import { Client, Room } from 'colyseus.js'

interface RoomContextProps {
  connectedRoom: Room | null,
  setConnectedRoom: (room: Room | null) => void,
  sendMessage: (type: string, message: any) => void
}

const RoomContext = createContext<RoomContextProps | undefined>(undefined)

export function RoomProvider({ children }: { children: React.ReactNode }) {
  const [connectedRoom, setConnectedRoom] = useState<Room | null>(null)

  useEffect(() => {
    const client = new Client('ws://localhost:2574') // Adjust the URL to your server
    const connectToRoom = async () => {
      try {
        if (connectedRoom == null) {
          const room = await client.joinOrCreate<Room>('lobby_room')
          setConnectedRoom(room)
          console.log('Connected to room', room)
        }
      } catch (error) {
        console.error('Failed to connect to room', error)
      }
    }

    connectToRoom()
  }, [connectedRoom])

  function sendMessage(type: string, message: any) {
    if (connectedRoom) {
      connectedRoom.send(type, message)
    } else {
      console.error('Room is not connected.')
    }
  }

  return (
    <RoomContext.Provider value={{ connectedRoom, setConnectedRoom, sendMessage }}>
      {children}
    </RoomContext.Provider>
  )
}

export function useRoom() {
  const context = useContext(RoomContext)
  if (!context) throw new Error('useRoom must be used within a RoomProvider')
  return context
}