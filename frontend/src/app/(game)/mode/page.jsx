'use client';
import Selector from '@/app/(game)/mode/selecor';
import { RandomSvg, VsfriendSvg, VsbotSvg, ExitSvg } from '@components/modeSvgs/ModeSvgs.jsx';
import { useRouter } from 'next/navigation';


const Mode = () => {
  const router = useRouter();

  const handleRandomGame = () => {
    router.push('/waiting_random_game');
  };

  const friendsGame = () => {
    router.push('/list_of_friends');
  };

  const botGame = () => {
    router.push('/bot');
  };

  const goBack = () => {
    router.push('/create_join_tournament');
  }




  return (
    <div className="flex flex-col lg:flex-row w-fit mx-6 sm:m-auto md:max-w-[760px] lg:max-w-full mt-56 sm:mt-56 lg:gap-10">
      <div className="flex flex-col w-full mx-2">
        <Selector
          title="RANDOM GAME"
          description="Enjoy a game with unknown friends!"
          Svgvar={RandomSvg}
          onclick={handleRandomGame}
        ></Selector>
        <Selector
          title="PLAY VS FRIEND"
          description="Online ping pong game with good pal."
          Svgvar={VsfriendSvg}
          onclick={friendsGame}
        ></Selector>
      </div>
      <div className="flex flex-col w-full mx-2">
        <Selector 
          title="TOURNAMENT" 
          description="Join or host a great tournament today!"
          Svgvar={ExitSvg}
          onclick={goBack}
        ></Selector>
        <Selector
          title="PLAY VS BOT"
          description="Ready to test your skills against bot!"
          Svgvar={VsbotSvg}
          onclick={botGame}
        ></Selector>
      </div>
    </div>
  );
};

export default Mode;