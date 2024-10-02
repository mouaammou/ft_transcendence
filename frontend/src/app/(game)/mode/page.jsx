"use client";
import Selector from "@/app/(game)/mode/selecor"
import {RandomSvg, VsfriendSvg, VsbotSvg, ExitSvg} from "@components/modeSvgs/ModeSvgs.jsx"
import { useRouter } from 'next/navigation'

const Mode = () => {
    const router = useRouter();

    const handleClick = () => {
        router.push('waiting_random_game');
    }

    const friendsGame = () => {
        router.push('waiting_friends_game');
    }
    
    const botGame = () => {
        router.push('/bot')
    }
    // socket.registerMessageHandler(redirect_to_game);
    // const redirect_to_game = (message) => {
    //     if (!message) {
    //         console.error('Received an undefined message or data2:', message);
    //         return; // Exit early if message is invalid
    //     }
    //     data = JSON.parse(message.data);
    //     if (data.start)
    //         router.push('game');
    // }
    return (
        <div className="flex flex-col lg:flex-row w-fit mx-6 sm:m-auto mt-56 sm:mt-56 lg:gap-10">
            <div className="flex flex-col w-fit mx-2 ">
                <Selector title='RANDOM GAME' description='Have fun playing exciting online with friends!'
                    Svgvar={RandomSvg} 
                    onclick={handleClick} >
                </Selector>
                <Selector title='PLAY VS FRIEND' description='Online ping pong game with a friend!' 
                    Svgvar={VsfriendSvg}
                    onclick={friendsGame} >
                </Selector>
            </div>
            <div className="flex flex-col w-fit mx-2">
                <Selector title='PLAY VS BOT' description='Challenge a bot in a thrilling ping pong game!' 
                    Svgvar={VsbotSvg}
                    onclick={botGame} >
                </Selector>
                <Selector title='GO BACK' description={<br></br>} 
                    Svgvar={ExitSvg} >
                </Selector>
            </div>
        </div>
    );
};


export default Mode;