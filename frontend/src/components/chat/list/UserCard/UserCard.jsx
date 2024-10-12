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
      {/* <Image
        // src={user.img}
        // alt={user.name}
        src={user.avatar}
        alt="rere"
        width={imageSize}
        height={imageSize}
        className="img-usercard"
        style={{
          borderRadius: '50%',
          border: `2px solid #fff`,
        }}
      /> */}
      <img
          src={user.avatar} // Use the avatar URL for the image source
          alt={user.username } // Use the username for alt text, fallback to default
          width={imageSize} // Set width dynamically
          height={imageSize} // Set height dynamically
          className="img-usercard"
          style={{
            borderRadius: '50%', // Make the image circular
            border: '2px solid #fff', // Add white border around the image
          }}
        />
      <div
        className="status"
        style={{ backgroundColor: `${borderColor}`, borderRadius: '50%' }}
      ></div>
      {listType === 'all' && (
        <>
          {/* <p>{user.name}</p> */}
          <p>{user.username}</p>
          {/* <p>Active: {user.active ? 'Yes' : 'No'}</p> */}
        </>
      )}
    </div>
  );
};

export default UserCard;
