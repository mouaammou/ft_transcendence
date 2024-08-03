"use client";
import '@/Styles/chat/chat.css'
import '@/Styles/style-sidebar/sidebarMobil.css'
import React, { useState , useEffect} from 'react';

import Msgchat from  '@/components/chat/msg/msg_chat'
import Listchat from '@/components/chat/list/list_chat'
import Sidebar from '@/components/sidebar/sidebar'

const Chat = () => {

	const [selectedUser, setSelectedUser] = useState(null);
	const [isChatVisible, setIsChatVisible] = useState(false);
	// useEffect(() =>{
	// 	console.log('hello', selectedUser);
	// }, [selectedUser]);
	const handleUserClick = (user) => {
		setSelectedUser(user);
		// console.log("the is the user" ,user);
		
		setIsChatVisible(true);
	};
	const handleBackClick = () => {
        setIsChatVisible(false);
    };

	return (
		<div className="main-chat">
			<Listchat  onUserSelect={handleUserClick} isChatVisible={isChatVisible} />
			{/* <Msgchat selectedUser={selectedUser} isChatVisible={isChatVisible} /> */}
			<Msgchat selectedUser={selectedUser} onBackClick={handleBackClick} isChatVisible={isChatVisible}/>
			<Sidebar isChatVisible={isChatVisible} />
		</div>
	);
}

export default Chat;