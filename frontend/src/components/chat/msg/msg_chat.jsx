import '@/styles/chat/msg.css';

import Image from 'next/image';
import { LiaGamepadSolid } from 'react-icons/lia';
import { ImBlocked } from 'react-icons/im';
import { BsSendFill } from 'react-icons/bs';
import EmojiPicker from 'emoji-picker-react';
import { BsEmojiSmile } from 'react-icons/bs';
import { TiArrowBack } from 'react-icons/ti';
// import Picker from 'emoji-picker-react';
import React, { useContext , useState, useRef, useEffect} from 'react';
import { ChatContext } from '@/app/chat/chat_context/ChatContext';

import { useAuth } from '@/components/auth/loginContext.jsx';
import Link  from "next/link";




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
	formatTime,
	typingUsers, // Include typingUsers to access typing status
	emojiPickerRef,
	handleScroll,
	chatContainerRef
	
  } = useContext(ChatContext);

	const { profileData: currentuser } = useAuth();  // Current logged-in user

	return (
		<div className={`msg_chat ${isChatVisible ? '' : 'hidden'}`}>
		{selectedUser ? (
			<>
			<div className="freind-profile">
				<div className="section-profile">
				<TiArrowBack onClick={handleBackClick} className="TiArrowBack" />
					<Link href={`/${selectedUser.username}`} className='link_selectedUser_profile'>
					<img
						src={selectedUser.avatar}
						alt={selectedUser.username}
						// width={65}
						// height={65}
						// style={{ borderRadius: '50%', border: '3px solid #F1FAEE' }}
						className="img-section-profile"
					/>
					</Link>
				<p className='user_prof'>{selectedUser.username}</p>
					{/* Typing indicator */}
					{typingUsers.includes(selectedUser.username) && (
						<p className="typing-indicator">Typing...</p>
					)}
				</div>
				<div className="section_action">
				<LiaGamepadSolid className="LiaGamepadSolid" />
				<ImBlocked className="ImBlocked" />
				</div>
			</div>

			<div className="body-message-chat" >
				<div className="center-chat"   onScroll={handleScroll}  ref={chatContainerRef}>
					{messages[selectedUser?.id] &&
					Object.entries(messages[selectedUser.id]).map(([date, dateMessages], index) => (
						<div key={index} className="groupe_msg_date">
						<div className="message_date">
							<p className="par_date"> <span>{date}</span> </p>
						</div>

						{/* {(Array.isArray(dateMessages) ? dateMessages : []).map((msg, msgIndex) => ( */}
						{/* {Array.isArray(dateMessages) && dateMessages.map((msg, msgIndex) => ( */}
						
						{dateMessages.map((msg, msgIndex) => (
							<div
							key={msgIndex}
							className={msg.sender === currentuser.username ? 'my-message' : 'message'}
							>
							{msg.sender !== currentuser.username && (
								<img
								src={selectedUser.avatar}
								alt={selectedUser.username}
								className="img_msg"
								style={{ borderRadius: '50%', border: 'solid #F1FAEE' }}
								/>
							)}
							<div className="div_text_message">
								<p className="text_message">{msg.message}</p>
								<span className="message_time">{formatTime(msg.timestamp)}</span>
							</div>
							{msg.sender === currentuser.username && (
								<img
								src={currentuser.avatar}
								alt={currentuser.username}
								className="img_my_message"
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
					//   onChange={e => setText(e.target.value)}
					onChange={e => {setText(e.target.value)
					}}
					value={text}
					onKeyDown={handleKeyPress}
					/>
				</div>
				<div className="emoji" ref={emojiPickerRef}>
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
