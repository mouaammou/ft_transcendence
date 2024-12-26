'use client';
import '@/styles/chat/list_chat.css';
import Image from 'next/image';
import { HiBell } from 'react-icons/hi2';
import UserList from '@/components/chat/list/UserList/UserList';
import React, { useContext } from 'react';
import { ChatContext } from '@/app/chat/chat_context/ChatContext';

import { useAuth } from '@/components/auth/loginContext.jsx';

const list_chat = () => {
  const { isChatVisible, allUsers, handleSearch, currentUser, onlineUsers} = useContext(ChatContext);
  const limitedOnlineUsers = onlineUsers.slice(0, 6);


  return (
    <div className={`list_chat ${isChatVisible ? 'hidden' : ''}`}>
      <div className="user-chat">
        <div className="info-user">
          <img
            src={currentUser.avatar}
            alt={currentUser?.username}
            className="img-info-user"
            width={65}
            height={65}
            style={{ borderRadius: '50%', border: '3px solid #F1FAEE' }}
          />
          <p> {currentUser?.username} </p>
        </div>
      </div>
      <div className="div-Search">
        <input type="text" placeholder="Search users..." onChange={handleSearch} />
      </div>
      <div className="initial-active-users">
        <h2>Online Now</h2>
        <div className="user-grid">
          <UserList users={limitedOnlineUsers} currentUser={currentUser} listType="online" />
        </div>
      </div>
      <div>
        <h2> all user</h2>
        <div className="all-user">
          <UserList users={allUsers} listType="all" />
        </div>
      </div>
    </div>
  );
};

export default list_chat;
