import { useEffect, useState, useRef, createContext, useContext } from 'react';

export const WebSocketContext = createContext("");

export const WebSocketProvider = ({url, children}) => {
	const [friends, setFriends] = useState([]);
	const [isConnected, setIsConnected] = useState(false);
	const websocket = useRef(null);

	useEffect(() => {
		if (!websocket.current) {
			// Create WebSocket instance
			websocket.current = new WebSocket(url);

			websocket.current.onopen = () => {
			console.log('WebSocket connected');
				setIsConnected(true);
			};

			websocket.current.onmessage = (event) => {
				const data = JSON.parse(event.data);
				
				console.log("data on message:", data)

				if (data.type === 'user_status_change') {
					// Update the status of the specific user in the friends list
					setFriends((prevFriends) => {
						const friendIndex = prevFriends.findIndex(f => f.username === data.username);
						if (friendIndex !== -1) {
							// Update the status if the friend is already in the list
							const updatedFriends = [...prevFriends];
							console.log("data.status", data.status)
							updatedFriends[friendIndex].status = data.status;
							return updatedFriends;

						} else {
							// Add the new friend to the list if they don't exist
							return [...prevFriends, { username: data.username, avatar: data.avatar, status: data.status}];
						}
					});
				}
			};

			websocket.current.onclose = () => {
				console.log('WebSocket disconnected');
				setIsConnected(false);
			};

			websocket.current.onerror = (error) => {
				console.error('WebSocket error:', error);
			};
		}

		return () => {
			if (websocket.current) {
			websocket.current.close();
			}
		};
	}, [websocket]);

	return (
		<WebSocketContext.Provider value={{isConnected, friends}}>
			{children}
		</WebSocketContext.Provider>
	)
};

export const useWebSocketContext = () => useContext(WebSocketContext);



