"use client";

import Link from 'next/link';
import { IoMdAdd } from "react-icons/io";
import { IoMdAddCircleOutline } from "react-icons/io";

import { IoList } from "react-icons/io5";
import { FaListUl } from "react-icons/fa";

import { TbDeviceGamepad3 } from "react-icons/tb";


const TopBar = ({activeIndex=0}) => {

    return (
        <div className="flex max-md:flex-col justify-center w-full h-fit gap-x-4 bg-white/10 text-white/75 border-t">
            <Link
                href={"/l_game"}
                className={`flex items-center justify-center ${activeIndex === 0?"text-blue-400":""} hover:text-blue-400 text-sm w-full sm:w-56 px-4 py-2  font-bold font-mono hover:opacity-90 uppercase text-center`}
            >
                 <TbDeviceGamepad3 className='h-6 w-auto pr-1' />

                 Game
            </Link>
            <Link
                href={"/local_game/tournament"}
                className={`flex items-center justify-center ${activeIndex === 1?"text-blue-400":""} hover:text-blue-400 text-sm w-full sm:w-56 px-4 py-2 font-bold font-mono hover:opacity-90 uppercase text-center`}
            >
                <IoList className='h-6 w-auto pr-1' />
                tournament
            </Link>
           
        </div>
    );
}


export default TopBar;