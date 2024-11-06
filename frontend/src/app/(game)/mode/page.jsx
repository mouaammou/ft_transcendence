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
    router.push('/play');
  }




  return (
    <div className="flex flex-col lg:flex-row w-fit mx-6 sm:m-auto mt-56 sm:mt-56 lg:gap-10">
      <div className="flex flex-col w-fit mx-2 ">
        <Selector
          title="RANDOM GAME"
          description="Have fun playing exciting online with friends!"
          Svgvar={RandomSvg}
          onclick={handleRandomGame}
        ></Selector>
        <Selector
          title="PLAY VS FRIEND"
          description="Online ping pong game with a friend!"
          Svgvar={VsfriendSvg}
          onclick={friendsGame}
        ></Selector>
      </div>
      <div className="flex flex-col w-fit mx-2">
        <Selector
          title="PLAY VS BOT"
          description="Challenge a bot in a thrilling ping pong game!"
          Svgvar={VsbotSvg}
          onclick={botGame}
        ></Selector>
        <Selector 
          title="GO BACK" 
          description={<br></br>}
          Svgvar={ExitSvg}
          onclick={goBack}
          ></Selector>
      </div>
    </div>
  );
};

export default Mode;
