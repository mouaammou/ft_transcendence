'use client';
import PongGame from './PongGame';
import { useState, useEffect } from 'react';
import '@/styles/game/game.css';
import CountdownTimer from '@/components/countDown/CountDown.jsx';
import Image from 'next/image';
import { useAuth } from "@/components/auth/loginContext.jsx";
import { useWebSocketContext } from '@/components/websocket/websocketContext';


const GamePage = () => {
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
	const {profileData: user_data} = useAuth();
  const [player1, setPlayer1] = useState(null);
  const [player2, setPlayer2] = useState(null);

  const {opponent} = useWebSocketContext();
	// const changeScore1 = () => {
	// 	setScore1(score1 + 1);
	// }

  // const changeScore1 = () => {
  // 	setScore1(score1 + 1);
  // }

  // Extract parameters from URLSearchParams


  useEffect(() => {
    console.log("params : ", opponent);

    // Set players based on the side
    if (opponent && opponent.side === 'right') {
      setPlayer1(opponent);
      setPlayer2(user_data);
    } else {
      setPlayer1(user_data);
      setPlayer2(opponent);
    }
  }, []);

  return (
    <div className="game">
      <div className="up-section">
        <div className="left-score">{score2}</div>
        <div className="vs-section">
          <div className="vs-image">
            <Image src="/vs.svg" alt="vs" width={70} height={70} />
          </div>
          <CountdownTimer />
        </div>
        <div className="right-score">{score1}</div>
      </div>
      <div className="down-section">
         { player1 ? 
         (<div className="left-user">
       
            <img // i have to resolve the issue with <Image/> 
              className="left-user-img"
              src={player1.avatar}
              alt="user1"
              width={100}
              height={100}
            />
            <div className="left-user-name">{player1.username}</div>
          </div> ):(<div>still loading ....</div>) }
        <div className="self-game">
          <PongGame score1={score1} score2={score2} setScore1={setScore1} setScore2={setScore2} />
        </div>
        { player1 ? 
         (<div className="right-user">
            <img // i have to resolve the issue with <Image/> 
              className="right-user-img"
              src={player2?.avatar}
              alt="user1"
              width={100}
              height={100}
            />
            <div className="right-user-name">{player2?.username}</div>
          </div>):(<div>still loading ....</div>)}
      </div>
    </div>
  );
};

export default GamePage;
