'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { IoLogOut } from 'react-icons/io5';
import { useAuth } from '@/components/auth/loginContext';
import NotificationBell from './notifications';
import SearchProfileComponent from './search';

const Logo = () => (
	<div className="flex-shrink max-w-20">
	  <Link href="/">
		<img
		  src="/main-logo.svg"
		  width={1}
		  height={1}
		  alt="logo"
		  className="h-16 w-12 sm:h-16 sm:w-16 md:h-24 md:w-24 p-2"
		/>
	  </Link>
	</div>
  );

const UserDropdown = ({ isOpen, setIsOpen, data, Logout }) => (
  <div className="relative">
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className="overflow-hidden flex rounded-full border-2 border-gray-300 transition-all duration-300 hover:border-gray-400"
    >
      <img 
        className="w-10 h-10 sm:w-12 sm:h-12 object-cover" 
        src={data.avatar} 
        alt="user-avatar" 
      />
    </button>

    {isOpen && (
      <div
        onClick={() => setIsOpen(false)}
        className="z-50 absolute right-0 mt-4 text-base divide-y rounded-lg shadow-2xl w-56 bg-white border border-gray-100"
      >
        <div className="px-4 py-3">
          <span className="block text-sm font-semibold text-gray-900">{data.username}</span>
          <span className="block text-sm truncate text-gray-500">{data.email}</span>
        </div>
        <ul className="py-2">
          {[
            { href: '/profile', label: 'Profile' },
            { href: '/settings', label: 'Settings' },
            { href: '/tournament', label: 'Create Tournament' },
            { href: '/play', label: 'Start Game' },
          ].map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {label}
              </Link>
            </li>
          ))}
          <li>
            <button
              onClick={Logout}
              className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              Logout
              <IoLogOut className="ml-2 text-lg" />
            </button>
          </li>
        </ul>
      </div>
    )}
  </div>
);

const AuthenticatedNav = ({ data, Logout }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="flex items-center h-16 bg-white px-4 sm:px-6 shadow-sm">
      <div className="w-[200px] sm:w-[400px]">
        <SearchProfileComponent />
      </div>
      <div className="ml-auto flex items-center space-x-4">
        <div className="flex items-center justify-center">
          <NotificationBell />
        </div>
        <div className="hidden md:block">
          <h3 className="text-gray-900 font-medium">{data.username}</h3>
        </div>
        <UserDropdown isOpen={isOpen} setIsOpen={setIsOpen} data={data} Logout={Logout} />
      </div>
    </div>
  );
};

const UnauthenticatedNav = ({ loginPage }) => (
	<div className="container p-[0px] mx-auto flex flex-row items-center justify-between sm:space-y-0">
		<Logo />
		<div>
		<Link
			href={loginPage === 'Login' ? '/login' : '/signup'}
			// className="text-white border border-white px-16 py-4 mr-2 rounded hover:bg-white hover:text-gray-800 transition-all duration-300 max-md:px-10 text-sm"
      className='block custom-button w-fit'
		>
			{loginPage}
		</Link>
		</div>
	</div>
	);

const Navbar = () => {
  const { Logout, isAuth, profileData: data } = useAuth();
  const pathname = usePathname();
  const [loginPage, setLoginPage] = useState(pathname === '/login' ? 'Sign Up' : 'Login');

  useEffect(() => {
    setLoginPage(pathname === '/login' ? 'Sign Up' : 'Login');
    return () => setLoginPage('');
  }, [pathname]);

  return (
    <nav className="sticky top-0 z-50 w-full">
      {isAuth ? (
        <AuthenticatedNav data={data} Logout={Logout} />
      ) : (
        <UnauthenticatedNav loginPage={loginPage} />
      )}
    </nav>
  );
};

export default Navbar;