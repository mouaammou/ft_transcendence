"use client";
import '@/Styles/chat/chat.css'
import '@/Styles/style-sidebar/sidebarMobil.css'

import Msgchat from  '@/components/chat/msg/msg_chat'
import Listchat from '@/components/chat/list/list_chat'
import Sidebar from '@/components/sidebar/sidebar'

const Chat = () => {
	return (
				<div className="main-chat">
					<Listchat/>
					<Msgchat/>
					{/* <div className='chat-mini-sidebare'> */}
						<Sidebar/>
					{/* </div> */}
				</div>
	 );
}

export default Chat;