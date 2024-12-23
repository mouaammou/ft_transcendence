"use client";
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { LoadingComponent } from '@/components/multipleStepLoader/MultipleStepLoader';

const PlayMode = () => {
  const router = useRouter();

  const handlePlayFour = useCallback(() => {
    router.push('/connect_four_mode');
  }, [router]);

  const handlePlayOnlineGame = useCallback(() => {
    router.push('/mode');
  }, [router]);

  const handlePlayLocalClick = useCallback((e) => {
    e.preventDefault();
    router.push('/l_game');
  }, [router]);

 


  return (
    <div className="flex w-full mt-24 lg:mt-56 relative">
      <div className="flex flex-col w-[90%] xl:w-[80%] m-auto gap-12 xl:gap-24 sm:px-6 py-16 
        border-gray-700/50 shadow-lg rounded-lg bg-gray-800/40 backdrop-blur-sm">
        <div className="font-balsamiq align-middle text-center text-2xl sm:text-3xl md:text-4xl font-bold xl:text-5xl">
          PLAY PONG WITH OTHERS
        </div>
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-3 xl:gap-0">
          <button 
            className="w-[80%] xl:w-[100%] relative m-auto sm:max-w-[400px] lg:max-w-[500px] bg-transparent border-none" 
            onClick={handlePlayOnlineGame}
          >
            <Image 
              className="w-[70%] sm:w-[80%] m-auto cursor-pointer" 
              src="/mode1.svg" 
              alt="remote-game" 
              width={400} 
              height={400} 
              priority 
            />
            <p className='cursor-pointer font-balsamiq font-bold absolute w-full text-center bottom-[10%] sm:text-xl md:text-2xl 2xl:text-4xl'>
              REMOTE GAME
            </p>
          </button>

          <button 
            className="w-[80%] xl:w-[100%] relative m-auto sm:max-w-[400px] lg:max-w-[500px] bg-transparent border-none" 
            onClick={handlePlayLocalClick}
          >
            <Image 
              className="w-[70%] sm:w-[80%] m-auto cursor-pointer" 
              src="/mode2.svg" 
              alt="local-game" 
              width={400} 
              height={400} 
              priority 
            />
            <p className='cursor-pointer font-balsamiq font-bold absolute w-full text-center bottom-[10%] sm:text-xl md:text-2xl 2xl:text-4xl'>
              LOCAL GAME
            </p>
          </button>

          <button 
            className="w-[80%] xl:w-[100%] relative m-auto sm:max-w-[400px] lg:max-w-[500px] bg-transparent border-none" 
            onClick={handlePlayFour}
          >
            <Image 
              className="w-[70%] sm:w-[80%] m-auto cursor-pointer rounded-3xl brightness-70" 
              src="/1111.svg" 
              alt="connect4-game" 
              width={400} 
              height={400} 
              priority 
            />
            <p className='cursor-pointer font-balsamiq font-bold absolute w-full text-center bottom-[10%] sm:text-xl md:text-2xl 2xl:text-4xl'>
              CONNECT FOUR
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayMode;