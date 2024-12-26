'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/loginContext.jsx';
import { useGlobalWebSocket } from '@/utils/WebSocketManager';
import Modal from '@/components/modals/Modal';
import useNotificationContext from '@/components/navbar/useNotificationContext';
import '@/styles/game/waitingFriendPage.css';

// Move game status messages to a separate constants file
const GAME_MESSAGES = {
  ALREADY_IN_GAME: {
    title: 'You Are Already In Game',
    description: 'You are currently participating in a game. Please complete your ongoing game before joining a new one. Thank you for your engagement!',
    redirect: '/game'
  },
  ALREADY_IN_TOURNAMENT: {
    title: 'You Are Already In Tournament',
    description: 'You are currently registered in a tournament. Please complete or leave your ongoing participation before entering a new tournament. Thank you for being part of the event!',
    redirect: '/tournament_board'
  },
  FRIEND_BUSY: {
    title: 'Your Friend Participation Status',
    description: 'Your friend is currently participating in a game or tournament. Please check back later or encourage them to finish before joining another event. Thank you for your understanding!',
    redirect: '/play'
  }
};

const WaitingFriendPage = () => {
  const { profileData: userData, selectedUser } = useAuth();
  const [myFriend, setMyFriend] = useState(null);
  const [modalState, setModalState] = useState({
    isOpen: false,
    message: '',
    description: ''
  });
  const router = useRouter();
  const { lastJsonMessage, NOTIFICATION_TYPES } = useNotificationContext();
  const { sendMessage, lastMessage } = useGlobalWebSocket();

  const handleModalClose = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const showModal = useCallback((title, description, redirectPath) => {
    setModalState({
      isOpen: true,
      message: title,
      description
    });
    if (redirectPath) {
      setTimeout(() => {
        router.push(redirectPath);
      }, 2000);
    }
  }, [router]);

  const handleGameMessage = useCallback((data) => {
    switch (data.status) {
      case 'start':
        router.push('/game');
        break;
      case 'already_in_game':
        showModal(
          GAME_MESSAGES.ALREADY_IN_GAME.title,
          GAME_MESSAGES.ALREADY_IN_GAME.description,
          GAME_MESSAGES.ALREADY_IN_GAME.redirect
        );
        break;
      case 'already_in_tournament':
      case 'you_in_tournament':
        showModal(
          GAME_MESSAGES.ALREADY_IN_TOURNAMENT.title,
          GAME_MESSAGES.ALREADY_IN_TOURNAMENT.description,
          GAME_MESSAGES.ALREADY_IN_TOURNAMENT.redirect
        );
        break;
      case 'friend_in_game':
      case 'friend_in_tournament':
        showModal(
          GAME_MESSAGES.FRIEND_BUSY.title,
          GAME_MESSAGES.FRIEND_BUSY.description,
          GAME_MESSAGES.FRIEND_BUSY.redirect
        );
        break;
      default:
        break;
    }
  }, [router, showModal]);

  useEffect(() => {
    if (!lastMessage) return;
    try {
      const data = JSON.parse(lastMessage.data);
      handleGameMessage(data);
    } catch (error) {
      console.log('Error parsing message:', error);
    }
  }, [lastMessage, handleGameMessage]);

  useEffect(() => {
      try {
        setMyFriend(selectedUser);
      } catch (error) {
        console.log('Error parsing selected friend:', error);
      }
  }, []);

  useEffect(() => {
    if (!lastJsonMessage) return;

    if (lastJsonMessage.type === NOTIFICATION_TYPES.ACCEPT_GAME) {
      sendMessage(JSON.stringify({
        type: 'FRIEND_GAME_REQUEST',
        player_1_id: userData?.id,
        player_2_id: myFriend?.id,
      }));
      lastJsonMessage.type = null;
      router.push('/game');
    } else if (lastJsonMessage.type === NOTIFICATION_TYPES.REJECT_GAME) {
      router.push('/list_of_friends');
    }
  }, [lastJsonMessage]);

  if (!userData || !myFriend) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="bg-gray-400 bg-opacity-50 rounded-2xl max-w-md w-full p-6">
        <h1 className="text-lg md:text-2xl text-center font-balsamiq mb-12">
          Waiting for {myFriend.username} to join
        </h1>
        <div className="flex flex-col md:flex-row items-center gap-1 justify-center mb-4">
          <img 
            src={userData.avatar} 
            alt={`${userData.username}'s avatar`} 
            className="w-20 h-20 rounded-full bg-gray-700"
          />
          <span className="text-lg md:text-2xl font-balsamiq mx-14">VS</span>
          <div className="relative loader">
            <img 
              src={myFriend.avatar} 
              alt={`${myFriend.username}'s avatar`}
              className="w-20 h-20 rounded-full bg-gray-700"
            />
          </div>
        </div>
      </div>
      <Modal
        isOpen={modalState.isOpen}
        title={modalState.message}
        description={modalState.description}
        action={handleModalClose}
      />
    </div>
  );
};

export default WaitingFriendPage;