"use client";
import '@/Styles/chat/chat.css'

import Msgchat from  '@/components/chat/msg/msg_chat'
import Listchat from '@/components/chat/list/list_chat'

const Chat = () => {
	return (
		
		<div className="main-chat">
			<Listchat/>
			<Msgchat/>
		</div>
		
	 );
}

export default Chat;