"use client";
import Selector from "@app/mode/selecor"
import {RandomSvg, VsfriendSvg, VsbotSvg, ExitSvg} from "@components/modeSvgs/ModeSvgs.jsx"
import { useRouter } from 'next/navigation'

const Mode = () => {
    const router = useRouter();

    const handleClick = () => {
            router.push('waiting')
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
        <div className="flex flex-col lg:flex-row items-center justify-center mt-52">
            <div className="flex flex-col">
                <Selector title='RANDOM GAME' description='Have fun playing exciting online with friends!'
                    Svgvar={RandomSvg} 
                    onclick={handleClick} >

                </Selector>
                <Selector title='PLAY VS FRIEND' description='Online ping pong game with a friend!' 
                    Svgvar={VsfriendSvg} >

                </Selector>
            </div>
            <div className="flex flex-col">
                <Selector title='PLAY VS BOT' description='Challenge a bot in an exciting ping pong game' 
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