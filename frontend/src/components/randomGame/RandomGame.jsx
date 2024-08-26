import React from 'react';


const RandomGame = () => {
  const handlePlayRandomGame = () => {
    // Add your logic to start a random game here
    console.log('Starting a random game...');
    const mysocket = new WebSocket('ws://localhost:8000/ws/global/');
  };

  return (
    <div>
      <button onClick={handlePlayRandomGame}>Play Random Game</button>
    </div>
  );
};

export default RandomGame;