"use client";
import '@/Styles/chat/chat.css'
import '@/Styles/style-sidebar/sidebarMobil.css'
import React, { useState , useEffect} from 'react';

import Msgchat from  '@/components/chat/msg/msg_chat'
import Listchat from '@/components/chat/list/list_chat'
import Sidebar from '@/components/sidebar/sidebar'

const Chat = () => {

	const [selectedUser, setSelectedUser] = useState(null);
	// useEffect(() =>{
	// 	console.log('hello', selectedUser);
	// }, [selectedUser]);
	
	return (
			<div className="main-chat">
				<Listchat  onUserSelect={setSelectedUser} />
				<Msgchat selectedUser={selectedUser}/>
				<Sidebar/>
			</div>
	 );
}

export default Chat;