import '@/styles/chat/msg.css';

import Image from 'next/image';
import { LiaGamepadSolid } from 'react-icons/lia';
import { ImBlocked } from 'react-icons/im';
import { ImEyeBlocked } from "react-icons/im";
import { BsSendFill } from 'react-icons/bs';
import EmojiPicker from 'emoji-picker-react';
import { BsEmojiSmile } from 'react-icons/bs';
import { TiArrowBack } from 'react-icons/ti';
import React, { useContext , useState, useRef, useEffect} from 'react';
import { ChatContext } from '@/app/chat/chat_context/ChatContext';

import { useAuth } from '@/components/auth/loginContext.jsx';
import useNotificationContext from '@/components/navbar/useNotificationContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getData } from '@/services/apiCalls';


// ChatActions.jsx - Separate component
// ChatActions.jsx
// Update ChatActions to use the passed status:
const ChatActions = ({ selectedUser, blockFriend, removeBlock, inviteToGame, currentStatus }) => {
    const friendshipStatus = currentStatus || selectedUser?.friendship_status;

    // Same logic as FriendProfile: show unblock button only when you blocked them (blocking)
    if (friendshipStatus === 'blocking') {
        return (
            <div className="section_action">
                <ImEyeBlocked onClick={removeBlock} className="ImEyeBlocked" />
            </div>
        );
    }

    // Show both buttons only when in accepted state (like FriendProfile)
    if (friendshipStatus === 'accepted') {
        return (
            <div className="section_action">
                <LiaGamepadSolid onClick={inviteToGame} className="LiaGamepadSolid" />
                <ImBlocked onClick={blockFriend} className="ImBlocked" />
            </div>
        );
    }

    // For blocked state or any other state, show nothing (like FriendProfile)
    return <div className="section_action"></div>;
};

// ChatInput.jsx - Separate component
const ChatInput = ({ 
    text, 
    setText, 
    handleSendMessage, 
    handleKeyPress, 
    open,
    setOpen,
    handleEmojiClick,
    emojiPickerRef,
    selectedUser 
}) => {
    const friendshipStatus = selectedUser?.friendship_status;
    const isDisabled = ['blocking', 'blocked'].includes(friendshipStatus);
    
    const getPlaceholderText = () => {
        if (friendshipStatus === 'blocking') return "Unblock this user to send messages";
        if (friendshipStatus === 'blocked') return "You can't send messages to this user";
        return "Type a message...";
    };

    return (
        <div className="bottom-chat">
            <div className="div_message_input">
                <input
                    className="message_input"
                    type="text"
                    placeholder={getPlaceholderText()}
                    onChange={e => setText(e.target.value)}
                    value={text}
                    onKeyDown={handleKeyPress}
                    disabled={isDisabled}
                />
            </div>
            <div className="emoji" ref={emojiPickerRef}>
                <BsEmojiSmile 
                    className={`BsEmojiSmile ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => {
                        if (!isDisabled) {
                            setOpen(prev => !prev);
                        }
                    }} 
                />
                {open && !isDisabled && (
                    <div className="Picker">
                        <EmojiPicker className='stylePicker' onEmojiClick={handleEmojiClick} />
                    </div>
                )}
            </div>
            <button 
                className={`buttom-send ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleSendMessage}
                disabled={isDisabled}
            >
                <BsSendFill className="send-icon" />
            </button>
        </div>
    );
};

// Msg_chat.jsx - Main component
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
        formatTime,
        typingUsers,
        emojiPickerRef,
        handleScroll,
        chatContainerRef,
        blockFriend,
        removeBlock,
    } = useContext(ChatContext);

    const { profileData: currentuser, setSelectedUser } = useAuth();
    const { isConnected, sendMessage, NOTIFICATION_TYPES } = useNotificationContext();
    const router = useRouter();

    const inviteToGame = () => {
        if (selectedUser?.id) {
            setSelectedUser(selectedUser);
            if (isConnected) {
                sendMessage(JSON.stringify({
                    type: NOTIFICATION_TYPES.INVITE_GAME,
                    to_user_id: selectedUser.id,
                }));
            }
            router.push('/waiting_friends_game');
        }
    };

	useEffect(() => {
		console.log("selectedUser", selectedUser);
		console.log("status", selectedUser?.friendship_status);
	}, [selectedUser]);



    const [userStatus, setUserStatus] = useState(selectedUser?.friendship_status);

    useEffect(() => {
        if (selectedUser?.friendship_status) {
            setUserStatus(selectedUser.friendship_status);
        }
    }, [selectedUser?.friendship_status]);

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
						{typingUsers.includes(selectedUser.username) && (
							<p className="typing-indicator">Typing...</p>
						)}
					</div>
					
					<ChatActions 
                            selectedUser={selectedUser}
                            blockFriend={blockFriend}
                            removeBlock={removeBlock}
                            inviteToGame={inviteToGame}
                            currentStatus={userStatus}  // Pass the status
                        />
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

				<div ref={endRef}></div>
				</div>
				{/* New ChatInput component */}
				<ChatInput 
                            text={text}
                            setText={setText}
                            handleSendMessage={handleSendMessage}
                            handleKeyPress={handleKeyPress}
                            open={open}
                            setOpen={setOpen}
                            handleEmojiClick={handleEmojiClick}
                            emojiPickerRef={emojiPickerRef}
                            selectedUser={selectedUser}
                        />
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
