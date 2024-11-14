'use client';

import { Inter } from 'next/font/google';
import { LoginProvider, useAuth } from '@components/auth/loginContext';
import { WebSocketProvider } from '@/components/websocket/websocketContext';
import { NotificationProvider } from '@components/navbar/useNotificationContext';
import SkeletonTheme from 'react-loading-skeleton';
import Loading from './loading';
import MainLayout from '@/components/main/main-layout';

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
					<MainLayout children={children}/>
				</NotificationProvider>
			</LoginProvider>
			</WebSocketProvider>
		</body>
		</html>
	);
}

