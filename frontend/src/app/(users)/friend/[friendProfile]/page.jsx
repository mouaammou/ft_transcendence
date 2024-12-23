'use client';
import { useEffect, useState, useCallback } from 'react';
import { deleteData, getData, postData } from '@/services/apiCalls';
import { TfiStatsUp } from 'react-icons/tfi';
import { notFound, usePathname } from 'next/navigation';
import { useWebSocketContext } from '@/components/websocket/websocketContext';
import { FaGamepad, FaUserPlus, FaBan } from 'react-icons/fa';
import { MdOutlineEmail, MdPerson, MdPhone } from 'react-icons/md';
import useNotificationContext from '@/components/navbar/useNotificationContext';
import { IoPersonRemove } from 'react-icons/io5';
import { MdDoNotDisturbOff } from 'react-icons/md';
import { MdOutlineAlternateEmail, MdDataSaverOff, MdEmail, MdUpdate } from 'react-icons/md';
import { IoMdPhonePortrait } from 'react-icons/io';
import { GrHistory } from 'react-icons/gr';
import { CiUser } from 'react-icons/ci';
import { FaUser, FaUserCheck, FaClock, FaHistory } from 'react-icons/fa';
import { GiBattleAxe } from 'react-icons/gi';
import Image from 'next/image';
import DoughnutChart from '@/components/userStats/userStatsCharts';
import Link from 'next/link';
import { FaTrophy } from 'react-icons/fa';
import { useAuth } from '@/components/auth/loginContext';
import { useRouter } from 'next/navigation';

export default function FriendProfile({ params }) {
	const {
		isConnected,
		notificationType,
		NOTIFICATION_TYPES,
		lastJsonMessage,
		sendMessage,
	} = useNotificationContext();

	const { profileData: data } = useAuth();

	const [profile, setProfile] = useState({});
	const [friendStatusRequest, setFriendStatusRequest] = useState('no');
	const [pageNotFound, setPageNotFound] = useState(false);
	const router = useRouter();

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
	}, [profile?.id, setFriendStatusRequest]);

	const removeBlock = useCallback(() => {
		//http request to block friend
		if (profile?.id)
		deleteData(`/removeBlock/${profile.id}`)
			.then(response => {
			if (response.status === 200) {
				setFriendStatusRequest('accepted');
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
			
			if (data.username === unwrappedParams.friendProfile) {
				router.push('/profile');
				return ;
			}
			try {
				const response = await getData(`/friendProfile/${unwrappedParams.friendProfile}`);
				if (response.status === 200) {
					setProfile(response.data);
					setFriendStatusRequest(response.data.friend);
					console.log("friend user:: ==> ", response);
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

	useEffect(() => {
		if (pageNotFound) {
			setPageNotFound(false);
			notFound();
		}
	}, [pageNotFound]);

	return (
		profile && (data.username !== profile.friendProfile) && !pageNotFound && (
			<div className="min-h-screen bg-gray-900 text-white">
			{/* Hero Section with Background */}
				<div className="relative h-72 w-full overflow-hidden">
					<Image
						src="/gaming-demo.jpeg"
						alt="profile background"
						width={1920}
						height={1080}
						className="w-full h-full object-cover object-center filter brightness-50"
					/>
				<div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900" />
			</div>

			{/* Main Content */}
			<div className="container mx-auto px-4 -mt-32 relative z-1">
				{/* Profile Header */}
				<div className="flex items-center mb-12 justify-around w-full">
					{/* USER PROFILE */}
					<div className='user-profile w-96'>
						<div className="relative w-fit">
							<img
								src={profile.avatar}
								alt="profile avatar"
								className="w-40 h-40 rounded-full border-4 border-sky-500 shadow-xl object-cover transform hover:scale-105 transition-transform duration-300"
							/>
							<div className="absolute -bottom-1 -right-2 bg-sky-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
								Level 5
							</div>
						</div>
						
						<div className="mt-4 text-center">
							<h1 className="text-3xl font-bold">{`${profile.first_name} ${profile.last_name}`}</h1>
							<p className="text-sky-400">@{profile.username}</p>
						</div>

						{/* Level Progress Bar */}
						<div className="w-full max-w-md mt-6">
							<div className="bg-gray-700 h-4 rounded-full overflow-hidden">
								<div 
									className="h-full bg-gradient-to-r from-sky-500 to-sky-400 transition-all duration-500 ease-out"
									style={{ width: '45%' }}
								>
								</div>
							</div>
							<div className="flex justify-between text-sm mt-1">
								<span>Level 5</span>
								<span>45/100 XP</span>
							</div>
						</div>
					</div>

					{/* USER ACTIONS */}
					<div className="actions max-w-96 w-full  bg-gray-800 rounded-2xl p-6 shadow-lg">
						<h2 className="text-xl font-semibold mb-6 flex items-center">
							<FaUserPlus className="mr-2" /> Actions
						</h2>
						{friendStatusRequest === 'no' && (
							<button
								onClick={sendFriendRequest}
								className="w-full mt-6 bg-sky-500 hover:bg-sky-600 text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
							>
								<FaUserPlus className="mr-2" /> Add Friend
							</button>
						)}

						{friendStatusRequest === 'accepted' && (
							<>
								<Link href="/create_join_tournament"
									className="w-full mt-6 bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
								>
									<FaTrophy className="mr-2" /> Add to Tournament
								</Link>
								<Link href="/mode"
									className="w-full mt-6 bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
								>
									<FaGamepad className="mr-2" /> Add to Game
								</Link>
								<button
									onClick={blockFriend}
									className="w-full mt-6 bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
								>
									<FaBan className="mr-2" /> Block
								</button>
								<button
									onClick={removeFriend}
									className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
								>
									<IoPersonRemove className="mr-2" /> Remove Friend
								</button>
							</>
						)}

						{friendStatusRequest === 'pending' && (
							<div className="flex items-center space-x-2">
								<div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
								<span className="text-yellow-400">Friend Request Pending</span>
							</div>
						)}

						{friendStatusRequest === 'blocked' && (
							<button
								onClick={removeBlock}
								className="w-full mt-6 bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
							>
								<MdDoNotDisturbOff className="mr-2" /> Remove Block
							</button>
						)}

						{friendStatusRequest === 'rejected' && (
							<span className="text-red-400">Friend Request Rejected</span>
						)}
					</div>
				</div>

				{/* Grid Layout for Info Cards */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
					{/* User Info Card */}
					<div className="bg-gray-800 rounded-2xl p-6 shadow-lg">
						<h2 className="text-xl font-semibold mb-6 flex items-center">
							<FaUser className="mr-2" /> Profile Information
						</h2>
					
						<div className="space-y-4">
							{[
								{ icon: <FaUserCheck />, label: "Username", value: profile.username },
								{ icon: <MdEmail />, label: "Email", value: profile.email },
								{ icon: <MdPhone />, label: "Phone", value: profile.phone || "No phone number" },
							].map((item, index) => (
								<div key={index} className="flex items-center p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
								<span className="text-sky-400 mr-3">{item.icon}</span>
								<div>
									<div className="text-sm text-gray-400">{item.label}</div>
									<div className="font-medium">{item.value}</div>
								</div>
								</div>
							))}
						</div>
					</div>

					{/* Match History Card */}
					<div className="bg-gray-800 rounded-2xl p-6 shadow-lg">
						<h2 className="text-xl font-semibold mb-6 flex items-center">
							<FaHistory className="mr-2" /> Recent Matches
						</h2>
					
						<div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
							{[1, 2, 3, 4, 5, 6].map((match, index) => (
								<div key={index} className="bg-gray-700 rounded-xl p-4 hover:bg-gray-600 transition-all duration-300">
								<div className="flex justify-between items-center">
									{/* Player 1 */}
									<div className="flex items-center space-x-3">
										<img
										src="https://randomuser.me/api/portraits/men/1.jpg"
										alt="Player 1"
										className="w-12 h-12 rounded-full border-2 border-green-500"
										/>
										<div>
										<div className="font-medium">John Doe</div>
										<div className="text-green-400 text-lg font-bold">21</div>
										</div>
									</div>

									{/* VS */}
									<div className="flex flex-col items-center">
										<GiBattleAxe className="text-gray-400 text-xl" />
										<div className="text-sm text-gray-400 mt-1">VS</div>
									</div>

									{/* Player 2 */}
									<div className="flex items-center space-x-3">
										<div className="text-right">
										<div className="font-medium">Jane Smith</div>
										<div className="text-red-400 text-lg font-bold">18</div>
										</div>
										<img
										src="https://randomuser.me/api/portraits/women/3.jpg"
										alt="Player 2"
										className="w-12 h-12 rounded-full border-2 border-red-500"
										/>
									</div>
								</div>
								
								<div className="mt-3 text-sm text-gray-400 flex items-center justify-center">
									<MdUpdate className="mr-1" />
									2023-09-07 • 3:00 PM
								</div>
								</div>
							))}
						</div>
					</div>
				</div>
				
				{/* Stats Section */}
				<div className="bg-gray-800 rounded-2xl p-6 shadow-lg mb-12">
					<h2 className="text-xl font-semibold mb-6 flex items-center">
						<TfiStatsUp className="mr-2" /> Statistics
					</h2>
					<div className="w-full h-[500px] md:h-[700px]"> {/* Add fixed heights and full width */}
						<DoughnutChart />
					</div>
				</div>
			</div>
			</div>
		)
	);
}
