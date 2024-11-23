"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";


const ChooseMode = () => {

    const router = useRouter();

    const redirectToLocal = () => {
        router.push('/local_c4')
    }
    const redirectToRemote = () => {
        router.push('/waiting_random_c4')
    }

    return (
        <div className="flex justify-center gap-16 flex-wrap">
            <div
                className="relative group z-20 flex gap-6 flex-col items-center   rounded-md p-3 
                cursor-pointer bg-[#BD3B57] hover:translate-x-[10px] hover:translate-y-[10px] transition-all duration-300 ease-in-out"
                onClick={redirectToRemote}
            >
                {/* Shadow element that appears on hover */}
                <div className="absolute -z-10 left-0 top-0 w-full h-full bg-[#BD3B57]   rounded-md opacity-0 
                        group-hover:opacity-50 transition-opacity duration-300 translate-x-[-10px] translate-y-[-10px]"></div>

                <img className="max-w-[200px] md:max-w-[300px] rounded-md" src="remote_cr.jpeg" alt="" />
                <p className="font-mono text-3xl align-middle font-bold mb-5">Remote game</p>
                <p className="hidden md:block max-w-72 text-sm font-sans">
                    Remote Connect Four allows users to challenge friends or match with random
                    players online in real-time. Players can join a game from anywhere, competing
                    against each other on a virtual board. Eabling players to review their past games, learn from their strategies,
                    and celebrate victories. Get ready to connect four and rise through the ranks!
                </p>
            </div>
            <div className="relative group flex gap-6 flex-col items-center rounded-md p-3  cursor-pointer
              bg-[#FFCE67] text-black hover:translate-x-[10px] hover:translate-y-[10px] transition-all duration-300  ease-in-out"
                onClick={redirectToLocal}
            >
                <div className="absolute w-full h-full left-0 top-0 rounded-md bg-[#FFCE67] opacity-0 
                group-hover:opacity-50 translate-x-[-10px] duration-300 translate-y-[-10px] -z-10"></div>
                <img className="max-w-[200px] md:max-w-[300px] rounded-md " src="local_c4.png" alt="" />
                <p className="font-mono text-3xl align-middle font-bold  mb-5">Local game</p>
                <p className="hidden md:block max-w-72 text-sm font-sans">
                    Local Connect Four offers a fun and interactive way for two players to enjoy
                    the classic game together on the same device. Ideal for playing with friends or f
                    amily, this mode allows both players to take turns using the same mouse to drop
                    colored discs into the grid. The game is designed to facilitate friendly competition
                    and quick matches. Enjoy the excitement of
                    connecting four with a real-life opponent right beside you!</p>
            </div>
        </div>
    )

}


export default ChooseMode;