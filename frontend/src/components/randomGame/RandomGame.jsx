import React from 'react';
import { useRouter } from 'next/navigation';

const RandomGame = () => {
  const router = useRouter();
  const handlePlayRandomGame = () => {
    // Add your logic to start a random game here
    console.log('Starting a random game...');
    const mysocket = new WebSocket('ws://localhost:8000/ws/global/');
    mysocket.onmessage = function (message) {
      const data = JSON.parse(message.data);
      console.log(data);
      if (data.message == 'start_game')
        {
          console.log("----------");
          router.push('/game/');
        }
    }
  };

  return (
    <div>
      <button onClick={handlePlayRandomGame}>Play Random Game</button>
    </div>
  );
};

export default RandomGame;