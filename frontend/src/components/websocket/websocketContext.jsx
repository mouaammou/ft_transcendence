"use client";
import { getData } from '@/services/apiCalls';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef, createContext, useContext } from 'react';

export const WebSocketContext = createContext(null);

export const WebSocketProvider = ({url, children}) => {

	const [isConnected, setIsConnected] = useState(false);
	const [users, setUsers] = useState([]);
	const [opponent, setOpponent] = useState(null);
	const [notifications, setNotifications] = useState([]);
	const websocket = useRef(null);
	const [notificationType, setnotificationType] = useState({});
	const [listOfNotifications, setListOfNotifications] = useState({
		friendship: 'friend_request',
		acceptFriend: 'accept_friend',
		inviteToGame: 'invite_to_game',
		acceptGame: 'accept_game',
		inviteToTournament: 'invite_to_tournament',
		rejectFriend: 'reject_friend',
	});
	const [hasGetMessage, setHasGetMessage] = useState(false);
	
	//for friends page
	const [fetchedUsers, setFetchedUsers] = useState([]);
	const [nextPage, setNextPage] = useState(null);
	const [prevPage, setPrevPage] = useState(null);
	const [pageNotFound, setPageNotFound] = useState(false);
	const router = useRouter()

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

				if (data.type === 'user_status_change') {
					setHasGetMessage(true);
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
				if (data.type === 'friend_request' || data.type === 'accept_friend') {//still type game and tournament
					setNotifications((prev) => [...prev, {...data, id: Date.now()}]); // Add a unique id
				}
			};
		}

	}, [isConnected]);

	// Save users to localStorage whenever the users change
	useEffect(() => {
		if (users.length > 0) {
			// Get the existing users from localStorage
			const storedUsers = localStorage.getItem('users');
			let parsedStoredUsers = storedUsers ? JSON.parse(storedUsers) : [];

			// Create a map of stored users for efficient merging
			const storedUsersMap = new Map(parsedStoredUsers.map(user => [user.username, user]));

			// Merge with the new users
			const updatedUsers = users.map(user => {
				const storedUser = storedUsersMap.get(user.username);
				return {
					username: user.username,
					status: user.status || (storedUser ? storedUser.status : 'offline')
				};
			});

			// Set the merged result back to localStorage
			localStorage.setItem('users', JSON.stringify(updatedUsers));
		}
	}, [users, isConnected, websocket]);// Save users to localStorage whenever the users change

	// friends page
	const fetchAllUsers = async (pageNumber, endpoint) => {

		// Prevent multiple requests
		try {
			const response = await getData(`/${endpoint}?page=${pageNumber}`);
			if (response.status === 200) {

				setFetchedUsers(() => {
					const fetchedUsers = response.data.results;
					const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
					console.log('storedUsers :: ', storedUsers);
					const mergedUsers = fetchedUsers.map((user) => {
						const newUser = storedUsers.find((newUser) => newUser.username === user.username);
						console.log('newUser :: ', newUser);
						if (newUser) {
							return { ...user, status: newUser.status || "offline" };
						}
						return user;
					});
					return mergedUsers;
				});

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
				users,
				setUsers,
				notifications,
				setNotifications,
				notificationType,
				listOfNotifications,
				hasGetMessage,
				setHasGetMessage,
				opponent,
				setOpponent,
				// friends page,
				fetchedUsers,
				setFetchedUsers,
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

export const useWebSocketContext = () => useContext(WebSocketContext) || {};
