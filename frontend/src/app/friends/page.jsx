"use client";
import { useEffect, useState } from "react";
import { getData } from "@/services/apiCalls";
import useWebSocketCustomHook from "@/components/websocket/useWebsocket";

const FriendsList = () => {
	const { isConnected, friends } = useWebSocketCustomHook("ws://localhost:8000/ws/online/");
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
	}, []); // Only fetch users once when the component mounts

	useEffect(() => {
		// Update users' status whenever friends array changes
		setUsers(prevUsers => prevUsers.map(user => {
				const friend = friends.find(friend => friend.username === user.username);
				return friend ? { ...user, status: friend.status } : user;
		}));
	}, [friends]);

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
}

export default FriendsList;