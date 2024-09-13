'use client';
import { Inter } from 'next/font/google';
import { LoginProvider } from '@components/auth/loginContext';
import Navbar from '@/components/navbar/navAuth';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/sidebar/sidebar';
import { WebSocketProvider } from '@/components/websocket/websocketContext';

import '@/styles/globals.css';
import '@/styles/globalsTailwind.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
	const pathname = usePathname();
	const isChatPage = pathname === '/chat';
	return (
		<html lang="en">
			<head>
				<meta charSet="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			</head>
			<WebSocketProvider url="ws://localhost:8000/ws/online/">
				<LoginProvider>
						<body className={inter.className}>
							{isChatPage ? (
								<div className="content">
								<Sidebar />
								{children}
								</div>
							) : (
								<>
								<Navbar />
								{children}
								</>
							)}
						</body>
				</LoginProvider>
			</WebSocketProvider>
		</html>
	);
}
