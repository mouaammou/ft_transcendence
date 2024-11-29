'use client';
import PongGame from './PongGame';
import { useState, useEffect } from 'react';
import '@/styles/game/game.css';
import CountdownTimer from '@/components/countDown/CountDown.jsx';
import Image from 'next/image';
import { getData } from '@/services/apiCalls';
import {useGlobalWebSocket} from '@/utils/WebSocketManager';
import { useRouter } from 'next/navigation';

const GamePage = () => {
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [player1_id, setPlayer1_id] = useState(null);
  const [player2_id, setPlayer2_id] = useState(null);
  const router = useRouter();
  const [player1, setPlayer1] = useState(null);
  const [player2, setPlayer2] = useState(null);
	const { sendMessage, isConnected, registerMessageHandler, unregisterMessageHandler } = useGlobalWebSocket();


  const Skeleton = () => (
    <div className="flex flex-col items-center m-auto">
      <div className="animate-pulse bg-gray-400  rounded-full w-20 h-20 ml-2" />
      <div className="animate-pulse bg-gray-400 rounded-full w-20 h-2 ml-2 mt-1" />
      <div className="animate-pulse bg-gray-400  rounded-full w-20 h-2 ml-2 mt-1 lg:ml-[20px]" />
    </div>
  );

  const handle_message = message => {
    const data = JSON.parse(message.data);
    console.log('data -----> ', data.data);
    if (data.status == 'GAME_DATA') {
      setPlayer1_id(data.player_1);
      setPlayer2_id(data.player_2);
    } else if (data.status == 'NO_GAME_DATA') {
      router.push('/play');
    } else if (data.status == 'PLAYER_IN_TOURNAMENT') {
      router.push('/tournament_board');
    }
  };

  const fetchPlayer = async player_id => {
    try {
      const fetchedUser = await getData(`/userById/${player_id}`);
      if (fetchedUser.status === 200) {
        return fetchedUser.data;
      }
    } catch (error) {
      console.log('Failed to fetch player data', error);
    }
  };

  useEffect(() => {
    if (player1_id && player2_id) {
      fetchPlayer(player1_id).then(player1 => {
        fetchPlayer(player2_id).then(player2 => {
          setPlayer1(player1);
          setPlayer2(player2);
        });
      });
    }
  }, [player1_id, player2_id]);

  useEffect(() => {
    registerMessageHandler(handle_message);
    sendMessage(JSON.stringify({ type: 'GET_GAME_DATA' }));
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
        {player1 ? (
          <div className="left-user">
            <img // i have to resolve the issue with <Image/>
              className="left-user-img"
              src={player1.avatar}
              alt="user1"
              width={100}
              height={100}
            />
            <div className="left-user-name">{player1.username}</div>
          </div>
        ) : (
          <Skeleton />
        )}
        <div className="self-game">
          <PongGame score1={score1} score2={score2} setScore1={setScore1} setScore2={setScore2} />
        </div>
        {player2 ? (
          <div className="right-user">
            <img // i have to resolve the issue with <Image/>
              className="right-user-img"
              src={player2?.avatar}
              alt="user1"
              width={100}
              height={100}
            />
            <div className="right-user-name">{player2?.username}</div>
          </div>
        ) : (
          <Skeleton />
        )}
      </div>
    </div>
  );
};

export default GamePage;
