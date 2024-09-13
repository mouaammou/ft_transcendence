"use client";
import { useEffect, useState } from "react";
import { getData } from "@/services/apiCalls";
import { useWebSocketContext } from "@/components/websocket/websocketContext";

const FriendsList = () => {
	const { isConnected, websocket}  = useWebSocketContext();
	const [users, setUsers] = useState([]);

	useEffect(() => {
		const fetchAllUsers = async () => {
			try {
				const response = await getData("/allusers");
				if (response.status === 200) {
					const fetchedUsers = response.data;
					setUsers(fetchedUsers);
				}
			} catch (error) {
				console.error("Error fetching users in friends page:", error);
			}
		};

		fetchAllUsers();
	}, []); // Fetch users every time websocket or users change

	// WebSocket message handler to update the friends list when new status is received
	useEffect(() => {
		if (isConnected) {
			// Attach onmessage listener
			websocket.current.onmessage = (event) => {
				const data = JSON.parse(event.data);
				console.log("WebSocket message received:", data);
	
				if (data.type === 'user_status_change') {
					setUsers(prevUsers => prevUsers.map(user => user.username === data.username ? { ...user, status: data.status } : user));
					//if there is a new user, add it to the list of users
					setUsers(prevUsers => prevUsers.find(user => user.username === data.username) ? prevUsers : [...prevUsers, { username: data.username, status: data.status, avatar: data.avatar }]);
				}
			};
		}
	}, [websocket]); // Attach only once when websocket is available

	return (
		<div>
			<h1>Friends' Status</h1>
			<ul>
				{users && users.map((user, index) => (
					<li key={user.id || index}>
						<img src={user.avatar} alt={user.username} width="30" height="30" />
						{user.username}: {user.status === "online" ? '🟢 Online' : '🔴 Offline'}
					</li>
				))}
			</ul>
		</div>
	);
};

export default FriendsList;
