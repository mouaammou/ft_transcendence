'use client';

import { Inter } from 'next/font/google';
import { LoginProvider } from '@components/auth/loginContext';
import Navbar from '@/components/navbar/navAuth';
import Sidebar from '@/components/sidebar/sidebar';
import { WebSocketProvider } from '@/components/websocket/websocketContext';
import {NotificationProvider} from '@components/navbar/useNotificationContext';
import SkeletonTheme from 'react-loading-skeleton';
import Loading from './loading';

import '@/styles/globals.css';
import '@/styles/globalsTailwind.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {

	if (! WebSocketProvider || ! NotificationProvider || ! LoginProvider ) {
		throw new Error('RootLayout must be used within a WebSocketProvider, NotificationProvider, and LoginProvider');
	}

	return (
		<html lang="en">
			<body className={inter.className}>
				<WebSocketProvider url="ws://localhost:8000/ws/online/">
					<LoginProvider>
						<NotificationProvider>
							<div className='w-full h-full max-w-[100vw]'>
								{/* <Sidebar /> */}
								{/* <Navbar /> */}
								{children}
							</div>
						</NotificationProvider>
					</LoginProvider>
				</WebSocketProvider>
			</body>
		</html>
	);
}
