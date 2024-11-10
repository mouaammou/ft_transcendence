// src/components/WaitingFriendPage.jsx
'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/loginContext.jsx';
import mysocket from '@/utils/WebSocketManager';
import Modal from '@/components/modals/Modal';
import useNotificationContext from '@/components/navbar/useNotificationContext';
import '@/styles/game/waitingFriendPage.css';

const WaitingFriendPage = () => {
  const { profileData: user_data } = useAuth();
  const [myfriend, setMyfriend] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [msgDescription, setMsgDescription] = useState('');
  const router = useRouter();
  const { lastJsonMessage, NOTIFICATION_TYPES } = useNotificationContext();

  const handleMessage = async (message) => {
    const data = JSON.parse(message.data);

    if (data.status === 'start') {
      router.push('/game');
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
    } else if (data.status === 'friend_in_game' || data.status === 'friend_in_tournament') {
      setModalOpen(true);
      setModalMessage('Your Friend Participation Status');
      setMsgDescription('Your friend is currently participating in a game or tournament. Please check back later or encourage them to finish before joining another event. Thank you for your understanding!');
      setTimeout(() => {
        router.push('/play');
      }, 2000);
    }
  };

  useEffect(() => {
    mysocket.registerMessageHandler(handleMessage);

    const selectedFriend = localStorage.getItem('selectedFriend');
    if (selectedFriend) {
      setMyfriend(JSON.parse(selectedFriend));
    }

    return () => {
      mysocket.unregisterMessageHandler(handleMessage);
    };
  }, []);

  useEffect(() => {
    if (lastJsonMessage) {
      if (lastJsonMessage.type === NOTIFICATION_TYPES.ACCEPT_GAME) {
        localStorage.setItem('opponent', JSON.stringify(myfriend));
        mysocket.sendMessage(JSON.stringify({
          type: 'FRIEND_GAME_REQUEST',
          player_1_id: user_data?.id,
          player_2_id: myfriend?.id,
        }));
        router.push('/game');
        localStorage.removeItem('selectedFriend');
      } else if (lastJsonMessage.type === NOTIFICATION_TYPES.REJECT_GAME) {
        router.push('/list_of_friends');
      }
    }
  }, [lastJsonMessage]);

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="bg-gray-400 bg-opacity-50 rounded-lg max-w-md w-full p-6">
        <h1 className="text-lg md:text-2xl text-center font-balsamiq mb-12">
          Waiting for {myfriend?.username} to join
        </h1>
        <div className="flex flex-col md:flex-row items-center gap-1 justify-center mb-4">
          <img src={user_data?.avatar} alt="" className="w-[80] h-[80] rounded-full bg-gray-700" />
          <span className="text-lg md:text-2xl font-balsamiq mx-14">VS</span>
          <div className="relative loader">
            <img src={myfriend?.avatar} alt="" className="w-[80] h-[80] rounded-full bg-gray-700" />
          </div>
        </div>
      </div>
      <Modal isOpen={modalOpen} title={modalMessage} description={msgDescription} action={() => setModalOpen(false)} />
    </div>
  );
};

export default WaitingFriendPage;