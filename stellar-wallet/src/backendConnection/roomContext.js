import React, { createContext, useContext, useState, useEffect } from 'react';
import { Client } from 'colyseus.js';

const RoomContext = createContext();

export const RoomProvider = ({ children }) => {
  const [connectedRoom, setConnectedRoom] = useState(null);

  useEffect(() => {
    const connectToRoom = async () => {
      const client = new Client('ws://localhost:2574'); // Adjust the URL to your server
      try {
        const room = await client.joinOrCreate('lobby_room');
        setConnectedRoom(room);
        room.send("payService");
        console.log('Connected to room', room);
      } catch (error) {
        console.error('Failed to connect to room', error);
      }
    };

    connectToRoom();
  }, []);

  const sendMessage = (type, message) => {
    if (connectedRoom) {
      connectedRoom.send(type, message);
    } else {
      console.error('Room is not connected.');
    }
  };

  return (
    <RoomContext.Provider value={{ connectedRoom, sendMessage }}>
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = () => useContext(RoomContext);