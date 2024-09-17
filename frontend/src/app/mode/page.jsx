"use client";
import Selector from "@app/mode/selecor"
import {RandomSvg, VsfriendSvg, VsbotSvg, ExitSvg} from "@components/modeSvgs/ModeSvgs.jsx"
import socket from "@/utils/WebSocketManager"
import { useRouter } from 'next/navigation'

const Mode = () => {
    const router = useRouter();

    const handleClick = () => {
        const randomGame = {
            "remote" : {
                        mode : 'random'
                }
            }
            socket.sendMessage(JSON.stringify(randomGame))
            router.push('waiting')
    }

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
                    Svgvar={VsbotSvg} >

                </Selector>
                <Selector title='GO BACK' description={<br></br>} 
                    Svgvar={ExitSvg} >
                </Selector>
            </div>
        </div>
    );
};

export default Mode;