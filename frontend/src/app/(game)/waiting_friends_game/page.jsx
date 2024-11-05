// src/components/WaitingFriendPage.jsx
'use client';
import React from 'react';
import mysocket from '@/utils/WebSocketManager'; // Adjust the path as needed
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Use Next.js router
import { useAuth } from '@/components/auth/loginContext.jsx';
import { getData } from '@/services/apiCalls';
import { useWebSocketContext } from '@/components/websocket/websocketContext';
import '@/styles/game/waitingFriendPage.css';
import Modal from '@/components/modals/Modal';

const WaitingFriendPage = () => {
  const { profileData: user_data } = useAuth();
  const [myfriend, setMyfriend] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [msgDescription, setMsgDescription] = useState('');

  const router = useRouter(); // Use Next.js router
  const { websocket, invitationResponse, setInvitationResponse, setOpponent } =
    useWebSocketContext();

  const handleMessage = async message => {
    const data = JSON.parse(message.data);

    if (data.status === 'start') {
      // Redirect to the game page
      router.push('/game');
    } else if (data.status === 'already_in_game') {
      setModalOpen(true);
      setModalMessage('You Are already In Game');
      setMsgDescription(
        'You are currently participating in a game. Please complete your \
                        ongoing game before joining a new one. Thank you for your engagement!'
      );
      setTimeout(() => {
        router.push('/game');
      }, 2000);
      console.log('pushed to game');
      console.log('pushed to game');
    } else if (data.status === 'already_in_tournament') {
      setModalOpen(true);
      setModalMessage('You Are Already In Tournament');
      setMsgDescription('You are currently registered in a tournament.\
       Please complete or leave your ongoing participation before entering a new tournament. Thank you for being part of the event!'
      );
      setTimeout(() => {
        router.push('/tournament_board');
      }, 2000);
      console.log('pushed to tournament board');
      console.log('pushed to tournament board');
    } else if (data.status === 'friend_in_game' || data.status === 'friend_in_tournament') {
      setModalOpen(true);
      setModalMessage('Your Friend Participation Status');
      setMsgDescription('Your friend is currently participating in a game or tournament. Please check back later or \
      encourage them to finish before joining another event. Thank you for your understanding!'
      );
      setTimeout(() => {
        router.push('/play');
      }, 2000);
      console.log('choose another game');
    }
  };

  useEffect(() => {
    // Register message handler for WebSocket messages
    let timer;
    mysocket.registerMessageHandler(handleMessage);

    let selecFriend = localStorage.getItem('selectedFriend');
    console.log('my selected friend is  : ', selecFriend);
    if (selecFriend) {
      selecFriend = JSON.parse(selecFriend);
      setMyfriend(selecFriend);
    } else {
      // router.push('/friends');
    }
    return () => {
      mysocket.unregisterMessageHandler(handleMessage);
    };
  }, []);

  useEffect(() => {
    // console.log('333333333333333######     invitationResponse', invitationResponse);
    if (invitationResponse) {
      if (invitationResponse === 'acceptGame') {
        console.log('invitation accepted');
        setOpponent(myfriend);
        localStorage.setItem('opponent', JSON.stringify(myfriend));
        setInvitationResponse(null);
        console.log('user_data ---> ', user_data);
        console.log('myfriend ---> ', myfriend);
        mysocket.sendMessage(
          JSON.stringify({
            type: 'FRIEND_GAME_REQUEST',
            player_1_id: user_data?.id,
            player_2_id: myfriend?.id,
          })
        );
        router.push('/game');
      } else if (invitationResponse === 'rejectGame') {
        console.log('invitation rejected');
        router.push('/list_of_friends');
        setInvitationResponse(null);
      }
    }
  }, [invitationResponse]);

  // const sent = mysocket.sendMessage(JSON.stringify());
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className=" bg-gray-400 bg-opacity-50 rounded-lg max-w-md w-full p-6">
        <h1 className="text-lg  md:text-2xl text-center font-balsamiq mb-12">
          Waiting for {myfriend?.username} to join
        </h1>
        <div className="flex flex-col md:flex-row items-center gap-1 justify-center mb-4">
          <img src={user_data?.avatar} alt="" className="w-[80] h-[80] rounded-full  bg-gray-700" />
          <span className="text-lg md:text-2xl font-balsamiq mx-14 ">VS</span>
          <div className="relative loader">
            <img
              src={myfriend?.avatar}
              alt=""
              className="w-[80] h-[80] rounded-full bg-gray-700 "
            />
          </div>
        </div>
      </div>
      <Modal isOpen={modalOpen} title={modalMessage} description={msgDescription} action={() => setModalOpen(false)} />
    </div>
  );
  // the second image pulsing effect is not working
  /* HTML: <div class="loader"></div> */
};

export default WaitingFriendPage;
