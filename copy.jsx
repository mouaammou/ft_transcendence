import React, { useState, useEffect, useCallback } from 'react';
import { IoLogOut } from 'react-icons/io5';
import { IoIosNotificationsOutline } from 'react-icons/io';
import { IoCheckmarkDoneOutline, IoCheckmarkOutline, IoCloseOutline } from "react-icons/io5";
import Link from 'next/link';

const SearchProfileComponent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState({});
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <div className="relative w-full max-w-2xl">
      <div className="relative w-full">
        <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none">
          <svg
            className="w-5 h-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 20"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
            />
          </svg>
        </div>
        <input
          type="search"
          className="block w-full ps-12 py-3 text-gray-100 text-sm rounded-lg bg-gray-700/50 border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200"
          placeholder="Search for users, friends, tournaments..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
        />
      </div>

      {isSearchFocused && results.length > 0 && (
        <div className="absolute top-full left-0 w-full mt-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden z-50">
          {results.map((result, index) => (
            <Link 
              key={index}
              href={`/friend/${result.username}`}
              className="flex items-center space-x-4 p-4 hover:bg-gray-700/50 transition-colors border-b border-gray-700/50 last:border-0"
            >
              <img
                src={result.avatar}
                alt={result.username}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-700"
              />
              <span className="font-medium text-gray-200">{result.username}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.notification-container')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative notification-container">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 rounded-full bg-gray-700/50 hover:bg-gray-700 transition-colors relative"
        aria-label="Notifications"
      >
        <IoIosNotificationsOutline className="text-2xl text-gray-200" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-96 max-h-[480px] bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden z-50">
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <h3 className="text-gray-200 font-semibold">Notifications</h3>
            <Link href="/notifications" className="text-blue-400 hover:text-blue-300 text-sm">
              View all
            </Link>
          </div>
          <div className="overflow-y-auto max-h-[400px] scrollbar-thin scrollbar-thumb-gray-600">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-gray-400">
                <p>No new notifications</p>
              </div>
            ) : (
              notifications.map((notification, index) => (
                <div key={index} className="p-4 border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                  {/* Notification content */}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const AuthenticatedNav = ({ data, Logout }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="flex items-center h-20 bg-gray-800 px-6 shadow-lg">
      <SearchProfileComponent />
      <div className="ml-auto flex items-center space-x-6">
        <NotificationBell />
        <div className="hidden md:block">
          <h3 className="text-gray-200 font-medium">{data.username}</h3>
        </div>
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-gray-700 hover:ring-blue-500 transition-all duration-200"
          >
            <img 
              src={data.avatar} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden z-50">
              <div className="p-4 border-b border-gray-700">
                <p className="text-gray-200 font-semibold">{data.username}</p>
                <p className="text-gray-400 text-sm truncate">{data.email}</p>
              </div>
              <nav className="p-2">
                {[
                  ['Profile', '/profile'],
                  ['Settings', '/settings'],
                  ['Create Tournament', '/tournament'],
                  ['Start Game', '/play'],
                ].map(([label, href]) => (
                  <Link
                    key={href}
                    href={href}
                    className="block px-4 py-2 text-gray-300 hover:bg-gray-700/50 rounded-lg transition-colors"
                  >
                    {label}
                  </Link>
                ))}
                <button
                  onClick={Logout}
                  className="w-full mt-2 flex items-center px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <IoLogOut className="mr-2 text-lg" />
                  Logout
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthenticatedNav;