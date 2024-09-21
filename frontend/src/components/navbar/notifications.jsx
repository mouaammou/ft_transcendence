"use client";
import { useEffect, useState } from 'react';
import { IoIosNotificationsOutline } from 'react-icons/io';
import Link from 'next/link';
import { useWebSocketContext } from '@/components/websocket/websocketContext';

const FriendRequestNotification = ({data}) => {

	return (
		<div className="flex p-4 w-96 border-b border-gray-700">
			<img
			className="w-8 h-8 rounded-full"
			src={data.avatar}
			alt="Jese Leos"
			/>
			<div className="ml-3 text-sm font-normal">
				<span className="mb-1 text-sm font-semibold text-white">
					<Link href={`/${data.username}`}>
						{data.username}
					</Link>
				</span>
				<div className="mb-2 text-sm font-normal">
					{data.message}
				</div>
				{data.success && (
					<>
						<Link
							href="#"
							className="inline-flex mr-2 px-2.5 py-1.5 text-xs font-medium text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none"
						>
							Accept
						</Link>
						<Link
							href="#"
							className="inline-flex px-2.5 py-1.5 text-xs font-medium text-center text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 focus:ring-4 focus:outline-none"
						>
							Decline
						</Link>
					</>)}
			</div>
		</div>
	)
}


const NotificationBell = () => {
	const [isOpen, setIsOpen] = useState(false);
	const { isConnected, websocket } = useWebSocketContext();
	const [notifications, setNotifications] = useState([]);

	useEffect(() => {
		if (isConnected && websocket.current) {
			const handleMessage = (event) => {
				const data = JSON.parse(event.data);
				console.log('Message received:: handle message:: ', data);
				if (data.type === 'friend_request_sent') {
					//add new component to the notification dropdown
					setNotifications((prev) => [...prev, data]);
				}
			};
			websocket.current.addEventListener('message', handleMessage);
			// Clean up the event listener when the component unmounts or when isConnected changes
			return () => {
				websocket.current.removeEventListener('message', handleMessage);
			};
		}
	}, [isConnected]); // This effect runs when isConnected changes

	const toggleNotifications = () => {
		setIsOpen(!isOpen);
	};

	return (
		<div className="">
			{/* Notification Bell Icon */}
			<div className="notifications absolute right-40 top-4">
				<div className="relative">
					<IoIosNotificationsOutline
						className="text-[2.2rem] text-white hover:text-gray-400 transition duration-200 cursor-pointer"
						onClick={toggleNotifications}
					/>
					{/* Notification Badge */}
					<span className="absolute top-0 right-0 inline-flex items-center justify-center px-1 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
						1
					</span>
				</div>
			</div>
			{/* Notification Dropdown */}
			{isOpen && (
				<div
					onMouseLeave={() => setIsOpen(false)}
					id="toast-message-cta"
					className="main-div overflow-y-scroll max-h-52 absolute right-40 top-5 mt-10 p-4 rounded-lg shadow-lg bg-gray-800 text-gray-400 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-700"
					role="alert"
				>
					{notifications.map((notification, index) => (
						<FriendRequestNotification key={index} data={notification} />
					))}
					{notifications.length === 0 && (
						<div className="p-4 text-white text-center">
								No new notifications
						</div>
					)}
				</div>
				)}
		</div>
	);
};

export default NotificationBell;
