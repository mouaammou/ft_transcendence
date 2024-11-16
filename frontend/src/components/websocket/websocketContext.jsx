'use client';
import { getData } from '@/services/apiCalls';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, createContext, useContext, useMemo } from 'react';
import useWebSocket from 'react-use-websocket';

export const WebSocketContext = createContext();

export const WebSocketProvider = ({ url, children }) => {
	const [users, setUsers] = useState([]);
	const [nextPage, setNextPage] = useState(null);
	const [prevPage, setPrevPage] = useState(null);
	const [pageNotFound, setPageNotFound] = useState(false);
	const [friendStatusChange, setFriendStatusChange] = useState(false);
	const router = useRouter();

  // useWebSocket hook from react-use-websocket
	const { sendMessage, lastMessage, lastJsonMessage, readyState } = useWebSocket(url, {
		shouldReconnect: () => true, // Automatically reconnect on disconnection
		reconnectAttempts: 5,
		reconnectInterval: 3000,
	});

	const isConnected = readyState === WebSocket.OPEN;

	useEffect(() => {
		if (readyState === WebSocket.OPEN) {
		console.log('WebSocket is CONNECTED.');
		} else if (readyState === WebSocket.CLOSED) {
		console.log('WebSocket is CLOSED.');
		}
	}, [readyState]);

	const handleOnlineStatus = useCallback(
		message => {
		if (!message || !isConnected) return;
		try {
			const data = JSON.parse(message.data);
			if (data.type === 'user_status_change') {
			console.log('WebSocket ONLINE STATUS:', data);
			setFriendStatusChange(true);
			setUsers(prevUsers =>
				prevUsers.map(user =>
					user.username === data.username ? { ...user, status: data.status } : user
				)
			);
			}
		} catch (error) {
			console.error('Error in handleOnlineStatus:', error);
		}
		},
		[isConnected]
	);

	// Effect to handle incoming WebSocket messages
	useEffect(() => {
		if (lastMessage) handleOnlineStatus(lastMessage);
	}, [lastMessage, handleOnlineStatus]);

	const fetchAllUsers = useCallback(
		async (pageNumber, endpoint) => {
		try {
			const response = await getData(`/${endpoint}?page=${pageNumber}`);
			if (response.status === 200) {
			setUsers(response.data.results);
			setPrevPage(response.data.previous ? response.data.previous.split('page=')[1] : null);
			setNextPage(response.data.next ? response.data.next.split('page=')[1] : null);
			} else {
			setPageNotFound(true);
			}
		} catch (error) {
			console.error('Error fetching users:', error);
			setPageNotFound(true);
		}
		router.replace(`/${endpoint}?page=${pageNumber}`);
		},
		[router]
	);

	const contextValue = useMemo(
		() => ({
		isConnected,
		sendMessage,
		users,
		lastJsonMessage,
		setUsers,
		nextPage,
		prevPage,
		fetchAllUsers,
		pageNotFound,
		friendStatusChange,
		setFriendStatusChange,
		setPageNotFound,
		setNextPage,
		setPrevPage,
		lastMessage,
    }),
		[
		isConnected,
		users,
		nextPage,
		prevPage,
		fetchAllUsers,
		pageNotFound,
		friendStatusChange,
		lastMessage,
		]
	);

	return <WebSocketContext.Provider value={contextValue}>{children}</WebSocketContext.Provider>;
};

export const useWebSocketContext = () => {
	const context = useContext(WebSocketContext);
	if (!context) {
		throw new Error('useWebSocketContext must be used within a WebSocketProvider');
	}
	return context;
};
