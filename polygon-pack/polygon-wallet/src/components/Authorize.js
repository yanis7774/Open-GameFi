import React, { useState } from 'react';
import { useRoom } from '../backendConnection/roomContext';

const Authorize = ({ onConnect }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const { sendMessage } = useRoom();

  const handleLogin = () => {
    sendMessage("login",{
      login: login,
      password: password,
    })
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Enter Login"
        value={login}
        onChange={(e) => setLogin(e.target.value)}
      />
      <input
        type="text"
        placeholder="Enter Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Authorize;