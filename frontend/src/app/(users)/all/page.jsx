'use client';
import { useEffect, useState, useCallback } from 'react';
import { useWebSocketContext } from '@/components/websocket/websocketContext';
import { MdNavigateNext, MdNavigateBefore, MdBlock } from 'react-icons/md';
import { AiFillProfile } from "react-icons/ai";
import { FaUserFriends, FaGamepad } from "react-icons/fa";
import { TbTournament } from "react-icons/tb";
import { IoChatbubbleEllipses } from "react-icons/io5";
import Link from 'next/link';
import { getData } from '@/services/apiCalls';
import useNotificationContext from '@/components/navbar/useNotificationContext';
import { FaUsers } from "react-icons/fa6";


const Friends = () => {
	const {
		users,
		setUsers
	} = useWebSocketContext();

	const {
		isConnected,
		NOTIFICATION_TYPES,
		sendMessage,
	} = useNotificationContext();

	const [pageNumber, setPageNumber] = useState(1);
	const [selectedUser, setSelectedUser] = useState(null);
	const [nextPage, setNextPage] = useState(null);
	const [prevPage, setPrevPage] = useState(null);

	const fetchAllUsers = useCallback( async (pageNumber = 1, endpoint = 'allusers') => {
		try {
			const response = await getData(`/${endpoint}?page=${pageNumber}`);
			if (response.status === 200) {
				setUsers(response.data.results);
				console.log(response.data.results);
				setNextPage(response.data.next ? pageNumber + 1 : null);
				setPrevPage(response.data.previous ? pageNumber - 1 : null);
				setPageNumber(pageNumber);
			} else {
				// setPageNotFound(true);
			}
		} catch (error) {
			console.log('Error fetching users:', error);
			// setPageNotFound(true);
		}
	},[]);

	const sendFriendRequest = useCallback((user) => {
		console.log('Sending friend request to:', user);
		if (isConnected && user?.id) {
			sendMessage(
				JSON.stringify({
					type: NOTIFICATION_TYPES.FRIENDSHIP,
					to_user_id: user.id,
				})
			);
		}
	}, [isConnected]);

	useEffect(() => {
		fetchAllUsers();
	}, []);

	const handleUserSelect = (user, e) => {
		e.preventDefault();
		setSelectedUser(user);
	};


	return (
		<div className="min-h-screen py-32 w-full relative">
			<div className="icon-friends bg-gray-800/50 backdrop-blur-sm text-white px-6 py-3 rounded-lg 
							shadow-lg w-fit flex items-center space-x-3 lg:mb-6 
							absolute top-10 left-10 transition-transform hover:scale-105
							border border-gray-700/50">
				<FaUsers className='text-2xl text-blue-400'/>
				<span className="font-medium">All users</span>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-8">
				{/* Users List */}
				<div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 shadow-xl relative min-h-[600px]
							border border-gray-700/50">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
					{users?.map((user) => (
					<div key={user.id} onClick={(e) => handleUserSelect(user, e)}
						className="cursor-pointer">
						<div className={`bg-gray-800/50 p-4 rounded-lg shadow-lg hover:shadow-xl 
									transition-all duration-300 transform hover:-translate-y-1
									border border-gray-700/50
									${selectedUser?.id === user.id ? 'ring-2 ring-blue-500' : ''}`}>
						<div className="flex items-center space-x-4">
							<div className="relative">
							<img
								src={user.avatar}
								alt={user.username}
								className="w-16 h-16 rounded-full object-cover border-2 border-gray-700"
							/>
							<span className={`absolute bottom-0 right-0 w-4 h-4 
											rounded-full border-2 border-gray-800
											${user.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}
							/>
							</div>
							
							<div className="flex flex-col">
							<span className="font-medium text-gray-100 mb-2">
								{user.username}
							</span>
							</div>
						</div>
						</div>
					</div>
					))}
				</div>

				{/* Navigation */}
				<div className="absolute bottom-6 left-0 right-0 flex justify-between px-6">
					<button
					onClick={() => fetchAllUsers(prevPage)}
					disabled={!prevPage}
					className={`flex items-center space-x-2 px-4 py-2 rounded-lg 
								transition-all duration-300
								${!prevPage 
								? 'bg-gray-800/30 text-gray-500 cursor-not-allowed' 
								: 'bg-gray-700 text-white hover:bg-gray-600'}`}
					>
						<MdNavigateBefore className="text-xl" />
						<span>Previous</span>
					</button>
					<span className="text-gray-300">Page {pageNumber}</span>
					<button
					onClick={() => fetchAllUsers(nextPage)}
					disabled={!nextPage}
					className={`flex items-center space-x-2 px-4 py-2 rounded-lg 
								transition-all duration-300
								${!nextPage 
								? 'bg-gray-800/30 text-gray-500 cursor-not-allowed' 
								: 'bg-gray-700 text-white hover:bg-gray-600'}`}
					>
					<span>Next</span>
						<MdNavigateNext className="text-xl" />
					</button>
				</div>
				</div>

				{/* User Cart */}
				<div className='flex justify-center items-start'>
					<UserCart user={selectedUser} sendFriendRequest={sendFriendRequest} />
				</div>
			</div>
		</div>
	);
};

const UserCart = ({ user, sendFriendRequest}) => {
	if (!user) {
		return (
		<div className="bg-gray-800/30 backdrop-blur-sm p-6 rounded-xl shadow-2xl w-full max-w-96
						border border-gray-700/50 flex items-center justify-center min-h-[600px]">
			<p className="text-gray-400 text-center">Select a user to view details</p>
		</div>
		);
	}
	const [friendRequests, setFriendRequests] = useState({});

    const handleFriendRequest = (userId) => {
        sendFriendRequest(user);
        setFriendRequests(prev => ({
            ...prev,
            [userId]: true
        }));
    };
	return (
		<div className="bg-gray-800/30 backdrop-blur-sm p-6 rounded-xl shadow-2xl w-full max-w-96
						transform transition-all duration-300
						border border-gray-700/50">
			<div>
				<div className="border-b border-gray-700/50 pb-8">
					<h1 className="text-2xl font-bold text-gray-100 mb-6">
						{user.username}
					</h1>
					
					<div className="relative flex justify-center">
						<img 
							src={user.avatar}
							alt="Profile"
							className="w-32 h-32 rounded-xl object-cover ring-4 ring-blue-500/30 shadow-xl"
						/>
					</div>
					
					<div className="mt-6 flex flex-col items-center gap-2">
						{user.status === 'online' && 
							<span className="flex items-center gap-2 px-4 py-1.5 bg-green-500/10 text-green-400 rounded-full text-sm">
								online
								<div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
							</span>
						}

						{user.status === 'offline' &&
							<span className="flex items-center gap-2 px-4 py-1.5 bg-red-500/10 text-red-400 rounded-full text-sm">
								offline
								<div className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></div>
							</span>
						}
					</div>
				</div>

				<div className="mt-6 space-y-3">
					<Link href={`friend/${user.username}`}
						className="flex items-center w-full px-6 py-3 rounded-2xl
								bg-gray-700/50 hover:bg-gray-600/50 
								text-gray-200 
								transition-all duration-200
								group focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<span className="flex items-center justify-center w-8 h-8 
									text-gray-300 group-hover:text-white
									transition-colors duration-200">
							<AiFillProfile className="text-xl" />
						</span>
						<span className="flex-1 text-center text-sm font-medium">
							View friend profile
						</span>
					</Link>
					<button
						className="flex items-center w-full px-6 py-3 rounded-2xl
								bg-gray-700/50 hover:bg-gray-600/50 
								text-gray-200 
								transition-all duration-200
								group focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<span className="flex items-center justify-center w-8 h-8 
									text-gray-300 group-hover:text-white
									transition-colors duration-200">
							<FaUserFriends className="text-xl" />
						</span>
						{!friendRequests[user.id] ? (
							<span 
								className="flex-1 text-center text-sm font-medium" 
								onClick={() => handleFriendRequest(user.id)}
							>
								Add friend
							</span>
						) : (
							<div className="flex items-center space-x-2">
								<div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
								<span className="text-yellow-400">Friend Request sent</span>
							</div>
						)}
					</button>
				</div>
			</div>
		</div>
	);
};
const UserCart2 = ({ user }) => {
	if (!user) {
		return (
		<div className="bg-gray-800/30 backdrop-blur-sm p-6 rounded-xl shadow-2xl w-full max-w-96
						border border-gray-700/50 flex items-center justify-center min-h-[600px]">
			<p className="text-gray-400 text-center">Select a user to view details</p>
		</div>
		);
	}

	return (
		<div className="bg-gray-800/30 backdrop-blur-sm p-6 rounded-xl shadow-2xl w-full max-w-96
						transform transition-all duration-300 hover:scale-[1.02]
						border border-gray-700/50">
			<div>
				<div className="border-b border-gray-700/50 pb-8">
					<h1 className="text-2xl font-bold text-gray-100 mb-6">
						{user.username}
					</h1>
					
					<div className="relative flex justify-center">
						<img 
							src={user.avatar}
							alt="Profile"
							className="w-32 h-32 rounded-xl object-cover ring-4 ring-blue-500/30 shadow-xl"
						/>
					</div>

					<div className="mt-6 flex flex-col items-center gap-2">
						<span className="flex items-center gap-2 px-4 py-1.5 bg-green-500/10 text-green-400 rounded-full text-sm">
						<div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
							{user.status}
						</span>
					</div>
				</div>

				<div className="mt-6 space-y-3">
				{[
					{ icon: <AiFillProfile className="text-xl" />, label: "View friend profile" },
					{ icon: <FaUserFriends className="text-xl" />, label: "Add friend" },
					{ icon: <FaGamepad className="text-xl" />, label: "Invite to game" },
					{ icon: <TbTournament className="text-xl" />, label: "Invite to tournament" },
					{ icon: <IoChatbubbleEllipses className="text-xl" />, label: "Start conversation" },
					{ icon: <MdBlock className="text-xl" />, label: "Block user" },
				].map((action, index) => (
					
					<Link href={user.username}
						key={index}
						className="flex items-center w-full px-6 py-3 rounded-2xl
								bg-gray-700/50 hover:bg-gray-600/50 
								text-gray-200 
								transition-all duration-200
								group focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<span className="flex items-center justify-center w-8 h-8 
									text-gray-300 group-hover:text-white
									transition-colors duration-200">
							{action.icon}
						</span>
						<span className="flex-1 text-center text-sm font-medium">
							{action.label}
						</span>
					</Link>
				))}
				</div>
			</div>
		</div>
	);
};

export default Friends;