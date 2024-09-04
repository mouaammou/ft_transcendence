'use client';

import React, { useEffect } from 'react';
import useWebSocket from '@components/websocket/websocket'; // Adjust the import path as needed

const OnlineStatusComponent = () => {
  const { isConnected, messages } = useWebSocket('ws://localhost:8000/ws/online/');

  useEffect(() => {
    if (isConnected) {
      console.log('Connected to WebSocket!');
    }
  }, [isConnected]);

  useEffect(() => {
    if (messages.length > 0) {
      console.log('Received messages:', messages);
    }
  }, [messages]);

  return (
    <div>
      <h1>WebSocket Status: {isConnected ? 'Connected' : 'Disconnected'}</h1>
      <div>
        <h2>Messages:</h2>
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>{JSON.stringify(msg)}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default OnlineStatusComponent;
