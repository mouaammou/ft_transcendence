// src/components/WaitingPage.jsx
'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/loginContext.jsx';
import { getData } from '@/services/apiCalls';
import { Modal } from '@/components/modals/Modal';

import { useConnectFourWebSocket } from '@/utils/FourGameWebSocketManager';


const Skeleton = () => <div className="animate-pulse bg-gray-600 rounded-full w-12 h-12 md:w-20 md:h-20 lg:w-24 lg:h-24 ml-2" />;

const WaitingPage = () => {
  const { sendMessage, isConnected, lastMessage } = useConnectFourWebSocket();
  const { profileData: user_data } = useAuth();
  const [opponent, setOpponent] = useState(null);
  const router = useRouter();
  let timer = null;
  useEffect(() => {
    if (lastMessage !== null) {
      const data = JSON.parse(lastMessage.data);
      console.log("data from waiting page ", data);
      if (data.type === 'redirect_to_game_page') {
        const opponent_id = data.opponent;
        const fetchOpponentData = async () => {
          try {
            const fetchedUser = await getData(`/userById/${opponent_id}`);
            if (fetchedUser.status === 200) {
              setOpponent(fetchedUser.data);
              timer = setTimeout(() => {
                router.push('/connect_four');
              }, 1500);
            } else {
              console.error('Fetched user data is invalid');
            }
          } catch (error) {
            console.error('Failed to fetch opponent data', error);
          }
        };
        fetchOpponentData();
      }
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [lastMessage]);

  useEffect(() => {
    if (isConnected)
      sendMessage(JSON.stringify({ type: 'PLAY_RANDOM' }));

    return (() => {
      if (isConnected)
        sendMessage(JSON.stringify({ type: 'LEAVE_PLAY_RANDOM' }));
    });
  }, []);

  return (
    <div className="flex items-center justify-center p-4 mt-24">
      <div className="split-background rounded-2xl max-w-3xl w-fit p-4 md:p-12">
        <div className="flex items-center justify-center mb-4">
          <img src={user_data?.avatar} alt="" className="w-12 h-12 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full mr-2 bg-gray-700" />
          <span className="text-sm sm:text-xl md:text-2xl lg:text-3xl  font-bold">VS</span>
          {opponent ? (
            <img src={opponent?.avatar} alt="" className="w-12 h-12 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full mx-2 bg-gray-700" />
          ) : (
            <Skeleton />
          )}
        </div>
        <h2 className="text-center text-sm sm:text-xl md:text-2xl lg:text-3xl gradient-text">Waiting for another player to join...</h2>
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
    </div>
  );
};

export default WaitingPage;