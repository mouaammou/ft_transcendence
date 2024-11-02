// NotificationContext.js
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
	const [notifications, setNotifications] = useState([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);

	// Fetch notifications when the user is logged in
	const fetchNotifications = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const response = await fetch('/api/notifications');
			const data = await response.json();

			setNotifications(data);
			updateUnreadCount(data);
		} catch (err) {
			setError('Failed to fetch notifications');
			console.error('Error fetching notifications:', err);
		} finally {
			setIsLoading(false);
		}
	}, []);

	const updateUnreadCount = useCallback((notifs) => {
		const unread = notifs.filter(notif => !notif.read).length;
		setUnreadCount(unread);
	}, []);

	const markAsRead = useCallback(async (notificationId) => {
		try {
			await fetch(`/api/notifications/${notificationId}/read`, {
			method: 'PUT'
			});

			const updatedNotifications = notifications.map(notif => 
			notif.id === notificationId ? { ...notif, read: true } : notif
			);

			setNotifications(updatedNotifications);
			updateUnreadCount(updatedNotifications);
		} catch (err) {
			console.error('Error marking notification as read:', err);
		}
	}, [notifications, updateUnreadCount]);

	const markAllAsRead = useCallback(async () => {
		try {
			await fetch('/api/notifications/mark-all-read', {
			method: 'PUT'
			});

			const updatedNotifications = notifications.map(notif => ({
			...notif,
			read: true
			}));

			setNotifications(updatedNotifications);
			setUnreadCount(0);
		} catch (err) {
			console.error('Error marking all notifications as read:', err);
		}
	}, [notifications]);

	// Memoize the context value to prevent unnecessary re-renders
	const value = useMemo(() => ({
		notifications,
		unreadCount,
		isLoading,
		error,
		fetchNotifications,
		markAsRead,
		markAllAsRead
	}), [notifications, unreadCount, isLoading, error, fetchNotifications, markAsRead, markAllAsRead]);

	return (
		<NotificationContext.Provider value={value}>
			{children}
		</NotificationContext.Provider>
	);
};

// Custom hook to use the notification context
export const useNotifications = () => {
	const context = useContext(NotificationContext);
	if (!context) {
		throw new Error('useNotifications must be used within a NotificationProvider');
	}
	return context;
};
