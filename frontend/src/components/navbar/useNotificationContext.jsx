'use client';
import { getData, postData } from '@/services/apiCalls';
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {  useWebSocketContext } from '@components/websocket/websocketContext';

const NOTIFICATION_TYPES = {
	FRIENDSHIP: 'send_friend_request',
	ACCEPT_FRIEND: 'accept_friend_request',
	REJECT_FRIEND: 'reject_friend_request',
	INVITE_GAME: 'invite_to_game',
	ACCEPT_GAME: 'accept_game',
	INVITE_TOURNAMENT: 'invite_to_tournament',
	ACCEPT_TOURNAMENT: 'accept_tournament',
};

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {

	const {isConnected, websocket} = useWebSocketContext()

	const [unreadCount, setUnreadCount] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const [notifications, setNotifications] = useState([]);
	const [notificationType, setNotificationType] = useState({});

		// Update the unread count based on the notifications
	const updateUnreadCount = useCallback((notifs) => {
		if (Array.isArray(notifs)) {
			const unreadNotifs = notifs.filter(notif => !notif.is_read);
			setUnreadCount(unreadNotifs.length);
		} else {
			// If it's a new notification, increment the count
			if (!notifs.is_read) {
				setUnreadCount(prev => prev + 1);
			} else {
				// If marking as read, decrement the count
				setUnreadCount(prev => prev - 1);
			}
		}
	}, []);

	const handleNotifications = useCallback((event) => {
		if (!isConnected) return;
		try {
			const data = JSON.parse(event.data);
			if ([NOTIFICATION_TYPES.FRIENDSHIP, NOTIFICATION_TYPES.ACCEPT_FRIEND,
				, NOTIFICATION_TYPES.ACCEPT_GAME,NOTIFICATION_TYPES.INVITE_GAME,
				NOTIFICATION_TYPES.INVITE_TOURNAMENT, NOTIFICATION_TYPES.ACCEPT_TOURNAMENT
			].includes(data.type)) {
				console.log('WebSocket FOR Notifications:', data);
				// setNotifications((prev) => [...prev, { ...data }]);

				setNotifications(prevNotifications => {
					const updatedNotifications = [...prevNotifications, { ...data }];
					// Sort by created_at to maintain consistency
					return updatedNotifications.sort((a, b) => 
						new Date(b.created_at) - new Date(a.created_at)
					);
				});

				setNotificationType({ type: data.type, status: data.success, notificationId: data.id});
				// Increment unread count for new notification
				setUnreadCount(prev => prev + 1);
			}
		} catch (error) {
			console.error('Error processing WebSocket Notifications:', error);
			setError('Error processing WebSocket Notifications');
		}
	}, [isConnected, setNotifications, setNotificationType]);

	// Fetch notifications when the user is logged in
	const UnreadNotifications = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const response = await getData('/notifications/unread');
			if (response.status === 200) {
				const data = await response.data.results;
				
				// Sort notifications by created_at in descending order
				const sortedData = data.sort((a, b) => 
					new Date(b.created_at) - new Date(a.created_at)
				);

				setNotifications(sortedData);
				setUnreadCount(sortedData.length);
			}
		} catch (err) {
			setError('Failed to fetch notifications');
			console.error('Error fetching notifications:', err);
		} finally {
			setIsLoading(false);
		}
	}, [setNotifications]);


	const markAsRead = useCallback(async (notificationId) => {
		try {
			await postData(`/notifications/${notificationId}/read`);
			console.log('Notification marked as read:::', notificationId);

			// Filter out the read notification instead of updating it
			const updatedNotifications = notifications.filter(notif => 
				notif.id !== notificationId
			);

			setNotifications(updatedNotifications);
			updateUnreadCount(updatedNotifications);
		} catch (err) {
			console.error('Error marking notification as read:', err);
		}
	}, [notifications, updateUnreadCount]);

	const markAllAsRead = useCallback(async () => {
		try {
			await postData('/notifications/markAllRead');

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

	useEffect(() => {
			if (isConnected && websocket.current) {
				websocket.current.addEventListener('message', handleNotifications);
			}
			return () => {
				if (isConnected && websocket.current) {
				websocket.current.removeEventListener('message', handleNotifications);
				}
			};
		}, [isConnected, handleNotifications]);

	// Memoize the context value to prevent unnecessary re-renders
	const value = useMemo(() => ({
		notifications,
		notificationType,
		unreadCount,
		isLoading,
		error,
		isConnected,
		websocket,
		UnreadNotifications,
		markAsRead,
		markAllAsRead,
		NOTIFICATION_TYPES
	}), [
			notifications,
			notificationType,
			unreadCount,
			isLoading,
			error,
			isConnected,
			websocket,
			UnreadNotifications,
			markAsRead,
			markAllAsRead,
			NOTIFICATION_TYPES
		]);

	return (
		<NotificationContext.Provider value={value}>
			{children}
		</NotificationContext.Provider>
	);
};

// Custom hook to use the notification context
const useNotifications = () => {
	const context = useContext(NotificationContext);
	if (!context) {
		throw new Error('useNotifications must be used within a NotificationProvider');
	}
	return context;
};

export default useNotifications;
