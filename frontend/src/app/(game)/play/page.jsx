'use client';
import '@/styles/game/mode.css';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import mysocket from '@/utils/WebSocketManager';

const PlayMode = () => {
  const router = useRouter();
  const [name, setName] = useState('');

  const handlePlayTournament = () => {
    router.push('/create_join_tournament');
  };

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

  mysocket.sendMessage(JSON.stringify({ init: 'game' }));

  return (
    <div className="main-page">
      <div className="transparent">
        <div className="title">Play Pong with others</div>
        <div className="modes-container">
          <div onClick={handlePlayRandomGame} className="left-mode">
            <img className="images" src="mode1.svg" alt="remote-game" />
            <p>REMOTE GAME</p>
          </div>
          <div className="middle-mode">
            <img className="images" src="mode2.svg" alt="remote-game" />
            <p>LOCAL GAME</p>
          </div>
          <div className="right-mode" onClick={handlePlayTournament}>
            <img className="images" src="mode3.svg" alt="remote-game" />
            <p>TOURNAMENT</p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default PlayMode;
