"use client";
import '@/Styles/chat/chat.css'
import '@/Styles/style-sidebar/MobileSidebar.css'
import Msgchat from  '@/components/chat/msg/msg_chat'
import Listchat from '@/components/chat/list/list_chat'
// import Sidebar from '@/components/sidebar/sidebar'
import MobileSidebar from '@/components/sidebar/MobileSidebar'
import { ChatProvider } from './chat_context/ChatContext';


const Chat = () => {


	return (
		<ChatProvider>
			<div className="main-chat">
				<Listchat />
				<Msgchat />
				<MobileSidebar />
			</div>
		</ChatProvider>
	);
}

export default Chat;