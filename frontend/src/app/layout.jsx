'use client';

import { Inter } from 'next/font/google';
import { LoginProvider } from '@components/auth/loginContext';
import Navbar from '@/components/navbar/navAuth';
import Sidebar from '@/components/sidebar/sidebar';
import { WebSocketProvider } from '@/components/websocket/websocketContext';
import { NotificationProvider } from '@components/navbar/useNotificationContext';
import SkeletonTheme from 'react-loading-skeleton';
import Loading from './loading';

import '@/styles/globals.css';
import '@/styles/globalsTailwind.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
	if (!WebSocketProvider || !NotificationProvider || !LoginProvider) {
		throw new Error(
		'RootLayout must be used within a WebSocketProvider, NotificationProvider, and LoginProvider'
		);
	}

	return (
		<html lang="en">
		<body className={inter.className}>
			<WebSocketProvider url="ws://localhost:8000/ws/online/">
			<LoginProvider>
				<NotificationProvider>
				<div className="parent">
					<div className="SIDE-NAV">
						<Sidebar />
					</div>
					<div className="OTHERS">
						<Navbar />
						{children}
					</div>
				</div>
				</NotificationProvider>
			</LoginProvider>
			</WebSocketProvider>
		</body>
		</html>
	);
}



{/* send friend request, invite to game, invite to tournament, block    */}
{/* <div className="mt-2 divide-y rounded-lg">
	<ul className="py-0 text-sm text-gray-700 w-full">
	{friendStatusRequest === 'accepted' && (
		<>
		<li className="w-full py-3 px-4 bg-emerald-500 text-white text-sm text-center rounded-md cursor-pointer my-2 mt-0 hover:bg-emerald-600 transition flex items-center justify-center">
			<FaTrophy className="mr-2 size-5" /> Invite to Tournament
		</li>
		<li className="w-full py-3 px-4 bg-sky-500 text-white text-sm text-center rounded-md cursor-pointer my-2 hover:bg-sky-600 transition flex items-center justify-center">
			<FaGamepad className="mr-2 size-5" /> Invite to Game
		</li>
		</>
	)}

	{
		<div className="mt-6">
		{friendStatusRequest === 'no' && (
			<button
			onClick={sendFriendRequest}
			className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-all hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
			>
			Send Friend Request
			</button>
		)}

		{friendStatusRequest === 'pending' && (
			<div className="flex items-center space-x-2">
			<div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
			<span className="text-yellow-400">Friend Request Pending</span>
			</div>
		)}

		{friendStatusRequest === 'accepted' && (
			<div className="flex items-center space-x-2 text-green-400">
			<svg
				className="h-5 w-5"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M5 13l4 4L19 7"
				></path>
			</svg>
			<span>Friends</span>
			</div>
		)}

		{friendStatusRequest === 'rejected' && (
			<span className="text-red-400">Friend Request Rejected</span>
		)}
		</div>
	}

	{friendStatusRequest === 'pending' && (
		<li className="w-full py-3 px-4 bg-gray-500 text-white text-sm text-center rounded-md cursor-pointer my-2 hover:bg-gray-600 transition flex items-center justify-center">
		Pending
		</li>
	)}
	{friendStatusRequest === 'accepted' && (
		<div>
		<li
			onClick={blockFriend}
			className="w-full py-3 px-4 bg-rose-500 text-white text-sm text-center rounded-md cursor-pointer my-2 hover:bg-rose-600 transition flex items-center justify-center"
		>
			<FaBan className="mr-2 size-5" /> Block
		</li>
		<li
			onClick={removeFriend}
			className="w-full py-3 px-4 bg-orange-500 text-white text-sm text-center rounded-md cursor-pointer my-2 hover:bg-orange-600 transition flex items-center justify-center"
		>
			<IoPersonRemove className="mr-2 size-5" /> Remove Friend
		</li>
		</div>
	)}
	{friendStatusRequest === 'blocked' && (
		<div>
		<li
			onClick={removeBlock}
			className="w-full py-3 px-4 bg-yellow-500 text-white text-sm text-center rounded-md cursor-pointer my-2 hover:bg-yellow-600 transition flex items-center justify-center"
		>
			<MdDoNotDisturbOff className="mr-2 size-5" /> Remove Block
		</li>
		</div>
	)}
	</ul>
</div> */}
