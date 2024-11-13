'use client';
import Link from 'next/link';
import { useAuth } from '@/components/auth/loginContext';
import Links from './Links';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { IoLogOut } from 'react-icons/io5';
import NotificationBell from './notifications';
import SearchProfileComponent from './search';
import { usePathname } from 'next/navigation';

const Logo = () => {
  return (
    // logo component
    <div className="flex-shrink max-w-20">
      <Link href="/">
        <Image
          src="/main-logo.svg"
          width={1}
          height={1}
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
  const pathname = usePathname();
  const [loginPage, setLoginPage] = useState(() => {
    if (pathname === '/login') {
      return 'Sign Up';
    }
    return 'Login';
  });

  useEffect(() => {
    if (pathname === '/login') {
      setLoginPage('Sign Up');
    } else {
      setLoginPage('Login');
    }

    return () => {
      setLoginPage('');
    };
  }, [pathname]);

  return (
    <>
      <nav className="relative z-10">
        {isAuth ? ( // If user is authenticated, show the links
          <div className="flex flex-row items-center justify-between bg-gray-100 pr-10">
            <div className="w-full">
              <SearchProfileComponent />
            </div>
            {/* notifications bell */}
            <div className="mx-10 max-sm:mx-3 max-sm:hidden">
              <NotificationBell />
            </div>
            <div className="max-sm:hidden">
              <h3 className="text-gray-800 text-xl font-semibold mx-4 mt-2">{data.username}</h3>
            </div>
            <div className="">
              {/* drop down menu for Userlogo and notification */}
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="max-w-20 overflow-hidden flex text-sm bg-gray-800 rounded-full border-2 border-gray-500"
              >
                <img className="w-20 h-fit" src={data.avatar} alt="down-arrow" />
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
              <Link
                href={loginPage === 'Login' ? '/login' : '/signup'}
                className="text-white border border-white px-16 py-4 mr-2 rounded hover:bg-white hover:text-gray-800 transition-all duration-300"
              >
                {loginPage}
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
