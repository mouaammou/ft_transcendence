'use client';
import Link from 'next/link';
import { useAuth } from '@/components/auth/loginContext';
import Links from './Links';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { IoLogOut } from 'react-icons/io5';
import NotificationBell from './notifications';
import SearchProfileComponent from './search';

const Logo = () => {
  return (
    // logo component
    <div className="flex-shrink max-w-20">
      <Link href="/">
        <Image
          src="/new-logo.svg"
          width={100}
          height={100}
          alt="logo"
          priority={true}
          className="h-20 w-20 sm:h-16 sm:w-16 md:h-24 md:w-24"
        />
      </Link>
    </div>
  );
};

const Navbar = () => {
  const { Logout, isAuth, profileData: data } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <nav className="p-4 w-full bg-gray-800">
        {isAuth ? ( // If user is authenticated, show the links
          <div className="container flex flex-row items-center">
            {/* logo component */}
            {/* <Logo/> */}
            {/* links components */}
            <div className="w-full">
              <SearchProfileComponent />
            </div>
            {/* drop down menu for Userlogo and notification */}
            <div className="relative">
              {/* for notifications */}
              <NotificationBell />
              <Link href="/play">
                <button className="text-black bg-white px-4 py-2 rounded ">Play</button>
              </Link>
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="max-w-16 overflow-hidden flex text-sm bg-gray-800 rounded-full md:me-0 hover:ring-4 hover:ring-gray-300"
              >
                <img className="w-full" src={data.avatar} alt="down-arrow" />
              </button>

              {isOpen && (
                <div
                  onMouseLeave={() => setIsOpen(false)}
                  className="z-50 absolute right-3 mt-4 text-base list-none divide-y rounded-lg shadow-lg w-48 bg-gray-800 text-gray-400"
                >
                  <div className="px-4 py-3">
                    <span className="block text-sm text-white">{data.username}</span>
                    <span className="block text-sm truncate text-gray-400">{data.email}</span>
                  </div>
                  <ul className="py-2">
                    <li>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-white hover:text-gray-700 hover:bg-gray-100"
                      >
                        Profile
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/settings"
                        className="block px-4 py-2 text-sm text-white hover:text-gray-700 hover:bg-gray-100 "
                      >
                        Settings
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/tournament"
                        className="block px-4 py-2 text-sm text-white hover:text-gray-700 hover:bg-gray-100 "
                      >
                        Create Tournament
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/play"
                        className="block px-4 py-2 text-sm text-white hover:text-gray-700 hover:bg-gray-100 "
                      >
                        Start Game
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={Logout}
                        className="w-full text-left block px-4 py-2 text-sm text-white hover:text-gray-700 hover:bg-gray-100 "
                      >
                        Logout
                        <IoLogOut className="inline-block mx-3 px-1 text-[1.6rem]" />
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
            {/* end drop down menu for User */}
          </div>
        ) : (
          // if not authenticated, show login and signup buttons
          <div className="container p-[0px] mx-auto flex flex-row items-center justify-between sm:space-y-0">
            {/* logo component */}
            <Logo />
            <div className="">
              <Link href="/login" className="text-black bg-white px-4 py-2 mr-2 rounded">
                Login
              </Link>
              <Link href="/signup" className="text-black bg-white px-7 py-2 rounded">
                Signup
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
