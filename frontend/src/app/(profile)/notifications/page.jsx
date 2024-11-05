"use client";
// import { NotificationLayout } from "@/components/navbar/notifications";
import useNotifications from "@/components/navbar/useNotificationContext";
import { getData, postData } from "@/services/apiCalls";
import { useEffect, useState, useCallback } from "react";
import { IoCheckmarkOutline } from "react-icons/io5";
import Link from 'next/link';

const NotificationLayout = ({ data, websocket, MarkAsRead, NOTIFICATION_TYPES }) => {
	const [status, setStatus] = useState(data.notif_status);
	const [isRead, setIsRead] = useState(data.is_read || false); // Track read status
	const [isActedUpon, setIsActedUpon] = useState(false);

	console.log('Notification Data: in notifcation page:: ', data);

	const handleAction = async (action) => {
		setStatus(action);
		setIsActedUpon(true);
		handleMarkAsRead();
		if (websocket.current) {
			let messageType = '';
			if (action === 'accepted') messageType = NOTIFICATION_TYPES.ACCEPT_FRIEND;
			else if (action === 'rejected') messageType = NOTIFICATION_TYPES.REJECT_FRIEND;
			websocket.current.send(JSON.stringify({
				type: messageType,
				to_user_id: data.sender,
			}));
		}
	};

	const handleMarkAsRead = () => {
		setIsRead(true); // Set the notification as read locally
		MarkAsRead(data.id); // Call parent function to mark it on the server
	};

	return (
		<div className={`flex p-4 w-full max-w-96 border-b mt-2 relative 
			${isRead ? 'bg-gray-200' : 'bg-white'} transition-all duration-300`}>
			<img className="w-10 h-10 rounded-lg" src={data.avatar} alt="avatar" />
			<div className="ml-3 text-sm font-normal">
				<span className="mb-1 text-sm font-semibold text-gray-900">
					<Link href={`/${data.username}`}>
						{data.username}
					</Link>
				</span>
				<div className="mb-2 text-sm font-normal text-gray-700 max-w-52">
					{data.message}
				</div>
				{status === 'pending' && !isActedUpon && ! isRead && (
					<>
						<button
							className="inline-flex mr-2 px-2.5 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none"
							onClick={() => handleAction('accepted')}
						>
							Accept
						</button>
						<button
							className="inline-flex px-2.5 py-1.5 text-xs font-medium text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 focus:ring-4 focus:outline-none"
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
				{ ! isRead && status === 'accepted' &&
					<button
						className="ml-2 inline-flex px-2.5 py-1.5 text-xs font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700 focus:ring-4 outline-none absolute right-4 top-8"
						onClick={handleMarkAsRead}
					>
						<IoCheckmarkOutline className="text-[1.2rem] mr-1" />
					</button>
				}
			</div>
		</div>
	);
};


export default function NotificationsPage() {
	
	const { websocket, NOTIFICATION_TYPES } = useNotifications();

	const [notifications, setNotifications] = useState([]);
	const [nextPage, setNextPage] = useState(null);
	const [prevPage, setPrevPage] = useState(null);
	const [loading, setLoading] = useState(false);
	const [pageNumber, setPageNumber] = useState(1);


	// Function to fetch paginated notifications
	const fetchNotifications = async (page = 1) => {
		setLoading(true);
		try {
			const response = await getData(`/notifications?page=${page}`);
			setNotifications(response.data.results);
			setNextPage(response.data.next ? page + 1 : null);
			setPrevPage(response.data.previous ? page - 1 : null);
			setPageNumber(page);
		} catch (error) {
			console.error("Error fetching notifications:", error);
		} finally {
			setLoading(false);
		}
	};

	const markAsRead = useCallback(async (notificationId) => {
		try {
			await postData(`/notifications/${notificationId}/read`);
			// Update the specific notification's `is_read` status locally
			setNotifications((prevNotifications) =>
					prevNotifications.map((notification) =>
						notification.id === notificationId
							? { ...notification, is_read: true }
							: notification
					)
			);
			console.log('Notification marked as read:', notificationId);
		} catch (err) {
			console.error('Error marking notification as read:', err);
		}
	}, []);


	useEffect(() => {
		// Fetch initial page of notifications
		fetchNotifications();
	}, []);

	return (
		<div className="flex flex-col items-center p-6">
			<h1 className="text-3xl font-bold mb-4">Notifications</h1>
			
			{loading ? (
				<p className="text-lg text-blue-500 animate-pulse">Loading...</p>
			) : (
			<ul className="w-full max-w-3xl divide-y divide-gray-200 bg-white text-black shadow rounded-lg">
				{notifications.length > 0 ? (
					// notifications.map((notification) => (
					// <li
					// 	key={notification.id}
					// 	className="px-6 py-4 hover:bg-gray-100 transition-all"
					// >
					// 	<div className="text-lg text-gray-700">{notification.message}</div>
					// 	<div className="text-sm text-gray-500">
					// 		{new Date(notification.created_at).toLocaleString()}
					// 	</div>
					// </li>
					// ))
					notifications.map((notification) => (
						<NotificationLayout
							data={notification}
							key={notification.id}
							websocket={websocket}
							NOTIFICATION_TYPES={NOTIFICATION_TYPES}
							MarkAsRead={markAsRead}
						/>
					))
				) : (
					<li className="px-6 py-4 text-center text-gray-500">
					No notifications available.
					</li>
				)}
			</ul>
			)}

			{/* Pagination controls */}
			<div className="flex justify-between mt-6 space-x-4">
			<button
				onClick={() => fetchNotifications(prevPage)}
				disabled={!prevPage || loading}
				className={`px-4 py-2 bg-gray-200 text-gray-700 rounded ${
					!prevPage ? "cursor-not-allowed opacity-50" : "hover:bg-gray-300"
				}`}
			>
				Previous
			</button>

			<span className="text-gray-500">Page {pageNumber}</span>

			<button
				onClick={() => fetchNotifications(nextPage)}
				disabled={!nextPage || loading}
				className={`px-4 py-2 bg-gray-200 text-gray-700 rounded ${
					!nextPage ? "cursor-not-allowed opacity-50" : "hover:bg-gray-300"
				}`}
			>
				Next
			</button>
			</div>
		</div>
	);
}
