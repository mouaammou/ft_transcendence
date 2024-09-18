"use client";
import { useEffect, useState } from "react";
import { getData } from "@/services/apiCalls";
import { useWebSocketContext } from "@/components/websocket/websocketContext";
import { MdNavigateNext } from "react-icons/md";
import { MdNavigateBefore } from "react-icons/md";
import Link  from "next/link";
import {useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

const Friends = () => {
	const { isConnected, websocket}  = useWebSocketContext();
	const [users, setUsers] = useState([]);
	const [nextPage, setNextPage] = useState(null);
	const [prevPage, setPrevPage] = useState(null);
	const router = useRouter();
	const query_params = useSearchParams();
	const [pageNotFound, setPageNotFound] = useState(false);
	
	const fetchAllUsers = async (pageNumber) => {
		router.push(`/allfriends?page=${pageNumber}`);
		try {
			const response = await getData(`/allfriends?page=${pageNumber}`);	
			console.log('friends response', response.data);
			if (response.status === 200) {
				setUsers(response.data.results);
				setPrevPage(() => {
					if (response.data.previous) {
						// Extract the page number from the previous URL
						const pageNumber = response.data.previous.split("page=")[1];
						return pageNumber || 1; // If there's no page number, return null
					}
					return null; // No previous page
				});

				// Update nextPage
				setNextPage(() => {
					if (response.data.next) {
						// Extract the page number from the next URL
						const pageNumber = response.data.next.split("page=")[1];
						return pageNumber || null; // If there's no page number, return null
					}
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
	};

	// Fetch users on the initial render
	useEffect(() => {
		const page = query_params.get('page') || 1;
		fetchAllUsers(page);

		return () => {
			setPageNotFound(false);
		}
	}, [query_params.get('page')]);

	// WebSocket message handler to update the friends list when new status is received
	useEffect(() => {
		if (isConnected) {
			websocket.current.onmessage = (event) => {
					const data = JSON.parse(event.data);
					console.log("WebSocket message received:", data);

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
			};
		}
	}, [isConnected]); // Depend on isConnected instead of websocket

	// useEffect(() => {
	// 	if (isConnected) {
	// 		// Attach onmessage listener
	// 		websocket.current.onmessage = (event) => {
	// 			const data = JSON.parse(event.data);
	// 			console.log("WebSocket message received:", data);
	
	// 			if (data.type === 'user_status_change') {
	// 				// Update the status of the user in the list
	// 				setUsers(prevUsers => prevUsers.map(user => user.username === data.username ? { ...user, status: data.status } : user));
	// 				//if there is a new user, add it to the list of users
	// 				setUsers(prevUsers => prevUsers.find(user => user.username === data.username) ? prevUsers : [...prevUsers, { username: data.username, status: data.status, avatar: data.avatar }]);
	// 			}
	// 		};
	// 	}
	// }, [websocket]); // Attach only once when websocket is available

	return (
	(pageNotFound) ? <>
	<div className="flex flex-col items-center justify-center min-h-screen">
		<div className="bg-white p-8 rounded-lg shadow-md text-center">
			<h1 className="text-5xl font-bold text-gray-800 mb-4">
				404
			</h1>
			<h2 className="text-3xl font-semibold text-gray-700 mb-6">
				Page Not Available
			</h2>
			<p className="text-xl text-gray-600 mb-8">
				Oops! The page you're looking for doesn't exist or is currently unavailable.
			</p>
			<Link 
				href="/allusers"
				className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
			>
				Go Back
			</Link>
		</div>
	</div>
	</> :
		
	<div className="friends container flex justify-center mt-14 rounded-lg max-md:p-2 max-md:w-[90%] max-sm:mb-20 bg-topBackground py-32">

		{/* friends div options */}
		<div className="friends-div-options flex items-center justify-center flex-wrap max-xl:gap-12">
			{/* list of friends */}
			<div className="list-friends relative ">
				{/* Icon friends */}
				<div className="icon-friends primary-button border-none w-40 flex items-center space-x-2 lg:mb-6">
					<span className="inline-block">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 inline-block">
							<path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
						</svg>
					</span> 
					<span className="inline-block">Friends</span>
				</div>

				<div className="list-friends-profile">

					{/* DIV TWO users */}
					<div className="div-for-two-users flex justify-center items-center flex-wrap gap-4 max-sm:gap-1 p-2 md:p-10 md:w-[90%] mx-auto">
						{users && users.map((user, index) => (
							/* USER Profile status online in game */
							<div className="flex items-center justify-center space-x-3 p-3 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition" key={user.id}>
								{/* Profile Picture */}
								<div className="relative">
									<img
										src={user.avatar}
										alt="Profile"
										className="w-14 h-14 rounded-full object-cover"
									/>
									{/* Online/Offline Status Indicator */}
									{
										(user.status === "online") ?
											(<span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white bg-green-500"></span>)
										:
											(<span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white bg-red-500"></span>)
									}
								</div>

								{/* User Information */}
								<div className="flex flex-col">
									<span className="font-medium text-gray-800">{user.username}</span>
									<Link href={`/${user.username}`} className="text-xs text-blue-500">View Profile</Link>
									<span className="text-xs text-gray-500">{user.status}</span>
								</div>

								{/* Status: In Game / In Tournament */}
								<span className="ml-auto text-xs bg-blue-100 text-blue-800 py-1 px-2 rounded-full">
									In Tournament
								</span>
							</div>
						))}
					</div>
				</div>
				<button className="float-end absolute right-0 bottom-[-3rem] my-6 w-20 max-sm:bottom-[-5rem] max-sm:text-[1.5rem]">
					<span 
						className={` ${!nextPage ? 'text-gray-500' : ''}`} 
						onClick={() => nextPage && fetchAllUsers(nextPage)}>
						Next
					<MdNavigateNext className="max-sm:text-[1.5rem] inline"/>
					</span>	
				</button>
				<button className="float-end absolute left-0 bottom-[-3rem] my-6 w-20 max-sm:bottom-[-5rem] max-sm:text-[1.5rem]">
					<span 
						className={` ${!prevPage ? 'text-gray-500' : ''}`} 
						onClick={() => prevPage && fetchAllUsers(prevPage)}>
					<MdNavigateBefore className="max-sm:text-[1.5rem] inline"/>
						Prev
					</span>
				</button>
			</div>
		</div>
	</div>
	)
}

export default Friends;
