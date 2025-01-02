'use client';
import { getData } from '@/services/apiCalls';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, createContext, useContext, useMemo } from 'react';
import useWebSocket from 'react-use-websocket';
import { usePathname } from 'next/navigation'

export const WebSocketContext = createContext();

export const WebSocketProvider = ({ url, children }) => {
	const [users, setUsers] = useState([]);
	const [nextPage, setNextPage] = useState(null);
	const [prevPage, setPrevPage] = useState(null);
	const [pageNotFound, setPageNotFound] = useState(false);
	const [friendStatusChange, setFriendStatusChange] = useState(false);
	const router = useRouter();
	const pathname = usePathname();

	const [connectionEstablished, setConnectionEstablished] = useState(false);

	const paths = ['/login', '/signup', '/forget_password', '/reset_password'];
	const shouldConnect = !paths.includes(pathname);
  
	const { sendMessage, lastMessage, lastJsonMessage, readyState } = useWebSocket(
	  shouldConnect ? url : null,
	  {
		shouldReconnect: (closeEvent) => {
		  return shouldConnect;  // Only reconnect if we're not on excluded paths
		},
		reconnectInterval: 1000,
		share: true,
		retryOnError: true,
		onOpen: () => {
		  setConnectionEstablished(true);
		},
		onClose: () => {
		  setConnectionEstablished(false);
		}
	  }
	);

	const isConnected = readyState === WebSocket.OPEN;
	useEffect(() => {
		if (readyState === WebSocket.OPEN) {
			// Connection established
			console.log("pahtname", pathname);
			setConnectionEstablished(true);
		} else if (readyState === WebSocket.CLOSED) {
			setConnectionEstablished(false);
		}
	}, [readyState]);

	const handleOnlineStatus = useCallback(
		message => {
		if (!message || !isConnected) return;
		try {
			const data = JSON.parse(message.data);
			if (data.type === 'user_status_change') {

			setFriendStatusChange(true);
			setUsers(prevUsers =>
				prevUsers.map(user =>
					user.username === data.username ? { ...user, status: data.status } : user
				)
			);
			}
		} catch (error) {

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
		connectionEstablished
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
		connectionEstablished
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
