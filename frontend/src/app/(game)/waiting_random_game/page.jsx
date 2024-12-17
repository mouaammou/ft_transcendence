// src/components/WaitingPage.jsx
'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/loginContext.jsx';
import { getData } from '@/services/apiCalls';
import { Modal } from '@/components/modals/Modal';

import { useGlobalWebSocket } from '@/utils/WebSocketManager';


const Skeleton = () => <div className="animate-pulse bg-gray-600 rounded-full w-16 h-16 ml-2" />;

const WaitingPage = () => {
  const { sendMessage, isConnected, lastMessage } = useGlobalWebSocket();
  const { profileData: user_data } = useAuth();
  const [opponent, setOpponent] = useState(null);
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [msgDescription, setMsgDescription] = useState('');
  let timer;

  const fetchOpponentData = async (opponent_id) => {
    try {
      const fetchedUser = await getData(`/userById/${opponent_id}`);
      if (fetchedUser.status === 200) {
        setOpponent(fetchedUser.data);
        timer = setTimeout(() => {
          router.push('/game');
        }, 1000);
      } else {
        console.log('Fetched user data is invalid');
      }
    } catch (error) {
      console.log('Failed to fetch opponent data', error);
    }
  };

  useEffect(() => {
    if (lastMessage !== null) {
      const data = JSON.parse(lastMessage.data);

      if (data.status === 'start') {
        const opponent_id = data.opponent;
        fetchOpponentData(opponent_id);
      } else if (data.status === 'already_in_game') {
        setModalOpen(true);
        setModalMessage('You Are already In Game');
        setMsgDescription('You are currently participating in a game.\
         Please complete your ongoing game before joining a new one. Thank you for your engagement!');
        setTimeout(() => {
          router.push('/game');
        }, 2000);
      } else if (data.status === 'already_in_tournament') {
        setModalOpen(true);
        setModalMessage('You Are Already In Tournament');
        setMsgDescription('You are currently registered in a tournament. Please complete or leave your\
         ongoing participation before entering a new tournament. Thank you for being part of the event!');
        setTimeout(() => {
          router.push('/tournament_board');
        }, 2000);
      }

    }
  }, [lastMessage]);


  useEffect(() => {
    if (isConnected)
      sendMessage(JSON.stringify({ type: 'RANDOM_GAME' }));

    return (() => {
      clearTimeout(timer);
      if (isConnected)
        sendMessage(JSON.stringify({ type: 'LEAVE_RANDOM_PAGE' }));
    });
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="bg-gray-400 rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-center mb-4">
          <img src={user_data?.avatar} alt="" className="w-16 h-16 rounded-full mr-2 bg-gray-700" />
          <span className="text-2xl font-bold">VS</span>
          {opponent ? (
            <img src={opponent?.avatar} alt="" className="w-16 h-16 rounded-full mx-2 bg-gray-700" />
          ) : (
            <Skeleton />
          )}
        </div>
        <h2 className="text-center text-gray-600">Waiting for another player to join...</h2>
      </div>
      <Modal
        isOpen={modalOpen}
        description={msgDescription}
        title={modalMessage}
        action={() => setModalOpen(false)}
      />
    </div>
  );
};

export default WaitingPage;