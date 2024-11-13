'use client';
import { useEffect, useState, useCallback } from 'react';
import { deleteData, getData, postData } from '@/services/apiCalls';
import { TfiStatsUp } from 'react-icons/tfi';
import { notFound, usePathname } from 'next/navigation';
import { useWebSocketContext } from '@/components/websocket/websocketContext';
import { FaGamepad, FaUserPlus, FaBan } from 'react-icons/fa';
import { MdOutlineEmail, MdPerson, MdPhone } from 'react-icons/md';
import { FaUserCircle, FaHistory, FaClock, FaTrophy } from 'react-icons/fa';
import useNotificationContext from '@/components/navbar/useNotificationContext';
import { IoPersonRemove } from 'react-icons/io5';
import { MdDoNotDisturbOff } from 'react-icons/md';

export default function FriendProfile({ params }) {
	const { pageNotFound, setPageNotFound } = useWebSocketContext();
	const {
		isConnected,
		notificationType,
		NOTIFICATION_TYPES,
		lastJsonMessage,
		sendMessage,
		lastMessage,
	} = useNotificationContext();

	const [profile, setProfile] = useState({});
	const [friendStatusRequest, setFriendStatusRequest] = useState('no');
	const pathname = usePathname();

	const removeFriend = useCallback(() => {
		//http request to remove friend
		if (profile?.id)
		deleteData(`/removeFriend/${profile.id}`)
			.then(response => {
			if (response.status === 200) {
				setFriendStatusRequest('no');
			}
			})
			.catch(error => {
			console.log(error);
			});
	}, [profile?.id]);

	const blockFriend = useCallback(() => {
		//http request to block friend
		if (profile?.id)
		postData(`/blockFriend/${profile.id}`)
			.then(response => {
			if (response.status === 200) {
				setFriendStatusRequest('blocked');
			}
			})
			.catch(error => {
			console.log(error);
			});
	}, [profile?.id]);

	const removeBlock = useCallback(() => {
		//http request to block friend
		if (profile?.id)
		deleteData(`/removeBlock/${profile.id}`)
			.then(response => {
			if (response.status === 200) {
				setFriendStatusRequest('no');
			}
			})
			.catch(error => {
			console.log(error);
			});
	}, [profile?.id]);

	const sendFriendRequest = useCallback(() => {
		if (isConnected && profile?.id) {
		setFriendStatusRequest('pending');
		sendMessage(
			JSON.stringify({
			type: NOTIFICATION_TYPES.FRIENDSHIP,
			to_user_id: profile.id,
			})
		);
		}
	}, [isConnected, profile?.id, NOTIFICATION_TYPES, sendMessage]);

	// Handle notification status changes
	useEffect(() => {
		if (!notificationType?.type) return;

		if (notificationType.type === NOTIFICATION_TYPES.ACCEPT_FRIEND && notificationType.status) {
		setFriendStatusRequest('accepted');
		}
		if (notificationType.type === NOTIFICATION_TYPES.REJECT_FRIEND && notificationType.status) {
		setFriendStatusRequest('no');
		}
	}, [notificationType, NOTIFICATION_TYPES]);

	// Fetch initial profile and friend status
	useEffect(() => {
		const fetchFriendProfile = async params => {
		const unwrappedParams = await params;
		if (!unwrappedParams.friendProfile) {
			setPageNotFound(true);
			return;
		}
		try {
			const response = await getData(`/friendProfile/${unwrappedParams.friendProfile}`);
			if (response.status === 200) {
			setProfile(response.data);
			setFriendStatusRequest(response.data.friend);
			} else {
			setPageNotFound(true);
			}
		} catch (error) {
			setPageNotFound(true);
		}
		};
		fetchFriendProfile(params);
	}, []);

	// Handle websocket messages
	useEffect(() => {
		if (!lastJsonMessage || !isConnected) return;

		if (lastJsonMessage.type === NOTIFICATION_TYPES.REJECT_FRIEND) {
		setFriendStatusRequest('no');
		}

		if (
		lastJsonMessage.type === 'user_status_change' &&
		lastJsonMessage.username === profile.username
		) {
		setProfile(prev => ({ ...prev, status: lastJsonMessage.status }));
		}
	}, [lastJsonMessage, isConnected, profile.username]);

	return (
		profile?.id && (
		<div className="profile container max-md:p-3 overflow-hidden">
			{/* user avatar and infos */}
			<div className="profile-top-infos flex justify-evenly items-center gap-1 max-2xl:gap-10 max-sm:gap-6 mt-[6rem] max-md:mt-0 flex-wrap w-full">
			<div className="profile-pic-name flex justify-center flex-col gap-4 items-center">
				{/* avatar */}
				<div className="flex items-start gap-4 max-md:items-center max-md:flex-col max-md:justify-center max-md:gap-1">
				{/* the avatar */}
				<div className="w-40 h-40 max-md:w-40 max-md:h-40 border-2 border-white rounded-full overflow-hidden">
					{/* avatar */}
					<img
					className="w-full h-full object-cover"
					src={profile?.avatar}
					alt="profile picture"
					/>
					{/* username */}
				</div>
				<div className="text-white bg-blue-700 hover:bg-blue-800 rounded-lg px-5 py-1 text-center inline-flex items-center">
					{profile?.username}
				</div>
				</div>

				<div className="profile-update-button w-full">
				<button className="edit-btn flex items-center space-x-2 rounded-md bg-white px-6 py-3 text-[1rem] shadow-md">
					<span className="text-gray-700">{profile?.status}</span>
					<span
					className={`h-3 w-3 rounded-full ${profile?.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}
					></span>
				</button>
				</div>
			</div>

			
			{/* display user infos */}
			<div className="user-infos">
				<div className="info-section rounded-md text-lg font-roboto max-sm:text-unset flex items-start justify-center flex-col px-8 h-60">
				<div className="flex justify-start items-center gap-7 py-3 w-full">
					<MdOutlineEmail className="bg-indigo-500 text-white w-8 h-8 p-1.5 rounded-full" />
					<span className="">Email: {profile?.email}</span>
				</div>
				<div className="flex justify-start items-center gap-7 py-3 w-full">
					<FaUserCircle className="bg-emerald-500 text-white w-8 h-8 p-1.5 rounded-full" />
					<span className="">First Name: {profile?.first_name}</span>
				</div>
				<div className="flex justify-start items-center gap-7 py-3 w-full">
					<MdPerson className="bg-amber-500 text-white w-8 h-8 p-1.5 rounded-full" />
					<span className="">Last Name: {profile?.last_name}</span>
				</div>
				<div className="flex justify-start items-center gap-7 py-3 w-full">
					<MdPhone className="bg-rose-500 text-white w-8 h-8 p-1.5 rounded-full" />
					<span className="">Phone: {profile?.phone || '06666666666'}</span>
				</div>
				</div>
			</div>
			</div>
			{/* user level */}
			<div className="profile-level h-full mt-4 mx-auto w-[83%] max-xl:w-[95%]">
			<div className="bg-gray-200 rounded-md h-10 text-center overflow-hidden border border-white">
				<div
				className="bg-darkgreen text-white text-center p-0.5 h-full"
				style={{ width: '45%' }}
				>
				<div className="leading-9">Level 45%</div>
				</div>
			</div>
			</div>

			{/* for stats charts and history */}
			<div className="user-stats-history flex justify-between items-start flex-wrap pt-9 mt-10">
			{/* user history: games 1v1 */}
			<div className="user-history mx-auto p-4">
				<div className="flex justify-between items-center mb-1">
				<div className="flex items-center bg-gray-800 hover:bg-gray-600 transition-all text-white py-3 px-4 rounded-lg shadow-md">
					<FaHistory className="mr-3" />
					Match History
				</div>
				</div>

				<div className="max-h-96 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-[#ffffff70] scrollbar-track-transparent scroll-smooth">
								history
				</div>
			</div>

			{/* user statistics */}
			<div className="user-stats mx-auto p-4 max-md:mt-10">
				<div className="stats-icon text-xl font-medium lg:text-center max-lg:mt-10">
				<TfiStatsUp className="inline-block mx-2" />
				Your Stats
				</div>

				<div className="user-stats-details flex justify-center items-center flex-wrap gap-5 p-5 mt-14 rounded-lg px-8">
							statistics chart
				</div>
			</div>
			</div>
		</div>
		)
	);
}
