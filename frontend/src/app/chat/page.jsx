"use client";
import '@/Styles/chat/chat.css'
import '@/Styles/style-sidebar/sidebarMobil.css'
import React, { useState } from 'react';

import Msgchat from  '@/components/chat/msg/msg_chat'
import Listchat from '@/components/chat/list/list_chat'
import Sidebar from '@/components/sidebar/sidebar'

const Chat = () => {

	// const [chowMsgChat, setChowMsgChat] = useState("false");
	const [selectedUser, setSelectedUser] = useState('');
	const handleUserSelect = (user) => {
        setSelectedUser(user);
    };
	// const handelUserclick = ()=>{
	// 	if (window.innerWidth < 990)
	// 		setChowMsgChat(true);
	// }

	return (
			<div className="main-chat">
				{/* {<Listchat  onUserClick={handelUserclick} />} */}
				{<Listchat  onUserSelect={handleUserSelect} />}
				{/* {!chowMsgChat && <Listchat  onUserClick={handelUserclick} />} */}
				{<Msgchat selectedUser={setSelectedUser}/>}
				{/* {chowMsgChat && <Msgchat/>} */}
				{/* <div className='chat-mini-sidebare'> */}
				{<Sidebar/>}
				{/* </div> */}
			</div>
	 );
}

export default Chat;