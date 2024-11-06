"use client";
import { useEffect, useState, useCallback } from 'react';
import { IoIosNotificationsOutline } from 'react-icons/io';
import { IoCheckmarkDoneOutline } from "react-icons/io5";
import { IoCheckmarkOutline } from "react-icons/io5";
import Link from 'next/link';
import { postData } from '@/services/apiCalls';
import useNotifications from '@components/navbar/useNotificationContext';

export const NotificationLayout = ({ data, MarkAsRead, NOTIFICATION_TYPES }) => {
	const { sendMessage } = useNotifications();
	const [status, setStatus] = useState(data.notif_status);
	const [isActedUpon, setIsActedUpon] = useState(false);

	// Function to send friend request actions
	const sendAction = useCallback((action) => {
		const messageType = action === 'accepted' ? NOTIFICATION_TYPES.ACCEPT_FRIEND : NOTIFICATION_TYPES.REJECT_FRIEND;
		sendMessage(JSON.stringify({
			type: messageType,
			to_user_id: data.sender,
		}));
	}, [data.sender, NOTIFICATION_TYPES, sendMessage]);

	// Function to handle the accept/reject actions
	const handleAction = (action) => {
		setStatus(action);
		setIsActedUpon(true);
		sendAction(action);
		handleMarkAsRead();
	};

	// Function to mark notifications as read
	const handleMarkAsRead = () => {
		MarkAsRead(data.id);
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
				{status === 'pending' && !isActedUpon && (
					<>
						<button
							className="inline-flex mr-2 px-2.5 py-1.5 text-xs font-medium text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none"
							onClick={() => handleAction('accepted')}
						>
							Accept
						</button>
						<button
							className="inline-flex px-2.5 py-1.5 text-xs font-medium text-center text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 focus:ring-4 focus:outline-none"
							onClick={() => handleAction('rejected')}
						>
							Reject
						</button>
					</>
				)}
				{isActedUpon && (
					<span className={`inline-flex mr-2 px-2.5 py-1.5 text-xs font-medium text-center text-white ${status === 'accepted' ? 'bg-green-600' : 'bg-red-600'} rounded-lg`}>
						{status}
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
	const { notifications, UnreadNotifications, unreadCount, markAsRead, NOTIFICATION_TYPES } = useNotifications();
	const [isOpen, setIsOpen] = useState(false);

	// Fetch unread notifications on component mount
	useEffect(() => {
		UnreadNotifications();
	}, [unreadCount]);

	// Toggle notification bell dropdown
	const toggleDropdown = () => setIsOpen((prev) => !prev);

	return (
		<div>
			<div className="notifications absolute right-40 top-4">
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
					{notifications?.map((notification) => {
						return (
							<NotificationLayout
								key={notification.id}
								data={notification}
								MarkAsRead={markAsRead}
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
