'use client';
import '@/styles/game/mode.css';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import {useGlobalWebSocket} from '@/utils/WebSocketManager';

const PlayMode = () => {
  const { sendMessage, isConnected, registerMessageHandler, unregisterMessageHandler } = useGlobalWebSocket();

  const router = useRouter(); 
  const [name, setName] = useState('');

  const handlePlayFour = () => {
    router.push('/connect_four');
  }

  const handlePlayRandomGame = () => {
    router.push('/mode');
  };


  const handleSaveBtn = () => {
    fetch('http://localhost:8000/play/update_tournament_name', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name,
      }),
    }).then(response => response.json());
    // .then(data => console.log(data));
  };

  if (isConnected)
    sendMessage(JSON.stringify({ init: 'game' }));


  return (
    <div className="main-page">
      <div className="transparent">
        <div className="title">Play Pong with others</div>
        <div className="modes-container">
          <div onClick={handlePlayRandomGame} className="left-mode">
            <img className="" src="mode1.svg" alt="remote-game" />
            <p>REMOTE GAME</p>
          </div>
          <div className="middle-mode">
            <img className="" src="mode2.svg" alt="remote-game" />
            <p>LOCAL GasdfasdAME</p>
          </div>
          <div className="right-mode" onClick={handlePlayFour}  >
            <img style={{
              borderRadius: '20px',
              filter: 'brightness(80%)',
            }} src="1111.svg" alt="connect4-game" />
            <p className='relative'>CONNECT FOUR</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayMode;
