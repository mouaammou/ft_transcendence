'use client';
import { useRouter } from 'next/navigation';
import '@/styles/style-sidebar/MobileSidebar.css';
import { ChatContext } from '@/app/chat/chat_context/ChatContext';
import React, { useContext } from 'react';
import { useAuth } from '@/components/auth/loginContext';

export default function MobileSidebar() {
  const router = useRouter();

  const { logout } = useAuth();

  const sidebarItems = [
    { label: 'Home', icon: '/vector.svg', route: '/' },
    { label: 'Freinds', icon: '/3-User.svg', route: '/freinds' },
    { label: 'Profile', icon: '/Profil.svg', route: '/profile' },
    { label: 'Chat', icon: '/chat.svg', route: '/chat' },
    { label: 'Game', icon: '/Game.svg', route: '/Game' },
    { label: 'Setting', icon: '/Setting.svg', route: '/Setting' },
    // {label: 'Logout',icon: '/Logout.svg', route: '/Logout'},
    // {label: 'Logout',icon: '../public/back.png', route: '/Logout'},
  ];

  // Try to access the ChatContext, but fallback to undefined if not available
  const SidebarContext = useContext(ChatContext);
  const ischatVisible = SidebarContext ? SidebarContext.isChatVisible : false;

  return (
    <div className={`containerSidebar ${ischatVisible ? 'hidden' : 'visible'}`}>
      <div className="sidebar">
        <div className="logo">
          <img src="new-logo.svg" alt="logo" />
        </div>
        <div className="icon_items">
          <ul>
            {sidebarItems.map((item, index) => (
              <li
                key={index}
                className={router.pathname === item.route ? 'active' : ''}
                onClick={() => router.push(item.route)}
              >
                <img className="icone_side" src={item.icon} alt={item.label} />
              </li>
            ))}
          </ul>
        </div>
        <div className="Logout">
          <ul>
            <li>
              <img src="/Logout.svg" alt="logout" onClick={logout} />
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
