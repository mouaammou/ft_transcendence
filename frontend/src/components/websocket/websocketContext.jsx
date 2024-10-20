"use client";
import { getData } from '@/services/apiCalls';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef, createContext, useContext } from 'react';

export const WebSocketContext = createContext();

export const WebSocketProvider = ({url, children}) => {

	const listOfNotifications = {
		friendship: 'friend_request',
		acceptFriend: 'accept_friend',
		inviteToGame: 'invite_to_game',
		acceptGame: 'accept_game',
		inviteToTournament: 'invite_to_tournament',
		rejectFriend: 'reject_friend',
	};

	const [isConnected, setIsConnected] = useState(false);
	const [opponent, setOpponent] = useState(null);
	const [notifications, setNotifications] = useState([]);
	const websocket = useRef(null);
	const [notificationType, setnotificationType] = useState({});
	
	//for friends page
	const [users, setUsers] = useState([]);
	const [nextPage, setNextPage] = useState(null);
	const [prevPage, setPrevPage] = useState(null);
	const [pageNotFound, setPageNotFound] = useState(false);
	const router = useRouter()
	
	//reconnect attempts
	const [reconnectAttempts, setReconnectAttempts] = useState(0);
	const maxReconnectAttempts = 5;
	const reconnectInterval = 3000; // 3 seconds

	//websocket initialization connection
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
			setIsConnected(false);
			console.error('WebSocket error:', error);
		};


		//cleaup 
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
	
				if (data.type === 'user_status_change') {
					setUsers(prevUsers => { // Update the status of the users, if they are online or offline
						const updatedUsers = prevUsers?.map(user => {
							if (user.username === data.username) {
								console.log("User status change:", data.status);
								return { ...user, status: data.status };
							}
							return user;
						});
						return updatedUsers;
					});
				}
				setnotificationType({
					type: data.type,
					status: data.success,
				});
				if (data.type === 'friend_request' || data.type === 'accept_friend') {//still type game and tournament
					setNotifications((prev) => [...prev, {...data, id: Date.now()}]); // Add a unique id
				}
			};
		}
	
	}, [isConnected]);

	// FUCNTION FOR fetching users and friends with pagination
	const fetchAllUsers = async (pageNumber, endpoint) => {
		// Prevent multiple requests
		try {
			const response = await getData(`/${endpoint}?page=${pageNumber}`);
			if (response.status === 200) {

				setUsers(response.data.results);

				setPrevPage(() => {
					if (response.data.previous) 
						return response.data.previous.split("page=")[1] || 1; // If there's no page number, return null
						// Extract the page number from the previous URL
					return null; // No previous page
				});

				// Update nextPage
				setNextPage(() => {
					if (response.data.next)
						return response.data.next.split("page=")[1] || null; // If there's no page number, return null
					return null; // No next page
				});
			}
			else {
				setPageNotFound(true);
			}
		} catch (error) {
			console.error("Error fetching users in friends page:", error);
			setPageNotFound(true)
		}
		router.replace(`/${endpoint}?page=${pageNumber}`);
	};




	return (
		<WebSocketContext.Provider
			value={{
				isConnected,
				websocket,
				notifications,
				setNotifications,
				notificationType,
				listOfNotifications,
				opponent,
				setOpponent,
				// friends page,
				users,
				setUsers,
				nextPage,
				prevPage,
				setNextPage,
				setPrevPage,
				fetchAllUsers,
				pageNotFound,
				setPageNotFound,
				}}>
			{children}
		</WebSocketContext.Provider>
	)
};

export const useWebSocketContext = () => useContext(WebSocketContext || {});

if (useWebSocketContext === undefined || useWebSocketContext === null) {
   throw new Error('useWebSocketContext must be used within a LoginProvider');
}