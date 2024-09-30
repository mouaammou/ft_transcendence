import { useEffect, useState } from 'react';
import { IoIosNotificationsOutline } from 'react-icons/io';
import { IoCheckmarkDoneOutline } from "react-icons/io5";
import { IoCheckmarkOutline } from "react-icons/io5";
import Link from 'next/link';
import { useWebSocketContext } from '@/components/websocket/websocketContext';

const NotificationLayout = ({ data, websocket, onMarkAsRead, notificationType, listOfNotifications }) => {
	// Retrieve status from localStorage or default to 'Pending'
	const getStatusFromLocalStorage = () => {
		const storedStatus = localStorage.getItem(`notification_status_${data.id}`);
		// Check if the notification type is a friendship request or if local storage doesn't have a status
		return (notificationType.type === listOfNotifications.friendship && !storedStatus) 
			? 'Pending'
			: storedStatus;
	};

	const [status, setStatus] = useState(() => getStatusFromLocalStorage());

	console.log('notificationType', notificationType);

	// Save status to localStorage whenever it changes
	useEffect(() => {
		// will change this localStorage to something more efficient ?????
		localStorage.setItem(`notification_status_${data.id}`, status);
	}, [status, data.id]);

	const handleAction = (action) => {
		setStatus(action); // Update local state
		if (websocket.current) {
			const messageType = action === 'Accepted' ? 'accept_friend_request' : 'reject_friend_request';
			websocket.current.send(JSON.stringify({
				type: messageType,
				to_user_id: data.to_user_id,
			}));
			console.log(`SEND ${action} friend request`);
		}
	};

	const handleMarkAsRead = () => {
		setTimeout(() => {
			onMarkAsRead(data.id);
			//remove from local storage
			localStorage.removeItem(`notification_status_${data.id}`);
		}, 300);
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
			{(status === 'Pending') //
			&&
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
			}
			{(notificationType.type == listOfNotifications.acceptFriend) && 
				<>
				<span className={`inline-flex mr-2 px-2.5 py-1.5 text-xs font-medium text-center text-white ${notificationType.status ? 'bg-green-600' : 'bg-red-600'} rounded-lg`}>
					{notificationType.status ? 'Accepted' : 'Rejected'}
				</span>
				</>
			}
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
	const { websocket, notifications, setNotifications, notificationType, listOfNotifications } = useWebSocketContext();

	const markAsRead = (id) => {//i need  to add post the isread to notification
		setNotifications((prev) =>
			prev.filter((notif) => notif.id !== id)
		);
	};

	return (
		<div>
			{/* Notification Bell Icon */}
			<div className="notifications absolute right-40 top-4">
				<div className="relative">
					<IoIosNotificationsOutline
						className="text-[2.2rem] text-white hover:text-gray-400 transition duration-200 cursor-pointer"
						onClick={() => setIsOpen(!isOpen)}
					/>
					{/* Notification Badge */}
					<span className={`absolute top-0 right-0 inline-flex items-center justify-center px-1 py-0.5 text-xs font-bold leading-none text-white rounded-full ${
						notifications.filter((notif) => !notif.isRead).length > 0 ? 'bg-red-600' : 'bg-gray-500'
					}`}>
						{notifications.filter((notif) => !notif.isRead).length}
					</span>
				</div>
			</div>
			{/* Notification Dropdown */}
			{isOpen && (
				<>
				<div
					className="main-div overflow-y-scroll max-h-52 w-96 absolute right-40 top-5 mt-10 p-4 rounded-lg shadow-lg bg-gray-800 text-gray-400 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-700">
					<div className='w-full mb-3'>
						<button className="text-blue-500 text-xs font-semibold capitalize hover:text-blue-200 transition-all float-start">
							<IoCheckmarkDoneOutline className="text-[1.2rem] mr-1" />
						</button>
						<Link href="/notifications"
							className="text-green-500 text-xs font-semibold  capitalize float-end hover:text-green-300 transition-all">
							see all
						</Link>
					</div>
					{notifications.slice().reverse().map((notification) => (
						<NotificationLayout
							notificationType={notificationType}
							key={notification.id}
							data={notification}
							websocket={websocket}
							onMarkAsRead={markAsRead}
							listOfNotifications={listOfNotifications}
						/>
					))}
					{notifications.length === 0 && (
						<div className="p-4 text-white text-center">
							<span className="text-sm font-normal text-gray-400">
								No notifications
							</span>
						</div>
					)}
				</div>
				</>
			)}
		</div>
	);
};

export default NotificationBell;
