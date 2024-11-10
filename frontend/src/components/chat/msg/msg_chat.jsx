import '@/styles/chat/msg.css';

import Image from 'next/image';
import { LiaGamepadSolid } from 'react-icons/lia';
import { ImBlocked } from 'react-icons/im';
import { BsSendFill } from 'react-icons/bs';
import EmojiPicker from 'emoji-picker-react';
import { BsEmojiSmile } from 'react-icons/bs';
import { TiArrowBack } from 'react-icons/ti';
// import Picker from 'emoji-picker-react';
import React, { useContext } from 'react';
import { ChatContext } from '@/app/chat/chat_context/ChatContext';

import { useAuth } from '@/components/auth/loginContext.jsx';
import useNotificationContext from '@/components/navbar/useNotificationContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Msg_chat = () => {

	const {isConnected, sendMessage , NOTIFICATION_TYPES} = useNotificationContext();

  const {
    selectedUser,
    open,
    setOpen,
    text,
    setText,
    handleBackClick,
    handleEmojiClick,
    isChatVisible,
    messages,
    handleSendMessage,
    handleKeyPress,
    endRef,
    // getChatId

    formatTime,
    formatDate,
  } = useContext(ChatContext);

  const { profileData: data } = useAuth(); // Current logged-in user
  const router = useRouter();
  const inviteToGame = () => {
      if (selectedUser?.id) {
  
        if (isConnected)
          sendMessage(JSON.stringify({
            type: NOTIFICATION_TYPES.INVITE_GAME,
            to_user_id: selectedUser.id,
          }));
      }
    localStorage.setItem('selectedFriend', JSON.stringify(selectedUser));// where can i get the user you are chatting with
    router.push('/waiting_friends_game');
    console.log('Invite to game');
  };
  console.log('selectedUser:', selectedUser);

  // const formatDate = (timestamp) => {
  //   const date = new Date(timestamp);
  //   const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false };

  //   return date.toLocaleString('en-US', options).replace(',', ''); // Modify for your locale
  // };

  return (
    <div className={`msg_chat ${isChatVisible ? '' : 'hidden'}`}>
      {selectedUser ? (
        <>
          <div className="freind-profile">
            <div className="section-profile">
              <TiArrowBack onClick={handleBackClick} className="TiArrowBack" />
              <Link href={`/${selectedUser.username}`} className="link_selectedUser_profile">
                <img
                  src={selectedUser.avatar}
                  alt={selectedUser.username}
                  // width={65}
                  // height={65}
                  // style={{ borderRadius: '50%', border: '3px solid #F1FAEE' }}
                  className="img-section-profile"
                />
              </Link>
              <p>{selectedUser.username}</p>
            </div>
            <div className="section_action">
              <LiaGamepadSolid onClick={inviteToGame} className="LiaGamepadSolid" />
              <ImBlocked className="ImBlocked" />
            </div>
          </div>

          <div className="body-message-chat">
            <div className="center-chat">
              {/* {messages[selectedUser?.id]?.length > 0 &&(
				messages[selectedUser.id].map((msg, index) => (
				  <div
					key={index}
					className={msg.sender === data.username ? 'my-message' : 'message'}
				  >
				
					{msg.sender !== data.username && (
					  <img
						src={selectedUser.avatar}
						alt={selectedUser.username}
						className="img_msg"
						width={45}
						height={45}
						style={{ borderRadius: '50%', border: 'solid #F1FAEE' }}
					  />
					)}
					<div className='div_text_message'>
					  <p className='text_message'>{msg.message}</p>
					  <span className="message_time">{formatDate(msg.timestamp)}</span>
					</div>
					{msg.sender === data.username && (
					  <img
						src={data.avatar}
						alt={data.username}
						className="img_my_message"
						width={45}
						height={45}
						style={{ borderRadius: '50%', border: 'solid #F1FAEE' }}
					  />
					)}
				  </div>
				))
			)} */}

              {/* new code */}

              {/* Group messages by date */}
              {messages[selectedUser?.id] &&
                Object.keys(messages[selectedUser.id]).map((date, index) => (
                  <div key={index} className="groupe_msg_date">
                    {/* Display the date */}
                    <div className="message_date">
                      {/* <h1 className='par_date'> <span>{date}</span> </h1> */}
                      <p className="par_date">
                        {' '}
                        <span>{date}</span>{' '}
                      </p>
                    </div>

                    {/* Display messages for the current date */}
                    {messages[selectedUser.id][date].map((msg, msgIndex) => (
                      <div
                        key={msgIndex}
                        className={msg.sender === data.username ? 'my-message' : 'message'}
                      >
                        {msg.sender !== data.username && (
                          <img
                            src={selectedUser.avatar}
                            alt={selectedUser.username}
                            className="img_msg"
                            // width={45}
                            // height={45}
                            style={{ borderRadius: '50%', border: 'solid #F1FAEE' }}
                          />
                        )}
                        <div className="div_text_message">
                          <p className="text_message">{msg.message}</p>
                          {/* Display the time for each message */}
                          <span className="message_time">{formatTime(msg.timestamp)}</span>
                        </div>
                        {msg.sender === data.username && (
                          <img
                            src={data.avatar}
                            alt={data.username}
                            className="img_my_message"
                            // width={45}
                            // height={45}
                            style={{ borderRadius: '50%', border: 'solid #F1FAEE' }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ))}

              {/* Scroll to the bottom of the chat */}
              <div ref={endRef}></div>
            </div>

            {/* Message input and emoji picker */}
            <div className="bottom-chat">
              <div className="div_message_input">
                <input
                  className="message_input"
                  type="text"
                  placeholder="Type a message..."
                  onChange={e => setText(e.target.value)}
                  value={text}
                  onKeyDown={handleKeyPress}
                />
              </div>
              <div className="emoji">
                <BsEmojiSmile className="BsEmojiSmile" onClick={() => setOpen(prev => !prev)} />
                {open && (
                  <div className="Picker">
                    <EmojiPicker onEmojiClick={handleEmojiClick} />
                  </div>
                )}
              </div>
              <button className="buttom-send" onClick={handleSendMessage}>
                <BsSendFill className="send-icon" />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="user-not-select">
          <h2>Select a user to start chatting</h2>
        </div>
      )}
    </div>
  );
};

export default Msg_chat;
