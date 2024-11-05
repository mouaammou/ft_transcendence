"use client";
import { getData } from '@/services/apiCalls';
import { useRouter } from 'next/navigation';
import {
	useEffect, useState, useRef, createContext, useContext,
	useMemo, useCallback
} from 'react';

const WEBSOCKET_CONFIG = {
	MAX_RECONNECT_ATTEMPTS: 5,
	RECONNECT_INTERVAL: 3000,
};

export const WebSocketContext = createContext();

const useWebSocket = (url) => {
	const [isConnected, setIsConnected] = useState(false);
	const websocket = useRef(null);
	const [reconnectAttempts, setReconnectAttempts] = useState(0);

	useEffect(() => {
		const connectWebSocket = () => {
			websocket.current = new WebSocket(url);

			websocket.current.onopen = () => {
				console.log('WebSocket connected');
				setIsConnected(true);
				setReconnectAttempts(0);
			};

			websocket.current.onclose = () => {
				console.log('WebSocket disconnected');
				setIsConnected(false);
				if (reconnectAttempts < WEBSOCKET_CONFIG.MAX_RECONNECT_ATTEMPTS) {
					setTimeout(() => {
						setReconnectAttempts((prev) => prev + 1);
						connectWebSocket();
					}, WEBSOCKET_CONFIG.RECONNECT_INTERVAL);
				}
			};

			websocket.current.onerror = (error) => {
				setIsConnected(false);
				console.error('WebSocket error:', error);
			};
		};

		if (!isConnected && reconnectAttempts === 0) {
			connectWebSocket();
		}

		return () => {
			if (websocket.current) {
				websocket.current.close();
			}
		};
	}, []);

		return { isConnected, websocket };
	};

	export const WebSocketProvider = ({ url, children }) => {
		const { isConnected, websocket } = useWebSocket(url);
		const [users, setUsers] = useState([]);
		const [nextPage, setNextPage] = useState(null);
		const [prevPage, setPrevPage] = useState(null);
		const [pageNotFound, setPageNotFound] = useState(false);
		const [friendStatusChange, setFriendStatusChange] = useState(false);
		const router = useRouter();

		const handleOnlineStatus = useCallback((event) => {
			if (!isConnected) return;
			try {
				const data = JSON.parse(event.data);
				if (data.type === 'user_status_change') {
					console.log('WebSocket ONLINE STATUS:', data);
					setFriendStatusChange(true);
					setUsers((prevUsers) =>
						prevUsers?.map((user) =>
							user.username === data.username ? { ...user, status: data.status } : user
						)
					);
				}
			} catch (error) {
				console.error('Error IN handle ONline status:', error);
			}
		}, [isConnected]);

		const fetchAllUsers = useCallback(
			async (pageNumber, endpoint) => {
				try {
					const response = await getData(`/${endpoint}?page=${pageNumber}`);
					if (response.status === 200) {
						setUsers(response.data.results);
						setPrevPage(response.data.previous ? response.data.previous.split("page=")[1] : null);
						setNextPage(response.data.next ? response.data.next.split("page=")[1] : null);
					} else {
						setPageNotFound(true);
					}
				} catch (error) {
					console.error("Error fetching users:", error);
					setPageNotFound(true);
				}
				router.replace(`/${endpoint}?page=${pageNumber}`);
			},
			[router]
		);

		useEffect(() => {
			if (isConnected && websocket.current) {
				websocket.current.addEventListener('message', handleOnlineStatus);
			}
			return () => {
				if (isConnected && websocket.current) {
				websocket.current.removeEventListener('message', handleOnlineStatus);
				}
			};
		}, [isConnected, handleOnlineStatus]);

		const contextValue = useMemo(
			() => ({
				isConnected,
				websocket,
				users,
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
			}),
			[
				isConnected, users, nextPage,
				prevPage, fetchAllUsers, pageNotFound, friendStatusChange, setPageNotFound, 
				setNextPage, setPrevPage
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
