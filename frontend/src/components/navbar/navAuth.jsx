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

  const ResponsiveAvatar = ({ data }) => {
    return (
      <div className="group">
        <img 
          className="w-10 h-10 rounded-full object-cover 
                      transform group-hover:scale-105 
                      transition-transform duration-300
                      shadow-sm hover:shadow-md max-lg:w-24 max-lg:h-10 min-w-10 min-h-10 max-w-10 max-h-10" 
          src={data.avatar} 
          alt="user-avatar"
          loading="lazy"
        />
      </div>
    );
  };
  

  const UserDropdown = ({ isOpen, setIsOpen, data, Logout }) => {
    const handleMouseLeave = () => {
      setIsOpen(false);
    };
  
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="relative overflow-hidden flex rounded-full ring-2 ring-gray-700 hover:ring-blue-500 transition-all duration-300 group"
        >
          <ResponsiveAvatar data={data}/>
        </button>
  
        {isOpen && (
          <div className="absolute right-0 mt-3 w-64 bg-gray-800 rounded-lg shadow-xl border border-gray-700/50 overflow-hidden z- animate-fadeIn" onMouseLeave={handleMouseLeave}>
            <div className="p-4 border-b border-gray-700/50 bg-gray-800/90">
              <p className="text-gray-100 font-semibold">{data.username}</p>
              <p className="text-gray-400 text-sm truncate mt-0.5">{data.email}</p>
            </div>
            
            <nav className="p-2">
              {[
                { label: 'Profile', href: '/profile', icon: '👤' },
                { label: 'Settings', href: '/settings', icon: '⚙️' },
                { label: 'Create Tournament', href: '/tournament', icon: '🏆' },
                { label: 'Start Game', href: '/play', icon: '🎮' },
              ].map(({ label, href, icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center px-4 py-2.5 text-gray-300 hover:bg-gray-700/50 rounded-lg transition-colors group"
                >
                  <span className="mr-3 text-lg">{icon}</span>
                  <span className="group-hover:text-gray-100 transition-colors">{label}</span>
                </Link>
              ))}
              
              <div className="px-2 pt-2 mt-2 border-t border-gray-700/50">
                <button
                  onClick={Logout}
                  className="w-full flex items-center px-4 py-2.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors group"
                >
                  <IoLogOut className="mr-3 text-lg group-hover:text-red-300 transition-colors" />
                  <span className="group-hover:text-red-300 transition-colors">Logout</span>
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    );
  };
  
  const AuthenticatedNav = ({ data, Logout }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <div className="flex items-center h-20 px-6 bg-gray-800 backdrop-blur-lg bg-opacity-95"> 
        <SearchProfileComponent />
        <div className="ml-auto flex items-center space-x-6">
          <NotificationBell />
          <div className="hidden md:block">
            <h3 className="text-gray-200 font-medium">{data.username}</h3>
          </div>
          <UserDropdown 
            isOpen={isOpen} 
            setIsOpen={setIsOpen} 
            data={data} 
            Logout={Logout} 
          />
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