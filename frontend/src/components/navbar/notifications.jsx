"use client";
import { useEffect, useState, useCallback } from 'react';
import { IoIosNotificationsOutline } from 'react-icons/io';
import { IoCheckmarkDoneOutline } from "react-icons/io5";
import { IoCheckmarkOutline } from "react-icons/io5";
import Link from 'next/link';
import useNotificationContext from '@components/navbar/useNotificationContext';

const NotificationLayout = ({ data, notifStatus, handleAction, NOTIFICATION_TYPES }) => {
	const { sendMessage } = useNotificationContext();

	const sendAction = useCallback((action) => {
		const messageType = action === 'accepted' ? NOTIFICATION_TYPES.ACCEPT_FRIEND : NOTIFICATION_TYPES.REJECT_FRIEND;
		sendMessage(JSON.stringify({
			type: messageType,
			to_user_id: data.sender,
		}));
	}, [data.sender, NOTIFICATION_TYPES, sendMessage]);

	const onAction = (action, id) => {
		handleAction(action, id);
		sendAction(action);
	}

	const handleMarkAsRead = () => {
		handleAction('read', data.id);
	};

	return (
		<div className="group relative mt-2 flex w-full max-w-96 border-b border-gray-700/30 p-4 transition-all duration-300 hover:bg-gray-800/30">
			<div className="transition-transform duration-300 group-hover:scale-105">
			<img 
				className="h-10 w-10 rounded-lg object-cover ring-2 ring-blue-500/30 transition-all duration-300 group-hover:ring-blue-500" 
				src={data.avatar} 
				alt="avatar" 
			/>
			</div>
			
			<div className="ml-4 text-sm font-normal">
			<Link 
				href={`/${data.username}`}
				className="mb-1 text-sm font-semibold text-white transition-colors duration-300 hover:text-blue-400"
			>
				{data.username}
			</Link>
			
			<div className="mb-3 mt-1 max-w-52 text-sm font-normal text-gray-300">
				{data.message}
			</div>
			
			{/* Only show action buttons for pending status */}
			{notifStatus === 'pending' && (
				<div className="flex items-center gap-2">
					<button
					className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-all duration-300 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95"
					onClick={() => onAction('accepted', data.id)}
					>
					Accept
					</button>
					<button
					className="inline-flex items-center rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-all duration-300 hover:bg-red-700 hover:shadow-lg hover:shadow-red-500/20 active:scale-95"
					onClick={() => onAction('rejected', data.id)}
					>
					Reject
					</button>
				</div>
			)}
			</div>

			{/* Only show mark as read button for non-pending notifications */}
			{notifStatus !== 'pending' && (
			<button
				className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-lg bg-gray-700 px-3 py-1.5 text-xs font-medium text-white opacity-0 transition-all duration-300 hover:bg-gray-600 group-hover:opacity-100"
				onClick={handleMarkAsRead}
			>
				<IoCheckmarkOutline className="text-base" />
				Mark as read
			</button>
			)}
		</div>
	);
};

const NotificationBell = () => {
	const { notifications, UnreadNotifications, unreadCount, markAsRead, NOTIFICATION_TYPES, setNotifications } = useNotificationContext();
	const [isOpen, setIsOpen] = useState(false);

	const handleAction = useCallback((notif_status, id) => {
		if (notif_status !== 'read')
			setNotifications((prev) => {
				return prev.map((notif) => {
					if (notif.id === id) {
						return {
							...notif,
							notif_status: notif_status,
						};
					}
					return notif;
				});
			});
		markAsRead(id);
	}, [markAsRead]);


	// Fetch unread notifications on component mount
	useEffect(() => {
		UnreadNotifications();
	}, []);

	// Toggle notification bell dropdown
	const toggleDropdown = () => setIsOpen((prev) => !prev);

	return (
		<div>
			<div className="notifications">
				<div className="relative">
					<IoIosNotificationsOutline
						className="text-[2.2rem] text-white hover:text-gray-400 transition duration-200 cursor-pointer"
						onClick={toggleDropdown}
					/>
					<span className={`absolute top-0 right-0 inline-flex items-center justify-center px-1 py-0.5 text-xs font-bold leading-none text-white rounded-full ${
						unreadCount > 0 ? 'bg-red-600' : 'bg-gray-500'
					}`}>
						{unreadCount}
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
					{notifications?.map((notification, index) => {
						// console.log(notifStatuses);
						return (
							<NotificationLayout
								key={index}
								data={notification}
								notifStatus={notification.notif_status}
								handleAction={handleAction}
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
