'use client';
import React from 'react';
import Board from './board';
import Image from 'next/image';
import mysocket from '@/utils/WebSocketManager';
import { useEffect } from 'react';

export default function TournamentBoardPage() {
  const img = '/user1.svg';
  const mouad = '/mouad.jpeg';

  useEffect(() => {
    mysocket.sendMessage(
      JSON.stringify({
        type: 'GET_PLAYERS',
      })
    );
    const handleMessage = message => {
      const data = JSON.parse(message.data);
      console.log(data);
      if (data.status === 'players') {
        console.log("bla bla bla bla");
        console.log(data.data);
      }
    };
    mysocket.registerMessageHandler(handleMessage);

    return () => {
      mysocket.unregisterMessageHandler(handleMessage);
    };
  });

  return (
    <>
      <div className="flex justify-center  p-4 lg:p-12 ">
        <Board imageUrl8={mouad} />
        <Image className="hidden md:block" width={109} height={92} src="/trofi.svg" alt="asf" />
      </div>
    </>
  );
}
