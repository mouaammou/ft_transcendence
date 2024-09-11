"use client"


import { useEffect, useState } from "react";
import { getData } from "@/services/apiCalls";
import { useWebSocketContext } from "@/components/websocket/websocketContext";

const FriendsList = () => {
	const { isConnected, friends } = useWebSocketContext();
	const [users, setUsers] = useState([]);

	useEffect(() => {
	const alluser = async () => {
			// Use the /api prefix to trigger the proxy rewrite
		const response = await getData("/allusers").then(response => {
			setUsers(response.data);
			if (response.status == 200 || response.status == 201) {
			}
			})
	};

	alluser();
	}, []);

	// Only proceed if both `users` and `friends` are available
	if (!users || !Array.isArray(users)) {
		return <p>Loading users...</p>; // Return a loading state if users are not yet available
	}
	// Merge users from REST API with friends from WebSocket to get online status
	const usersWithStatus = users.map(user => {
		const friendStatus = friends.find(friend => friend.username === user.username);
		console.log("friendStatus", friendStatus)
		if (!friendStatus) {	
			return {
			...user,
			status: 'offline'
		};
		}
		return {
			...user,
			status: "online"
		};
	});


	return (
		<div>
			<h1>Friends' Status</h1>
			<ul>
			{usersWithStatus.map((user, index) => (
				<li key={index}>
					<img src={user.avatar} alt={user.username} width="30" height="30" />
					{user.username}: {user.status === "online" ? '🟢 Online' : '🔴 Offline'}
				</li>
			))}
			</ul>
		</div>
	);
};

export default FriendsList;
