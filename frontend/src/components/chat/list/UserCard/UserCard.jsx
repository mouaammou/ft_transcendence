
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import '@/styles/chat/UserCard.css';
import { formatDistanceToNow } from 'date-fns'; // Optionally for formatting the timestamp
// usetate
import { useState, useEffect } from 'react';

const UserCard = ({ user, listType, onUserSelect, typingUsers, lastMessage , currentUser}) => {
  if (!user) {
    return null; // Return null if user is undefined
  }
  const borderColor = user.status === 'online' ? 'green' : 'red';
  const imageSize = listType === 'online' ? '65' : '45';

  // Helper function to shorten time strings
  const formatShortDistance = (timestamp) => {

    const fullString = formatDistanceToNow(new Date(timestamp));

    // Replace long phrases with shorter equivalents
    return fullString
      .replace('less than a minute', 'now')
      .replace('about', '') // Removes "about"
      .replace('minutes', 'min')
      .replace('minute', 'min')
      .replace('hours', 'h')
      .replace('hour', 'h')
      .replace('days', 'd')
      .replace('day', 'd')
      .replace('months', 'mo')
      .replace('month', 'mo')
      .replace('years', 'y')
      .replace('year', 'y')
      .trim(); // Trim extra spaces
  };
  // Check if the user is typing
  const isTyping = typingUsers.includes(user.username);

  // Dynamic timestamp state
  const [formattedTimestamp, setFormattedTimestamp] = useState(
    lastMessage.timestamp ? formatShortDistance(lastMessage.timestamp) : ''
  );

  useEffect(() => {
    if (!lastMessage.timestamp) return;

    // Update immediately for initial value
    setFormattedTimestamp(formatShortDistance(lastMessage.timestamp));

    // Update the timestamp every minute
    const interval = setInterval(() => {
      setFormattedTimestamp(formatShortDistance(lastMessage.timestamp));
    }, 60000); // Update every 60 seconds (1 minute)

    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, [lastMessage.timestamp]);

  return listType === 'online' ? (
    // Render using Card and CardContent for "online" listType
    <div 
      onClick={() => onUserSelect(user)} 
      className="usercard-card-wrapper"
      style={{ cursor: "pointer" }} // Optional: Add visual feedback for interactivity
    >
      {/* <Card className="usercard-card" onClick={() => onUserSelect(user)}>
        <CardContent 
          className="flex aspect-square items-center justify-center"
        >
          <img
            src={user.avatar}
            alt={user.username}
            width={imageSize}
            height={imageSize}
            className="w-full h-full object-cover"
          />
        </CardContent>
      </Card> */}

      <Card className="h-full">
          <CardContent className="relative p-2">
            <div className="aspect-square overflow-hidden rounded-lg">
              <img
                src={user.avatar}
                alt={user.username}
                className="w-full h-full object-cover"
              />
              <div 
                className="status-indicator"
                style={{ backgroundColor: borderColor }}
              />
            </div>
            <p className="text-center mt-2 text-sm font-medium truncate">
              {user.username}
            </p>
          </CardContent>
        </Card>


    </div>
  ) : (
    // Render default structure for "all" listType
    <div
      // className={`usercard ${listType === 'online' ? 'UserCardOnline' : 'UserCardAll'}`}
      className={`usercard ${listType !== 'online' ? 'UserCardAll' : ''}`}
      onClick={() => onUserSelect(user)}
    >
      {/* <div style={{flexGrow: '1',}}> */}
      <div style={{}}>
      {/* <div style={{width: '20%'}}> */}
        <img
          src={user.avatar}
          alt={user.username}
          width={imageSize}
          height={imageSize}
          className="img-usercard"
          style={{
            borderRadius: '50%',
            border: '2px solid #fff',
          }}
        />
      </div>
      <div
        className="status"
        style={{ backgroundColor: `${borderColor}`, borderRadius: '50%' }}
      ></div>
      {listType === 'all' && (
        <>
         <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
              flexGrow: '1',
              // width: '70%',
              padding: '0px 10px',
              overflow: 'hidden', // Ensure child elements respect overflow
            }}
          >
            <p style={{
              fontSize: '18px',
              fontWeight: 'bold',
            }} >
              {user.username}
            </p>
            {!isTyping && (
              <p
                style={{
                  margin: '5px 0',
                  fontWeight: lastMessage.is_read ? 'normal' : 'bold',
                  color: lastMessage.is_read ? '#E8E6E6' : '#f9f9f9',
                  fontFamily:'"Times New Roman", Times, serif',
                  whiteSpace: 'nowrap', // Prevents text from wrapping
                  overflow: 'hidden', // Hides overflowing text
                  textOverflow: 'ellipsis', // Adds ellipsis for truncated text
                  // maxWidth: '250px', // Set a maximum width for the text container
                }}
              >
                {lastMessage.message}
                {/* {truncatedMessage} */}
                
              </p>
            )}
            {isTyping && (
              <p className="typing_indicator_card" >Typing...</p>
            )}
          </div>
          {!isTyping && (
            <>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                  {formattedTimestamp && (
                    <p style={{ fontSize: '12px', margin: '0 0 5px', color: '#888' }}>
                      {formattedTimestamp}
                    </p>
                  )}

                  {lastMessage.is_read ? (
                    <span style={{ fontSize: '14px', color: '#4caf50', fontWeight:'bold' }}>✓✓</span>
                  ) : (
                    lastMessage.unread_count > 0 && (
                      <div
                        style={{
                          // backgroundColor: 'blue',
                          backgroundColor: '#5faffe',
                          color: 'white',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          fontSize: '12px',
                          fontWeight: 'bold',
                        }}
                      >
                        {lastMessage.unread_count}
                      </div>
                    )
                  )}
                </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default UserCard;


