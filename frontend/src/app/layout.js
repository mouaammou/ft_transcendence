'use client';

import { Inter } from 'next/font/google';
import { LoginProvider, useAuth } from '@components/auth/loginContext';
import { WebSocketProvider } from '@/components/websocket/websocketContext';
import { NotificationProvider } from '@components/navbar/useNotificationContext';
import MainLayout from '@/components/main/main-layout';

import '@/styles/globals.css';
import '@/styles/globalsTailwind.css';

import { Toaster } from 'react-hot-toast';
const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {

	return (
		<html lang="en">
			<body className={inter.className}>
				<WebSocketProvider url={`${process.env.NEXT_PUBLIC_WEBSOCKET_URL}/ws/online/`}>
					<LoginProvider>
						<NotificationProvider>
						<Toaster
							containerStyle={{
							position: 'absolute',
							top: 16,
							right: 16,
							zIndex: 9999
							}}
							toastOptions={{
							duration: 3000,
							style: {
								backgroundColor: '#333',
								color: '#fff',
								padding: '16px',
								borderRadius: '8px',
								fontSize: '14px',
							},
							success: {
								duration: 3000,
								iconTheme: {
								primary: '#10B981',
								secondary: '#fff',
								},
								style: {
								backgroundColor: '#065F46',
								},
							},
							error: {
								duration: 3000,
								iconTheme: {
								primary: '#EF4444',
								secondary: '#fff',
								},
								style: {
								backgroundColor: '#991B1B',
								},
							},
							}}
						/>
						<MainLayout children={children} />
						</NotificationProvider>
					</LoginProvider>
				</WebSocketProvider>
			</body>
		</html>
	);
}

