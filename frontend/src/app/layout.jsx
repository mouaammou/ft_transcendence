'use client';

import { Inter } from 'next/font/google';
import { LoginProvider } from '@components/auth/loginContext';
import Navbar from '@/components/navbar/navAuth';
import Sidebar from '@/components/sidebar/sidebar';
import { WebSocketProvider } from '@/components/websocket/websocketContext';
import {NotificationProvider} from '@components/navbar/useNotificationContext';

import '@/styles/globals.css';
import '@/styles/globalsTailwind.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {

	return (
		<html lang="en">
			<body className={inter.className}>
				<WebSocketProvider url="ws://localhost:8000/ws/online/">
					<LoginProvider>
						<NotificationProvider>
							<div>
								<Sidebar />
								<Navbar />
								{children}
							</div>
						</NotificationProvider>
					</LoginProvider>
				</WebSocketProvider>
			</body>
		</html>
	);
}
