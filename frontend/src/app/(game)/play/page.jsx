'use client';
import '@/styles/game/play.css';
import { useState } from 'react';
import { useRouter } from 'next/navigation';


const PlayMode = () => {

  const router = useRouter(); 

  const handlePlayFour = () => {
    router.push('/connect_four_mode');
  }

  const handlePlayRandomGame = () => {
    router.push('/mode');
    // router.push('/create_join_tournament');
  };

  const handlePlayLocalClick = (e) => {
    e.preventDefault();
    router.push('/local_game');
  };


  // mysocket.sendMessage(JSON.stringify({ init: 'game' }));

  return (
    <div className="main-page">
      <div className="transparent">
        <div className="title">Play Pong with others</div>
        <div className="modes-container">
          <div onClick={handlePlayRandomGame} className="left-mode">
            <img className="" src="mode1.svg" alt="remote-game" />
            <p>REMOTE GAME</p>
          </div>
          <div className="middle-mode uppercase" onClick={handlePlayLocalClick}>
            <img className="images" src="mode2.svg" alt="remote-game" />
            <p>Play Local</p>
          </div>
          <div className="right-mode" onClick={handlePlayFour}  >
            <img 
            className="connect-four-img"
            src="1111.svg" alt="connect4-game" />
            <p className='relative'>CONNECT FOUR</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayMode;
