import UserCard from '../UserCard/UserCard';
import '@/styles/chat/UserList.css';
import React, { useContext } from 'react';
import { ChatContext } from '@/app/chat/chat_context/ChatContext';

const UserList = ({ users, listType }) => {
  const { handleUserClick } = useContext(ChatContext);

  return (
    <div className={`user-list ${listType === 'online' ? 'UserListOnline' : 'UserListAll'}`}>
      {users.map(user => (
        <UserCard key={user.id} user={user} listType={listType} onUserSelect={handleUserClick} />
      ))}
    </div>
  );
};

export default UserList;
