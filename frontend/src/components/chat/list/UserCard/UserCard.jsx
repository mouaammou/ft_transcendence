// import React from 'react';
import React, { useState } from 'react';
import Image from 'next/image';
import '@/styles/chat/UserCard.css';

const UserCard = ({ user, listType, onUserSelect }) => {
  const borderColor = user.active ? 'green' : 'red';
  const imageSize = listType === 'online' ? '65' : '45';

  return (
    <div
      className={`usercard ${listType === 'online' ? 'UserCardOnline' : 'UserCardAll'}`}
      onClick={() => onUserSelect(user)}
    >
      <img
          src={user.avatar}
          alt={user.username }
          width={imageSize}
          height={imageSize}
          className="img-usercard"
          style={{
            borderRadius: '50%',
            border: '2px solid #fff',
          }}
        />
      <div
        className="status"
        style={{ backgroundColor: `${borderColor}`, borderRadius: '50%' }}
      ></div>
      {listType === 'all' && (
        <>
          <p>{user.username}</p>
          { /* display last message */}
          { /* display the time of the message */}
        </>
      )}
    </div>
  );
};

export default UserCard;
