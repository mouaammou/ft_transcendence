"use client";
import { getData } from "@/services/apiCalls";
import { useEffect, useState } from "react";

export default function NotificationsPage() {
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
			<ul className="w-full max-w-3xl divide-y divide-gray-200 bg-white shadow rounded-lg">
				{notifications.length > 0 ? (
					notifications.map((notification) => (
					<li
						key={notification.id}
						className="px-6 py-4 hover:bg-gray-100 transition-all"
					>
						<div className="text-lg text-gray-700">{notification.message}</div>
						<div className="text-sm text-gray-500">
							{new Date(notification.created_at).toLocaleString()}
						</div>
					</li>
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
