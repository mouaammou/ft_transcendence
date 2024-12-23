"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useConnectFourWebSocket } from '@/utils/FourGameWebSocketManager';



const ChooseMode = () => {
    const { sendMessage, isConnected, lastMessage } = useConnectFourWebSocket();
    const {retryCount, setRetryCount} = useState(0);
    const maxRetries = 5;
    const retryInterval = 1000;

    useEffect(() => {
        // const sendGetRoomsMessage = () => {
        //     if (isConnected) {
                sendMessage(JSON.stringify({ type: "GET_ROOMS" }));
        //     } else if (retryCount < maxRetries) {
        //         setRetryCount(retryCount + 1);
        //         setTimeout(sendGetRoomsMessage, retryInterval);
        //     } else {
        //         console.log("not send GET_ROOMS message after maximum retries");
        //     }
        // };

        // sendGetRoomsMessage();
    }, []);

    const router = useRouter();


    const redirectToLocal = () => {
        router.push('/local_c4')
    }
    const redirectToRemote = () => {
        router.push('/waiting_random_c4')
    }

    return (
        <div className="flex justify-center gap-16 flex-wrap items-center mt-20 ">
            <div
                className="relative group z-20 flex gap-6 flex-col items-center   rounded-xl p-3 
                cursor-pointer bg-[#BD3B57] hover:translate-x-[10px] hover:translate-y-[10px] transition-all duration-300 ease-in-out"
                onClick={redirectToRemote}>

                <div className="absolute -z-10 left-0 top-0 w-full h-full bg-[#BD3B57]   rounded-xl opacity-0 
                        group-hover:opacity-50 transition-opacity duration-300 translate-x-[-10px] translate-y-[-10px]"></div>

                <img className="max-w-[200px] md:max-w-[300px] rounded-xl" src="remote_cr.jpeg" alt="" />
                <p className="font-mono text-3xl align-middle font-bold mb-5">Remote game</p>
                <p className="hidden md:block max-w-72 text-sm font-sans">
                    Remote Connect Four allows users to challenge friends or match with random players online in real-time. Players can join a game from anywhere, competing against each other on a
                    virtual board. This mode enables players to review past games, learn from strategies, and celebrate victories. Get ready to connect four and rise through the ranks!
                </p>
            </div>
            <div className="relative group flex gap-6 flex-col items-center rounded-xl p-3  cursor-pointer
              bg-[#FFCE67] text-black hover:translate-x-[10px] hover:translate-y-[10px] transition-all duration-300  ease-in-out"
                onClick={redirectToLocal}
            >
                <div className="absolute w-full h-full left-0 top-0 rounded-xl bg-[#FFCE67] opacity-0 
                group-hover:opacity-50 translate-x-[-10px] duration-300 translate-y-[-10px] -z-10"></div>
                <img className="max-w-[200px] md:max-w-[300px] rounded-xl " src="local_c4.png" alt="" />
                <p className="font-mono text-3xl align-middle font-bold  mb-5">Local game</p>
                <p className="hidden md:block max-w-72 text-sm font-sans">
                    Local Connect Four offers a fun and interactive way for two players to enjoy the classic game together on the same device. Ideal for playing with friends or family, this mode allows both players to take
                    turns using the same mouse to drop colored discs into the grid. It facilitates friendly competition and quick matches, ensuring excitement as you connect four with a real-life opponent!</p>
            </div>
        </div>
    )

}


export default ChooseMode;