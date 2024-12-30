'use client';

import { Inter } from 'next/font/google';
import { LoginProvider, useAuth } from '@components/auth/loginContext';
import { WebSocketProvider } from '@/components/websocket/websocketContext';
import { NotificationProvider } from '@components/navbar/useNotificationContext';
import MainLayout from '@/components/main/main-layout';

import '@/styles/globals.css';
import '@/styles/globalsTailwind.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {

	if (!WebSocketProvider || !NotificationProvider || !LoginProvider) {
		throw new Error('RootLayout must be used within a WebSocketProvider, NotificationProvider, and LoginProvider');
	}

	return (
		<html lang="en">
			<body className={inter.className}>
				<WebSocketProvider url={`${process.env.NEXT_PUBLIC_WEBSOCKET_URL}/ws/online/`}>
					<LoginProvider>
						<NotificationProvider>
							<MainLayout children={children} />
						</NotificationProvider>
					</LoginProvider>
				</WebSocketProvider>
			</body>
		</html>
	);
}

