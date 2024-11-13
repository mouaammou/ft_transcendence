import Link from 'next/link';
import { useState } from 'react';
import SearchProfileComponent from '@/components/navbar/search';

const Links = () => {
  const [isOpenUsers, setIsOpenUsers] = useState(false);
  const [isOpenGame, setIsOpenGame] = useState(false);
  return (
    <>
      <div className="flex justify-center gap-x-5 items-center text-[1.1rem] ">
        {/* <Link href='/chat' className="text-white hover:text-gray-300 transition duration-300 px-4 py-2">Chat</Link> */}
        {/* drop down menu for Users and game & tournament */}
        {/* <div className="relative">
					<button
					onClick={() => setIsOpenGame(!isOpenGame)}
					className="text-white hover:bg-black transition-all rounded-lg px-5 py-2.5 text-center inline-flex items-center"
					type="button"
					>
						<span className='text-[1rem]'>Game
							<svg
								className="w-2.5 h-2.5 ms-3 inline"
								aria-hidden="true"
								fill="none"
								viewBox="0 0 10 6"
							>
								<path
								stroke="currentColor"
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="m1 1 4 4 4-4"
								/>
							</svg>
						</span>
					</button>

					{isOpenGame && (
						<div onMouseLeave={() => setIsOpenGame(false)}
							className="z-10 absolute left-0 mt-2 divide-y rounded-lg max-w-52">
							<ul className="py-0 text-sm text-gray-700">
								<li className="py-3 px-4 border border-emerald-500 text-white text-sm w-32 rounded-md cursor-pointer my-2 mt-0 hover:bg-emerald-600 transition">
									<Link href="/play">New Game</Link>
								</li>
								<li className="py-3 px-4 border border-sky-500 text-white text-sm w-32 rounded-md cursor-pointer my-2 hover:bg-sky-600 transition">
									<Link href="/tourname">New Tournament</Link>
								</li>
							</ul>
						</div>

					)}
				</div> */}
        {/* end  drop down menu for Users and game & tournament */}

        {/* drop down menu for Users and Friends */}
        {/* <div className="relative">
					<button
					onClick={() => setIsOpenUsers(!isOpenUsers)}
					className="text-white bg-blue-700 hover:bg-blue-800 rounded-lg px-5 py-2.5 text-center inline-flex items-center"
					type="button"
					>
						<span className='text-[1rem]'>Users
							<svg
								className="w-2.5 h-2.5 ms-3 inline"
								aria-hidden="true"
								fill="none"
								viewBox="0 0 10 6"
							>
								<path
								stroke="currentColor"
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="m1 1 4 4 4-4"
								/>
							</svg>
						</span>
					</button>

					{isOpenUsers && (
						<div onMouseLeave={() => setIsOpenUsers(false)}
							className="z-10 absolute left-0 mt-2 divide-y rounded-lg max-w-52">
							<ul className="py-0 text-sm text-gray-700">
								<li className="py-3 px-4 bg-emerald-500 text-white text-sm w-32 rounded-md cursor-pointer my-2 mt-0 hover:bg-emerald-600 transition">
									<Link href="/allusers">All Users</Link>
								</li>
								<li className="py-3 px-4 bg-sky-500 text-white text-sm w-32 rounded-md cursor-pointer my-2 hover:bg-sky-600 transition">
									<Link href="/friends">Friends</Link>
								</li>
							</ul>
						</div>

					)}
				</div> */}
        {/* end drop down menu for Users and Friends */}

        {/* search bar ***************** */}
        <SearchProfileComponent />
        {/*  end search bar ***************** */}
      </div>

      {/* for mobile navigation */}
      {/* NOTHING */}
      {/* for mobile navigation */}
    </>
  );
};

export default Links;
