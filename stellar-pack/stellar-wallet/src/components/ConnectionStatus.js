import React from 'react';

const ConnectionStatus = ({ publicKey }) => {
  return (
    <div>
      <h3>Connection Status</h3>
      {publicKey ? (
        <p>Connected to: {publicKey}</p>
      ) : (
        <p>Not connected</p>
      )}
    </div>
  );
};

export default ConnectionStatus;