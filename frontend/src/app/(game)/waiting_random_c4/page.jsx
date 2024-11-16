// src/components/WaitingPage.jsx
'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/loginContext.jsx';
import { getData } from '@/services/apiCalls';
import { useWebSocketContext } from '@/components/websocket/websocketContext';
import { Modal } from '@/components/modals/Modal';

import { useGlobalWebSocket } from '@/utils/WebSocketManager';


const Skeleton = () => <div className="animate-pulse bg-gray-600 rounded-full w-16 h-16 md:w-24 md:h-24 lg:w-36 lg:h-36  ml-2" />;

const WaitingPage = () => {
  const { sendMessage, isConnected, registerMessageHandler, unregisterMessageHandler } = useGlobalWebSocket();
  const { profileData: user_data } = useAuth();
  const [opponent, setOpponent] = useState(null);
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [msgDescription, setMsgDescription] = useState('');
  let timer;

  const handleMessage = async (message) => {
    const data = JSON.parse(message.data);

    if (data.status === 'start') {
      const opponent_id = data.opponent;
      try {
        const fetchedUser = await getData(`/userById/${opponent_id}`);
        if (fetchedUser.status === 200) {
          setOpponent(fetchedUser.data);
          timer = setTimeout(() => {
            router.push('/game');
          }, 1000);
        } else {
          console.error('Fetched user data is invalid');
        }
      } catch (error) {
        console.error('Failed to fetch opponent data', error);
      }
    } else if (data.status === 'already_in_game') {
      setModalOpen(true);
      setModalMessage('You Are already In Game');
      setMsgDescription('You are currently participating in a game. Please complete your ongoing game before joining a new one. Thank you for your engagement!');
      setTimeout(() => {
        router.push('/game');
      }, 2000);
    } else if (data.status === 'already_in_tournament') {
      setModalOpen(true);
      setModalMessage('You Are Already In Tournament');
      setMsgDescription('You are currently registered in a tournament. Please complete or leave your ongoing participation before entering a new tournament. Thank you for being part of the event!');
      setTimeout(() => {
        router.push('/tournament_board');
      }, 2000);
    }
  };

  useEffect(() => {
    registerMessageHandler(handleMessage);
    sendMessage(JSON.stringify({ type: 'RANDOM_GAME' }));

    return () => {
      clearTimeout(timer);
      unregisterMessageHandler(handleMessage);
      sendMessage(JSON.stringify({ type: 'LEAVE_RANDOM_PAGE' }));
    };
  }, []);

  return (
    <div className="flex items-center justify-center p-4 mt-[10%]">
      <div className="split-background rounded-lg max-w-3xl w-full p-4 md:p-12">
        <div className="flex items-center justify-center mb-4">
          <img src={user_data?.avatar} alt="" className="w-16 h-16 md:w-24 md:h-24 lg:w-36 lg:h-36 rounded-full mr-2 bg-gray-700" />
          <span className="text-sm sm:text-xl md:text-2xl lg:text-5xl  font-bold">VS</span>
          {opponent ? (
            <img src={opponent?.avatar} alt="" className="w-16 h-16 md:w-24 md:h-24 lg:w-36 lg:h-36 rounded-full mx-2 bg-gray-700" />
          ) : (
            <Skeleton />
          )}
        </div>
        <h2 className="text-center text-sm sm:text-xl md:text-2xl lg:text-5xl gradient-text">Waiting for another player to join...</h2>
      </div>
      <style jsx>{`
        .split-background {
          background: linear-gradient(to right, #BD3B57 50%, #FFCE67 50%);
          // background: linear-gradient(135deg, #BD3B57 50%, #FFCE67 50%);
        }
        .gradient-text {
          background: linear-gradient(to right, #FFCE67 50%, #BD3B57 50%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>
      <Modal isOpen={modalOpen} description={msgDescription} title={modalMessage} action={() => setModalOpen(false)} />
    </div>
  );
};

export default WaitingPage;