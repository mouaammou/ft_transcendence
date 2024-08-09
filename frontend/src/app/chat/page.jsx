"use client";
import '@/Styles/chat/chat.css'
import '@/Styles/style-sidebar/sidebarMobil.css'
import Msgchat from  '@/components/chat/msg/msg_chat'
import Listchat from '@/components/chat/list/list_chat'
import Sidebar from '@/components/sidebar/sidebar'
import { ChatProvider } from './chat_context/ChatContext';

import {ChatContext} from '@/app/chat/chat_context/ChatContext'
import React, { useContext } from 'react';


const Chat = () => {


	return (
		<ChatProvider>
			<div className="main-chat">
				<Listchat />
				<Msgchat />
				<Sidebar />
			</div>
		</ChatProvider>
	);
}

export default Chat;