'use client';

import Link from 'next/link';
import { useState } from 'react';
import axios from 'axios';
import {useRouter} from 'next/navigation';
import { getData, postData } from '@/services/apiCalls';


const ChoseGame = () => {
    const router = useRouter();

    const handleClick = async (e) => {
        e.preventDefault();
        try {

            // const response = await getData('/game/play-regular/');
            const response = await postData("/game/play-regular", {});

            console.log('=======>', response);
            // console.log(res);
            router.push('/l_game');
        }
        catch {
            console.log('===error====>');
            console.log('')
        }
    };

    return (
        <div className="w-full max-w-full h-full gap-4 flex flex-col justify-center items-center mx-auto ring">
            <div className='flex flex-col justify-between gap-4 w-fit h-fit'>
                <button
                    onClick={handleClick}
                    className='bg-white w-56 text-black px-4 py-2 rounded-full font-bold font-mono hover:opacity-90 active:ring active:ring-white/50 uppercase text-center'
                >
                    New Game
                </button>
                <Link
                    href={"/local_game/tournament"}
                    className='bg-white w-56 text-black px-4 py-2 rounded-full font-bold font-mono hover:opacity-90 active:ring active:ring-white/50 uppercase text-center'
                >
                    tournament
                </Link>
                <Link
                    href={"/tournament/create"}
                    className='bg-white w-56 text-black px-4 py-2 rounded-full font-bold font-mono hover:opacity-90 active:ring active:ring-white/50 uppercase text-center'
                >
                    create
                </Link>
            </div>
        </div>
    );
}

export default ChoseGame;