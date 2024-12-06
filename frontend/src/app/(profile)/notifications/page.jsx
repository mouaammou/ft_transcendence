'use client';
import { useEffect, useState, useCallback } from 'react';
import { IoCheckmarkOutline } from 'react-icons/io5';
import Link from 'next/link';
import { getData } from '@/services/apiCalls';

const NotificationMessage = ({ data }) => {
    return (
        <div className="group flex w-full gap-4 border-b border-gray-700 p-4 transition-all duration-300 hover:bg-gray-800">
            <div className="transition-transform duration-300 group-hover:scale-110">
                <img
                    className="h-10 w-10 rounded-full object-cover shadow-md ring-2 ring-gray-600 transition-all duration-300 hover:ring-4 hover:ring-gray-500 md:h-12 md:w-12"
                    src={data.avatar}
                    alt={`${data.username}'s avatar`}
                />
            </div>
            <div className="min-w-0 flex-1">
                <Link
                    href={`/${data.username}`}
                    className="inline-block text-base font-bold text-white transition-all duration-300 hover:text-blue-400 hover:scale-105"
                >
                    {data.username}
                </Link>
                <p className="mt-2 break-words text-sm text-gray-400 transition-colors duration-300 group-hover:text-gray-300">
                    {data.message}
                </p>
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

    const fetchNotifications = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const response = await getData(`/notifications?page=${page}`);
            setNotifications(response.data.results);
            setNextPage(response.data.next ? page + 1 : null);
            setPrevPage(response.data.previous ? page - 1 : null);
            setPageNumber(page);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 px-4 py-8 sm:px-6">
            <div className="mx-auto max-w-3xl">
                <h1 className="mb-8 text-center text-3xl font-bold text-white">Notifications</h1>

                {loading ? (
                    <div className="flex h-32 items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    </div>
                ) : (
                    <div className="animate-fadeIn overflow-hidden rounded-xl bg-gray-800 shadow-lg transition-all duration-300 hover:shadow-xl">
                        {notifications.length > 0 ? (
                            notifications.map(notification => (
                                <NotificationMessage key={notification.id} data={notification} />
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center gap-4 p-12 text-center text-gray-500">
                                <IoCheckmarkOutline className="h-12 w-12 text-gray-400" />
                                <p className="text-lg font-medium">All caught up!</p>
                                <p className="text-sm">No new notifications available.</p>
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-8 flex items-center justify-between">
                    <button
                        onClick={() => fetchNotifications(prevPage)}
                        disabled={!prevPage || loading}
                        className={`rounded-lg px-6 py-2.5 text-sm font-medium transition-all duration-300
                            ${!prevPage || loading
                                ? 'cursor-not-allowed bg-gray-700 text-gray-500'
                                : 'bg-gray-700 text-white shadow-md hover:bg-gray-600 hover:shadow-lg active:scale-95'
                            }`}
                    >
                        Previous
                    </button>
                    <span className="rounded-full bg-gray-700 px-4 py-2 text-sm font-medium text-white">
                        Page {pageNumber}
                    </span>
                    <button
                        onClick={() => fetchNotifications(nextPage)}
                        disabled={!nextPage || loading}
                        className={`rounded-lg px-6 py-2.5 text-sm font-medium transition-all duration-300
                            ${!nextPage || loading
                                ? 'cursor-not-allowed bg-gray-700 text-gray-500'
                                : 'bg-gray-700 text-white shadow-md hover:bg-gray-600 hover:shadow-lg active:scale-95'
                            }`}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}