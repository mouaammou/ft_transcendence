'use client';
import React, { useEffect, useState } from 'react';
import { MdNavigateNext, MdNavigateBefore } from "react-icons/md";
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

import { getData } from "@/services/apiCalls";
import useNotificationContext from '@/components/navbar/useNotificationContext';
import Modal from '@/components/modals/Modal';

const Friends = () => {
	const { users, isConnected, sendMessage, NOTIFICATION_TYPES } = useNotificationContext();
	const router = useRouter();
	const query_params = useSearchParams();
	const [page, setPage] = useState(1);
	const [friends, setFriends] = useState([]);
	const [selectedFriend, setSelectedFriend] = useState(null);

	const [openModal, setOpenModal] = useState(false);
	const [modalMessage, setModalMessage] = useState('');
	const [msgDescription, setMsgDescription] = useState('');


	const handleFriendClick = (friend) => {
		setSelectedFriend(friend);
	}


	const sendGameInvitation = () => {
		if (selectedFriend?.id) {
			console.log('sending game invitation to: ', selectedFriend);

				sendMessage(JSON.stringify({
					type: NOTIFICATION_TYPES.INVITE_GAME,
					to_user_id: selectedFriend.id,
				}));
			}
	}


	const handleNextClick = () => {
		if (selectedFriend) {
			// Do something with selectedFriend
			console.log('selectedFriend :: ', selectedFriend);
			// store the selected friend in localstorage
			localStorage.setItem('selectedFriend', JSON.stringify(selectedFriend));
			sendGameInvitation();
			router.push('/waiting_friends_game');
		} else {
			setOpenModal(true);
			setModalMessage('Please select a friend');
			setMsgDescription('You need to select a friend to invite to the game');
		}
	}

	const fetchAllUsers = async (page) => {
		try {
			const response = await getData(`/friends?page=${page}`);
			if (response.status === 200) {
				setFriends(() => {
					const friends = response.data.results;
					const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
					console.log('storedUsers :: ', storedUsers);
					const mergedUsers = friends.map((user) => {
						const newUser = storedUsers.find((newUser) => newUser.username === user.username);
						console.log('newUser :: ', newUser);
						if (newUser) {
							return { ...user, status: newUser.status || "offline" };
						}
						return user;
					});
					return mergedUsers;
				});
			}
		} catch (error) {
			console.error("Error fetching users in friends page:", error);
		}
	};

	// useEffect(() => {
	// 	//save the users in localstorage
	// 	setFriends((prevUsers) => {
	// 		console.log('users :: ', users);
	// 		// Merge the existing users with the new users and update the status
	// 		const mergedUsers = prevUsers.map((user) => {
	// 			const newUser = users.find((newUser) => newUser.username === user.username);
	// 			if (newUser) {
	// 				return { ...user, status: newUser.status || "offline" };
	// 			}
	// 			return user;
	// 		});
	// 		return mergedUsers;
	// 	});
	// }, [users, isConnected]);

	// Fetch users on the initial render
	useEffect(() => {
		const page = query_params.get('page') || 1;
		fetchAllUsers(page);

		return () => {
		}
	}, [page]);


	return (
		<>
			<div className="flex flex-col items-center justify-center min-h-screen py-2">
				<div className=" flex flex-col bg-white gap-3 bg-opacity-25 backdrop-filter backdrop-blur-md p-4 rounded-xl">
					<h2 className="text-2xl font-bold  text-center">Your Online Friends</h2>
					<div className="flex flex-wrap items-center justify-around max-w-4xl mb-3 sm:w-full">
						{friends.map((friend) => {
							return (<div key={friend.id}>
								<div
									
									className={`p-1 m-2 rounded-full shadow-md flex items-center cursor-pointer ${friend === selectedFriend ? 'bg-white' : 'bg-transparent'}`}
									onClick={() => handleFriendClick(friend)}
								>
									<div className="flex-shrink-0">
										<img className="h-16 w-16 rounded-full" src={friend.avatar} alt={friend.name} />
									</div>
								</div>
										<p className='text-center'>{friend.username}</p></div>
							)
						}
						)}
					</div>
					<button onClick={handleNextClick} className="px-4 py-2 m-auto items-center justify-center text-white bg-blue-500 rounded-md hover:bg-blue-700">
						Next
					</button>
				</div>
			</div>
			<Modal isOpen={openModal} title={modalMessage} description={msgDescription} action={() => setOpenModal(false)} />
		</>
	);
};

function Friend({ friend }) {
	return (
		<div className="flex items-center space-x-4 relative">
			<img src={friend.avatar} alt={friend.username} className="w-12 h-12 rounded-full" />
			<div
				className={`absolute top-0 right-0 w-3 h-3 rounded-full ${friend.online ? 'bg-red-500' : 'bg-green-500'}`}
			/>
		</div>
	);
}

// export default function ListOfFriends() {
//   const [friends, setFriends] = useState([]);
//   const router = useRouter();

//   useEffect(() => {
//     fetchFriends().then(setFriends);
//   }, []);

// }

export default Friends;
