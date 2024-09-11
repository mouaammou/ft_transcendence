"use client"
import { useEffect, useState, useRef } from 'react';

const useWebSocketCustomHook = (url) => {
	const [friends, setFriends] = useState([]);
	const [isConnected, setIsConnected] = useState(false);
	const ws = useRef(null);

useEffect(() => {
	if (!ws.current) {
		// Create WebSocket instance
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
					console.log("prevFriends", prevFriends)
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

		ws.current.onclose = () => {
			console.log('WebSocket disconnected');
			setIsConnected(false);
		};

		ws.current.onerror = (error) => {
			console.error('WebSocket error:', error);
		};
	}

	return () => {
		if (ws.current) {
		ws.current.close();
		}
	};
}, [url]);

return { isConnected, friends };
};

export default useWebSocketCustomHook;
