"use client";
import { useEffect, useState, useRef, createContext, useContext } from 'react';

export const WebSocketContext = createContext({
	value: 'true',
});


export const WebSocketProvider = ({url, children}) => {

	const [isConnected, setIsConnected] = useState(false);
	const [users, setUsers] = useState([]);
	const [notifications, setNotifications] = useState([]);
	const websocket = useRef(null);
	const [notificationType, setnotificationType] = useState({});

	useEffect(() => {
		// Create WebSocket instance when the component mounts
		if ( ! isConnected) {
			websocket.current = new WebSocket(url);

			websocket.current.onopen = () => {
				console.log('WebSocket connected');
				setIsConnected(true);
			};
		}

		websocket.current.onclose = () => {
			console.log('WebSocket disconnected');
			setIsConnected(false);
		};

		websocket.current.onerror = (error) => {
			console.error('WebSocket error:', error);
		};

		return () => {
			if (websocket.current) {
				websocket.current.close();
			}
		};
	}, []);

	useEffect(() => {
		if (isConnected) {
			websocket.current.onmessage = (event) => {
				const data = JSON.parse(event.data);
				console.log("WebSocket message received:", data);
				setnotificationType({});
				if (data.type === 'user_status_change') {
					setUsers(prevUsers => {
						const userIndex = prevUsers.findIndex(user => user.username === data.username);
						if (userIndex !== -1) {
								// User exists, update their status
								const updatedUsers = [...prevUsers];
								updatedUsers[userIndex] = { ...updatedUsers[userIndex], status: data.status };
								return updatedUsers;
						} else {
								// User doesn't exist, add them to the list
								return [...prevUsers, { username: data.username, status: data.status, avatar: data.avatar }];
						}
					});
				}
				setnotificationType({
					type: data.type,
					status: data.success,
				});
				if (data.type === 'friend_request_received' || data.type === 'accept_friend_request') {
					setNotifications((prev) => [...prev, {...data, id: Date.now()}]); // Add a unique id
				}
			};
		}

	}, [isConnected]);

	return (
		<WebSocketContext.Provider
			value={{
				isConnected,
				websocket,
				users,
				setUsers,
				notifications,
				setNotifications,
				notificationType,
				}}>
			{children}
		</WebSocketContext.Provider>
	)
};

export const useWebSocketContext = () => useContext(WebSocketContext);



