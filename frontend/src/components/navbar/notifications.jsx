import { useEffect, useState, useCallback } from 'react';
import { IoIosNotificationsOutline } from 'react-icons/io';
import { IoCheckmarkDoneOutline } from "react-icons/io5";
import { IoCheckmarkOutline } from "react-icons/io5";
import Link from 'next/link';
import { useWebSocketContext } from '@/components/websocket/websocketContext';
import { getData, postData } from '@/services/apiCalls';

const NotificationLayout = ({ data, websocket, onMarkAsRead, notificationType, NOTIFICATION_TYPES }) => {
	const [status, setStatus] = useState(data.notif_status);

	console.log("Notification Data: ", data);

	// Function to handle action and send a WebSocket message
	const handleAction = (action) => {
		setStatus(action);
		if (websocket.current) {
			const messageType = action === 'Accepted' ? 'accept_friend_request' : 'reject_friend_request';
			websocket.current.send(JSON.stringify({
				type: messageType,
				to_user_id: data.to_user_id,
			}));
		}
	};

	//mark notification as read
	const markAsRead = useCallback(async (notificationId) => {
		try {
			await postData(`/notifications/${notificationId}/read`, {});
			console.log('Notification marked as read:', notificationId);
		} catch (error) {
			console.error('Error marking notification as read:', error);
		}
	}, []);

	// Mark notification as read
	const handleMarkAsRead = () => {
		setTimeout(() => {
			onMarkAsRead(data.id);
		}, 300);

		markAsRead(data.id);
	};

	return (
		<div className="flex p-4 w-full max-w-96 border-b mt-2 border-gray-700 relative">
			<img className="w-10 h-10 rounded-lg" src={data.avatar} alt="avatar" />
			<div className="ml-3 text-sm font-normal">
				<span className="mb-1 text-sm font-semibold text-white">
					<Link href={`/${data.username}`}>
						{data.username}
					</Link>
				</span>
				<div className="mb-2 text-sm font-normal max-w-52">
					{data.message}
				</div>
				{status === 'pending' && (
					<>
						<button
							className="inline-flex mr-2 px-2.5 py-1.5 text-xs font-medium text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none"
							onClick={() => {
								handleAction('Accepted'); 
								handleMarkAsRead();
							}}
						>
							Accept
						</button>
						<button
							className="inline-flex px-2.5 py-1.5 text-xs font-medium text-center text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 focus:ring-4 focus:outline-none"
							onClick={() => {
								handleAction('Rejected');
								handleMarkAsRead();
							}}
						>
							Reject
						</button>
					</>
				)}
				{notificationType.type === NOTIFICATION_TYPES.ACCEPT_FRIEND && (
					<span className={`inline-flex mr-2 px-2.5 py-1.5 text-xs font-medium text-center text-white ${notificationType.status ? 'bg-green-600' : 'bg-red-600'} rounded-lg`}>
						{notificationType.status ? 'Accepted' : 'Rejected'}
					</span>
				)}
				<button
					className="ml-2 inline-flex px-2.5 py-1.5 text-xs font-medium text-center text-white bg-gray-600 rounded-lg hover:bg-gray-700 focus:ring-4 outline-none absolute right-4 top-8"
					onClick={handleMarkAsRead}
				>
					<IoCheckmarkOutline className="text-[1.2rem] mr-1" />
				</button>
			</div>
		</div>
	);
};

const NotificationBell = () => {
	const [isOpen, setIsOpen] = useState(false);
	const { websocket, notifications, setNotifications, notificationType, NOTIFICATION_TYPES } = useWebSocketContext();

	// Fetch unread notifications with memoized function
	const getUnreadNotifications = useCallback(async () => {
		try {
			const response = await getData('/notifications/unread');
			if (response.status === 200) {
				console.log('Unread notifications:', response.data.results);
				setNotifications((prev) => [...prev, ...response.data.results]);
			}
		} catch (error) {
			console.error('Error fetching unread notifications:', error);
		}
	}, [setNotifications]);

	// Fetch unread notifications on component mount
	useEffect(() => {
		getUnreadNotifications();
	}, [getUnreadNotifications]);

	// Mark notification as read
	const markAsRead = (id) => {
		setNotifications((prev) =>
			prev.map((notif) =>
				notif.id === id ? { ...notif, isRead: true } : notif
			).filter((notif) => !notif.isRead)
		);
	};

	return (
		<div>
			<div className="notifications absolute right-40 top-4">
				<div className="relative">
					<IoIosNotificationsOutline
						className="text-[2.2rem] text-white hover:text-gray-400 transition duration-200 cursor-pointer"
						onClick={() => setIsOpen(!isOpen)}
					/>
					<span className={`absolute top-0 right-0 inline-flex items-center justify-center px-1 py-0.5 text-xs font-bold leading-none text-white rounded-full ${
						notifications?.filter((notif) => !notif.isRead).length > 0 ? 'bg-red-600' : 'bg-gray-500'
					}`}>
						{notifications?.filter((notif) => !notif.isRead).length}
					</span>
				</div>
			</div>
			{isOpen && (
				<div className="main-div overflow-y-scroll max-h-52 w-96 absolute right-40 top-5 mt-10 p-4 rounded-lg shadow-lg bg-gray-800 text-gray-400 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-700">
					<div className='w-full mb-3'>
						<button className="text-blue-500 text-xs font-semibold capitalize hover:text-blue-200 transition-all float-start">
							<IoCheckmarkDoneOutline className="text-[1.2rem] mr-1" />
						</button>
						<Link href="/notifications" className="text-green-500 text-xs font-semibold capitalize float-end hover:text-green-700 transition-all">
							See all
						</Link>
					</div>
					{notifications?.slice().reverse().map((notification, index) => {
						console.log("Notification Type: ", typeof notification);
						console.log("Notification: ", notification);
						return (
							<NotificationLayout
								data={notification}
								notificationType={notificationType}
								key={notification.id}
								websocket={websocket}
								onMarkAsRead={markAsRead}
								NOTIFICATION_TYPES={NOTIFICATION_TYPES}
							/>
					)
					})}
					{notifications?.length === 0 && (
						<div className="p-4 text-white text-center">
							<span className="text-sm font-normal text-gray-400">
								No notifications
							</span>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default NotificationBell;
