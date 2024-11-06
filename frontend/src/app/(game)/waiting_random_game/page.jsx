// src/components/WaitingPage.jsx
'use client';
import React from 'react';
import mysocket from '@/utils/WebSocketManager'; // Adjust the path as needed
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Use Next.js router
import { useAuth } from '@/components/auth/loginContext.jsx';
import { getData } from '@/services/apiCalls';
import { useWebSocketContext } from '@/components/websocket/websocketContext';
import {Modal} from '@/components/modals/Modal';

const Skeleton = () => <div className="animate-pulse bg-gray-600 rounded-full w-16 h-16 ml-2" />;

const WaitingPage = () => {
  const { setOpponent } = useWebSocketContext();
  const { profileData: user_data } = useAuth();
  const [myuser, setMyuser] = useState(null);
  const router = useRouter(); // Use Next.js router
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [msgDescription, setMsgDescription] = useState('');


  const handleMessage = async message => {
    const data = JSON.parse(message.data);

    if (data.status === 'start') {
      const opponent_id = data.opponent;

      // Fetch user data based on opponent ID
      console.log('The player id you will play with is ', opponent_id);
      try {
        const fetchedUser = await getData(`/userById/${opponent_id}`);

        if (fetchedUser.status === 200) {
          const opponent = fetchedUser.data;
          setMyuser(opponent); // Assuming data structure contains user data

          // Ensure fetchedUser.data is valid
          if (opponent) {
            const sentData = {
              username: String(opponent.username), // Assuming this is a string
              avatar: String(opponent.avatar), // Assuming this is a string
              side: String(data.side), // This should also be a string or number
            };

            setOpponent(opponent);
            localStorage.setItem(`opponent`, JSON.stringify(sentData));
            console.log(
              'You can start, this is the player you will play with ------> ',
              fetchedUser.data
            );

            const timer = setTimeout(() => {
              router.push('/game'); // This must be a flat object with only strings/numbersrouter.push('/dashboard', { scroll: false })}
            }, 1000); // 2000 milliseconds = 2 seconds
          } else {
            console.error('Fetched user data is invalid');
          }
        } else {
          console.error('Failed to fetch opponent data');
        }
      } catch (error) {
        console.error('Failed to fetch opponent data', error);
      }
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
    }
  };

  useEffect(() => {
    // Register message handler for WebSocket messages
    let timer;

    mysocket.registerMessageHandler(handleMessage);

    mysocket.sendMessage(
      JSON.stringify({
        type: 'RANDOM_GAME',
      })
    );

    return () => {
      clearTimeout(timer);
      mysocket.unregisterMessageHandler(handleMessage);
      mysocket.sendMessage(
        JSON.stringify({
          type: 'LEAVE_RANDOM_PAGE',
        })
      );
    };
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen  p-4">
      <div className="bg-gray-400 rounded-lg  max-w-md w-full p-6">
        <div className="flex items-center justify-center mb-4">
          <img
            src={user_data?.avatar}
            alt=""
            className="w-16 h-16 rounded-full mr-2  bg-gray-700"
          />
          <span className="text-2xl font-bold">VS</span>
          {(myuser && (
            <img src={myuser?.avatar} alt="" className="w-16 h-16 rounded-full mx-2 bg-gray-700" />
          )) || <Skeleton />}
        </div>
        <h2 className="text-center text-gray-600">Waiting for another player to join...</h2>
      </div>
      <Modal isOpen={modalOpen} description={msgDescription} title={modalMessage} action={() => setModalOpen(false)} />
    </div>
  );
};

export default WaitingPage;
