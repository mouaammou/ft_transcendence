"use client";
import { useEffect, useState } from 'react';
import { IoIosNotificationsOutline } from 'react-icons/io';
import Link from 'next/link';
import { useWebSocketContext } from '@/components/websocket/websocketContext';

const FriendRequestNotification = ({data, websocket, success}) => {

	const [isPending, setIsPending] = useState('Accept');

	const AceeptFriendRequest = (websocket) => {
		if (websocket.current) {
			setIsPending(true);
			console.log('Accept friend request :: ');
			websocket.current.send(
				JSON.stringify({
					type: 'accept_friend_request',
					to_user_id: data.to_user_id,
				})
			);
		}
	}

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
				{( ! success) ? (
					isPending === 'Accept' ? (
						<>
							<Link
								href="#"
								className="inline-flex mr-2 px-2.5 py-1.5 text-xs font-medium text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none"
								onClick={() => {
									AceeptFriendRequest(websocket);
									setIsPending('Request sent');
								}}
							>
								{isPending}
							</Link>
							<Link
								href="#"
								className="inline-flex px-2.5 py-1.5 text-xs font-medium text-center text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 focus:ring-4 focus:outline-none"
								onClick={() => setIsPending('Rejected')}
							>
								Reject
							</Link>
						</>
					) : (
						<Link
							href="#"
							className="inline-flex mr-2 px-2.5 py-1.5 text-xs font-medium text-center text-white bg-gray-600 rounded-lg hover:bg-gray-700 outline-none"
						>
							{isPending}
						</Link>)
					) : (
						<Link
							href="#"
							className="inline-flex mr-2 px-2.5 py-1.5 text-xs font-medium text-center text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-4 focus:outline-none"
						>
							Accepted !!!
						</Link>
					)	
					}
			</div>
		</div>
	)
}

const NotificationBell = () => {
	const [isOpen, setIsOpen] = useState(false);
	const { isConnected, websocket } = useWebSocketContext();
	const [notifications, setNotifications] = useState([]);
	const [isFriendRequest, setIsFriendRequest] = useState(true);
	const [acceptSuccess, setAcceptSuccess] = useState(false);

	useEffect(() => {
		if (isConnected && websocket.current) {
			const handleMessage = (event) => {
				const data = JSON.parse(event.data);
				console.log('Message received:: handle message:: ', data);
				if (data.type === 'friend_request_received') {
					//add new component to the notification dropdown
					setIsFriendRequest(true);
					setNotifications((prev) => [...prev, data]);
				}
				else if (data.type === 'accept_friend_request') {
					//add new component to the notification dropdown
					setIsFriendRequest(false);
					setNotifications((prev) => [...prev, data]);
					setAcceptSuccess(data.success)
				}
			};
			websocket.current.addEventListener('message', handleMessage);
			// Clean up the event listener when the component unmounts or when isConnected changes
			return () => {
				websocket.current.removeEventListener('message', handleMessage);
			};
		}
	}, [isConnected, websocket.current]); // This effect runs when isConnected changes

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
					{notifications.length > 0 ? (
						isFriendRequest ? (
						<span className="absolute top-0 right-0 inline-flex items-center justify-center px-1 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
							{notifications.length}
						</span>
						) : (
							<span className="absolute top-0 right-0 inline-flex items-center justify-center px-1 py-0.5 text-xs font-bold leading-none text-green-100 bg-green-600 rounded-full">
								{notifications.length}
							</span>
						)
					)
						: 
					(
						<span className="absolute top-0 right-0 inline-flex items-center justify-center px-1 py-0.5 text-xs font-bold leading-none text-gray-100 bg-gray-500 rounded-full">
							0
						</span>
					)}
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
						<FriendRequestNotification key={index} data={notification} websocket={websocket} success={acceptSuccess} />
					))}
					{notifications.length === 0 && (
						<div className="p-4 text-white text-center">
								No notifications
						</div>
					)}
				</div>
				)}
		</div>
	);
};

export default NotificationBell;
