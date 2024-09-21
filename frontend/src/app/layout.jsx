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
			<body className={inter.className}>
				<WebSocketProvider url="ws://localhost:8000/ws/online/">
					<LoginProvider>
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
					</LoginProvider>
				</WebSocketProvider>
			</body>
		</html>
	);
}
