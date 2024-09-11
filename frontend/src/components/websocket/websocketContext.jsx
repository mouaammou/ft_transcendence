import { useEffect, useState, useRef, createContext, useContext } from 'react';

export const WebSocketContext = createContext(null);

export const WebSocketProvider = ({url, children}) => {
	const [friends, setFriends] = useState([]);
	const [isConnected, setIsConnected] = useState(false);
	const ws = useRef(null)

	useEffect(() => {
		if (!ws.current) {
			ws.current = new WebSocket(url);
			ws.current.onopen = () => {
				console.log('WebSocket connected');
				setIsConnected(true);
			};

			ws.current.onmessage = (event) => {
			const data = JSON.parse(event.data);

			if (data.type === 'user_status_change') {
				// Update the status of the specific user in the friends list
				setFriends((prevFriends) => {
					const friendIndex = prevFriends.findIndex(f => f.username === data.username);
					if (friendIndex !== -1) {
						// Update the status if the friend is already in the list
						const updatedFriends = [...prevFriends];
						updatedFriends[friendIndex].status = data.status;
						return updatedFriends;
					} else {
						// Add the new friend to the list if they don't exist
						return [...prevFriends, { username: data.username, avatar: data.avatar, status: data.status}];
					}
				});
			}
		};

			ws.current.onclose = () => {
				console.log('WebSocket disconnected');
				setIsConnected(false);
			};

			ws.current.onerror = error => {
				console.error('WebSocket error:', error);
			};
		}

		return () => {
			if (ws.current)
				ws.current.close();
		};

	}, [url]);

	return (
		<WebSocketContext.Provider value={{isConnected, friends}}>
			{children}
		</WebSocketContext.Provider>
	)
};

export const useWebSocketContext = () => useContext(WebSocketContext);



