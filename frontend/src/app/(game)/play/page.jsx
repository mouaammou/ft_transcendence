'use client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCallback, useMemo } from 'react';

const PlayMode = () => {
  const router = useRouter();

  const handlePlayFour = useCallback (() => {
    router.push('/connect_four_mode');
  }, [router]);

  const handlePlayOnlineGame = useCallback(() => {
    router.push('/mode');
  }, [router]);

  const handlePlayLocalClick = useCallback((e) => {
    e.preventDefault();
    router.push('/l_game');
  }, [router]);


  const content = useMemo(() => (
    <div className="flex w-full mt-24 lg:mt-56 ">
      <div className="flex flex-col w-[90%] xl:w-[80%] m-auto gap-12 xl:gap-24 sm:px-6 py-16 
        border-gray-700/50 shadow-lg rounded-lg  bg-gray-800/40 backdrop-blur-sm">
        <div className="font-balsamiq align-middle text-center text-2xl sm:text-3xl md:text-4xl font-bold xl:text-5xl">PLAY PONG WITH OTHERS</div>
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-3 xl:gap-0">
          <div className="w-[80%] xl:w-[100%] relative m-auto sm:max-w-[400px] lg:max-w-[500px]" onClick={handlePlayOnlineGame}>
            <Image className="w-[90%] sm:w-[80%] m-auto cursor-pointer" src="/mode1.svg" alt="remote-game" width={500} height={500} priority/>
            <p className='cursor-pointer font-balsamiq font-bold absolute w-full text-center bottom-[10%] sm:text-xl md:text-2xl 2xl:text-4xl'>REMOTE GAME</p>
          </div>
          <div className="w-[80%] xl:w-[100%] relative m-auto sm:max-w-[400px] lg:max-w-[500px]" onClick={handlePlayLocalClick}>
            <Image className="w-[90%] sm:w-[80%] m-auto cursor-pointer" src="/mode2.svg" alt="local-game" width={500} height={500} priority/>
            <p className='cursor-pointer font-balsamiq font-bold absolute w-full text-center bottom-[10%] sm:text-xl md:text-2xl 2xl:text-4xl'>LOCAL GAME</p>
          </div>
          <div className="w-[80%] xl:w-[100%] relative m-auto sm:max-w-[400px] lg:max-w-[500px]" onClick={handlePlayFour}>
            <Image className="w-[90%] sm:w-[80%] m-auto cursor-pointer rounded-3xl brightness-70"  src="/1111.svg" alt="connect4-game" width={500} height={500} priority/>
            <p className='cursor-pointer font-balsamiq font-bold absolute w-full text-center bottom-[10%] sm:text-xl md:text-2xl 2xl:text-4xl'>CONNECT FOUR</p>
          </div>
        </div>
      </div>
    </div>
  ), [handlePlayFour, handlePlayOnlineGame, handlePlayLocalClick]);

  return content;
};

export default PlayMode;