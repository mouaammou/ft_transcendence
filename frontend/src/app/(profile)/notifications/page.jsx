"use client";
import { useEffect, useState, useCallback } from "react";
import { IoCheckmarkOutline } from "react-icons/io5";
import Link from 'next/link';
import useNotifications from "@/components/navbar/useNotificationContext";
import { getData, postData } from "@/services/apiCalls";

const NotificationLayout = ({ data }) => {
	const [status, setStatus] = useState(data.notif_status);
	const [isRead, setIsRead] = useState(data.is_read || false);
	const [isActedUpon, setIsActedUpon] = useState(false);


	return (
		<div className={`flex items-start p-4 w-full border-b transition-colors duration-300
			${isRead ? 'bg-gray-50/80' : 'bg-white hover:bg-gray-50/40'}`}>
			<img 
			className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0" 
			src={data.avatar} 
			alt={`${data.username}'s avatar`}
			/>
			<div className="ml-3 sm:ml-4 flex-1 min-w-0">
			<div className="flex items-center justify-between gap-2">
				<Link 
					href={`/${data.username}`} 
					className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate"
				>
					{data.username}
				</Link>
				{!isRead && status !== 'pending' && (
					<button
					className="text-gray-400 hover:text-gray-600 transition-colors"
					onClick={handleMarkAsRead}
					aria-label="Mark as read"
					>
					<IoCheckmarkOutline className="text-xl" />
					</button>
				)}
			</div>
			<p className="text-sm text-gray-600 mt-1 break-words">{data.message}</p>
			</div>
		</div>
	);
};

export default function NotificationsPage() {
	const [notifications, setNotifications] = useState([]);
	const [nextPage, setNextPage] = useState(null);
	const [prevPage, setPrevPage] = useState(null);
	const [loading, setLoading] = useState(false);
	const [pageNumber, setPageNumber] = useState(1);

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

	useEffect(() => {
		fetchNotifications();
	}, []);

	return (
		<div className="min-h-screen py-8 px-4 sm:px-6">
			<div className="max-w-3xl mx-auto">
			<h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
				Notifications
			</h1>
			
			{loading ? (
				<div className="flex justify-center items-center h-32">
					<div className="animate-pulse text-blue-600">Loading...</div>
				</div>
			) : (
				<div className="bg-white rounded-xl shadow-sm overflow-hidden">
					{notifications.length > 0 ? (
					notifications.map(notification => (
						<NotificationLayout
							key={notification.id}
							data={notification}
						/>
					))
					) : (
					<div className="p-8 text-center text-gray-500">
						No notifications available.
					</div>
					)}
				</div>
			)}

			<div className="flex justify-between items-center mt-6">
				<button
					onClick={() => fetchNotifications(prevPage)}
					disabled={!prevPage || loading}
					className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors
					${!prevPage || loading
						? 'bg-gray-100 text-gray-400 cursor-not-allowed'
						: 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'
					}`}
				>
					Previous
				</button>
				<span className="text-sm text-gray-600">Page {pageNumber}</span>
				<button
					onClick={() => fetchNotifications(nextPage)}
					disabled={!nextPage || loading}
					className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors
					${!nextPage || loading
						? 'bg-gray-100 text-gray-400 cursor-not-allowed'
						: 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'
					}`}
				>
					Next
				</button>
			</div>
			</div>
		</div>
	);
}