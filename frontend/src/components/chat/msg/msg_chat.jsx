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




const Msg_chat = () => {
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
  } = useContext(ChatContext);

  const { profileData: data } = useAuth();  // Current logged-in user

  return (
    <div className={`msg_chat ${isChatVisible ? '' : 'hidden'}`}>
      {selectedUser ? (
        <>
          <div className="freind-profile">
            <div className="section-profile">
              <TiArrowBack onClick={handleBackClick} className="TiArrowBack" />
              <img
                src={selectedUser.avatar}
                alt={selectedUser.username}
                width={65}
                height={65}
                style={{ borderRadius: '50%', border: '3px solid #F1FAEE' }}
                className="img-section-profile"
              />
              <p>{selectedUser.username}</p>
            </div>
            <div className="section_action">
              <LiaGamepadSolid className="LiaGamepadSolid" />
              <ImBlocked className="ImBlocked" />
            </div>
          </div>

          <div className="body-message-chat">
            <div className="center-chat">
            {messages[selectedUser?.id]?.length > 0 &&(
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
                    <p>{msg.message}</p>
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
              )}

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
