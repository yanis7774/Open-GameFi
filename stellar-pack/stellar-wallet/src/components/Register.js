import React, { useState } from 'react';
import { useRoom } from '../backendConnection/roomContext';

const Register = ({ onConnect }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const { sendMessage } = useRoom();

  const handleRegister = () => {
    sendMessage("register",{
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
      <button onClick={handleRegister}>Register</button>
    </div>
  );
};

export default Register;