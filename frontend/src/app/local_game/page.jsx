'use client';

import Link from 'next/link';
// import { useState } from 'react';
// import axios from 'axios';
import {useRouter} from 'next/navigation';
import { getData, postData } from '@/services/apiCalls';
// import Card from '@/components/local_tournament/Card';

// import Link from 'next/link';
// import { useState, useEffect } from 'react';
// import { apiTwoFactorAuthQrcode, apiDisableTwoFactorAuth, apiEnableTwoFactorAuth, apiTwoFactorAuthIsEnabled } from '@/services/twoFactorAuthApi';
// return {"img":img_base64, "type":"image/png", "encoding":"base64"}
// import Button from "@/components/twoFactorAuth/Button";
// import Form from "@/components/twoFactorAuth/Form";
// import Container from "@/components/twoFactorAuth/Container";
// import { useRouter } from 'next/navigation';
import { Si2Fas } from "react-icons/si";
// import { TbAuth2Fa } from "react-icons/tb";
// import { Modal } from "@components/modals/Modal";
import { Toaster, toast } from 'react-hot-toast';
import Image from 'next/image';
import { IoMdAddCircleOutline } from "react-icons/io";
import TopBar from "@/components/local_tournament/TopBar";



const ChoseGame = () => {
  const router = useRouter();

    const handleClick = async (e) => {
        e.preventDefault();
        try {

            // const response = await] getData('/game/play-regular/');
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
        <div className="relative bg-gray-900 w-full max-w-full min-h-max h-full gap-4 flex flex-col justify-center items-center mx-auto">
            <TopBar />
            {/* <img alt="tournament background" loading="lazy" width="1920" height="1080" decoding="async" dataNimg="1" className="w-full h-full object-cover object-center filter brightness-50" srcSet="/tournament/ping.png" style="color: transparent;"></img> */}
            {/* <img className='absolute top-0 left-0 w-full h-auto' src="/tournament/ping.png" alt="sss" /> */}
			{/* Hero Section with Background */}
			{/* <div className="absolute inset-0 h-full max-w-screen w-full overflow-hidden">
                <Image
                    src="/tournament/ping1.png"
                    alt="tournament background"
                    width={1920}
                    height={1080}
                    className="min-w-32 w-full h-full object-cover object-center filter brightness-150"
                />
				<div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900" />
			</div> */}

            <div className='relative flex flex-col justify-between gap-4 w-fit h-fit'>
                {/* <Card tournament={[]}></Card> */}
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

                {/* <GameCard title={"Play 1v1"} />
                <GameCard  title={"Tournament"} /> */}

            </div>
        </div>
    );
}



const GameCard = ({title}) => {

    return (
        <div className="bg-gray-800 rounded-2xl p-6 shadow-lg m-2">
            {/* <h2 className="text-xl font-semibold mb-6 flex items-center capitalize">
            Tournament
            </h2> */}
            {/* <img className='max-w-96 rounded-t-lg' src="/tournament/1.png" alt="sss" /> */}
            <div className="space-y-4">
                    <div key={0} className="flex flex-col gap-1 items-center p-3  transition-colors">
                        <div className="text-lg text-white pr-2 flex-1">
                            {title}
                        </div>
                        <button className={`w-full sm:w-96 bg-blue-400 hover:bg-blue-500 text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center`}>
                            play
                        </button>
                        {/* <button className={`w-full sm:w-96 bg-blue-400 hover:bg-blue-500 text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center`}>
                        <IoMdAddCircleOutline />{" "}Create
                        </button> */}
                    </div>
            </div>
        </div>
    );
}

export default ChoseGame;
