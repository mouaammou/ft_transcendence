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
				console.error("Error fetching users:", error);
			}
		};

		fetchAllUsers();
	}, []);

	// WebSocket message handler to update the friends list when new status is received
	useEffect(() => {
		if (isConnected) {
			// Attach onmessage listener
			websocket.current.onmessage = (event) => {
				const data = JSON.parse(event.data);
				console.log("WebSocket message received:", data);
	
				if (data.type === 'user_status_change') {
					setUsers(prevMembers => prevMembers.map(member => member.username === data.username ? { ...member, 'status': data.status } : member));
				}
			};
		}
	}, [users, websocket]); // Attach only once when websocket is available

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
