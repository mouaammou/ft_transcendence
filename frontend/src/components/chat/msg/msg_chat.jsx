import '@/styles/chat/msg.css';

import Image from 'next/image';
import { LiaGamepadSolid } from 'react-icons/lia';
import { ImBlocked } from 'react-icons/im';
import { ImEyeBlocked } from "react-icons/im";
import { BsSendFill } from 'react-icons/bs';
import EmojiPicker from 'emoji-picker-react';
import { BsEmojiSmile } from 'react-icons/bs';
import { TiArrowBack } from 'react-icons/ti';
// import Picker from 'emoji-picker-react';
import React, { useContext , useState, useRef, useEffect} from 'react';
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
	formatTime,
	typingUsers,
	emojiPickerRef,
	handleScroll,
	chatContainerRef,
	blockFriend,
	removeBlock,
	friendStatusRequest,
  } = useContext(ChatContext);

	const { profileData: currentuser } = useAuth();  // Current logged-in user
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

	const handleBlockClick = () => {
		console.log('friendStatusRequest => ', friendStatusRequest);
        if (friendStatusRequest === 'blocked') {
			console.log('Remove block');
            removeBlock();
        } else {
			console.log('block friend');
            blockFriend();
        }
    };

	return (
		<div className={`msg_chat ${isChatVisible ? '' : 'hidden'}`}>
		{selectedUser ? (
			<>
			<div className="freind-profile">
				<div className="section-profile">
				<TiArrowBack onClick={handleBackClick} className="TiArrowBack" />
					<Link href={`friend/${selectedUser.username}`} className='link_selectedUser_profile'>
					<img
						src={selectedUser.avatar}
						alt={selectedUser.username}
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
				<LiaGamepadSolid onClick={inviteToGame}  className="LiaGamepadSolid" />
				{friendStatusRequest === 'blocked' ? (
                <ImEyeBlocked onClick={handleBlockClick} className="ImEyeBlocked" />
				) : (
					<ImBlocked onClick={handleBlockClick} className="ImBlocked" />
				)}
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
					// className="message_input"
					className={`message_input ${friendStatusRequest === 'blocked' ? 'not-allowed' : ''}`}
					type="text"
					placeholder="Type a message..."
					//   onChange={e => setText(e.target.value)}
					onChange={e => {setText(e.target.value)
					}}
					value={text}
					onKeyDown={handleKeyPress}
					disabled={friendStatusRequest === 'blocked'}
					/>
				</div>
				{/* <div className="emoji" ref={emojiPickerRef}>
					<BsEmojiSmile className="BsEmojiSmile" onClick={() => setOpen(prev => !prev)} />
					{open && (
					<div className="Picker">
						<EmojiPicker onEmojiClick={handleEmojiClick} />
					</div>
					)}
				</div> */}
				<div className={`emoji ${friendStatusRequest === 'blocked' ? 'not-allowed' : ''}`} ref={emojiPickerRef}>
					<BsEmojiSmile 
						className="BsEmojiSmile" 
						onClick={() => {
							if (friendStatusRequest !== 'blocked') {
								setOpen(prev => !prev);
							}
						}} 
					/>
					
					{open && (
						<div className="Picker">
							<EmojiPicker 
							className='stylePicker' onEmojiClick={handleEmojiClick} />
							{/* <EmojiPicker className='stylePicker' onEmojiClick={handleEmojiClick} /> */}
						</div>
					)}
				</div>
				<button 
					// className="buttom-send" 
					className={`buttom-send ${friendStatusRequest === 'blocked' ? 'not-allowed' : ''}`}
					onClick={handleSendMessage}
					disabled={friendStatusRequest === 'blocked'}
				>
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
