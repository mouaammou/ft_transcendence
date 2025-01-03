'use client';
import { useEffect, useState, useCallback } from 'react';
import { deleteData, getData, postData } from '@/services/apiCalls';
import { TfiStatsUp } from 'react-icons/tfi';
import { notFound, usePathname } from 'next/navigation';
import { FaGamepad, FaUserPlus, FaBan } from 'react-icons/fa';
import { MdPhone } from 'react-icons/md';
import useNotificationContext from '@/components/navbar/useNotificationContext';
import { IoPersonRemove } from 'react-icons/io5';
import { MdEmail, MdUpdate } from 'react-icons/md';
import { FaUser, FaUserCheck, FaHistory } from 'react-icons/fa';
import Link from 'next/link';
import { FaTrophy } from 'react-icons/fa';
import { useAuth } from '@/components/auth/loginContext';
import { useRouter } from 'next/navigation';
import { AreaChart, XAxis, YAxis, Tooltip, Area, CartesianGrid, ResponsiveContainer, PieChart, Pie, Sector, Cell, } from 'recharts';
import { Toaster, toast } from 'react-hot-toast';
import { HiShieldExclamation, HiShieldCheck } from 'react-icons/hi';

const ActionButton = ({ onClick, variant = "primary", icon: Icon, children }) => {
	const baseStyle = "w-full flex items-center justify-center px-2 py-1 md:px-4 md:py-2.5 rounded md:rounded-xl font-medium transition-all duration-200";
	const variants = {
		primary: "bg-blue-500/90 hover:bg-blue-600 text-white",
		success: "bg-emerald-500/90 hover:bg-emerald-600 text-white",
		danger: "bg-rose-500/90 hover:bg-rose-600 text-white",
		warning: "bg-amber-500/90 hover:bg-amber-600 text-white",
	};

	return (
		<button
			onClick={onClick}
			className={`${baseStyle} ${variants[variant]}`}
		>
			<Icon className="mr-2 text-lg" />
			{children}
		</button>
	);
};

const ActionLink = ({ href, variant = "primary", icon: Icon, children }) => {
	const baseStyle = "w-full flex items-center justify-center px-2 py-1 md:px-4 md:py-2.5 rounded md:rounded-xl font-medium transition-all duration-200";
	const variants = {
		primary: "bg-blue-500/90 hover:bg-blue-600 text-white",
		success: "bg-emerald-500/90 hover:bg-emerald-600 text-white",
	};

	return (
		<Link href={href} className={`${baseStyle} ${variants[variant]}`}>
			<Icon className="mr-2 text-lg" />
			{children}
		</Link>
	);
};

const FriendProfileActions = ({
	friendStatusRequest,
	sendFriendRequest,
	inviteToGame,
	blockFriend,
	removeFriend,
	removeBlock
}) => {
	return (
		<div className="w-full max-w-96 bg-gray-800 rounded-xl p-2 md:p-5 shadow-lg">
			<h2 className="text-sm md:text-lg font-medium text-gray-200 mb-4">Actions</h2>

			<div className="space-y-3 text-xs md:text-lg">
				{friendStatusRequest === 'no' && (
					<ActionButton
						onClick={sendFriendRequest}
						variant="primary"
						icon={FaUserPlus}
					>
						Add Friend
					</ActionButton>
				)}

				{friendStatusRequest === 'accepted' && (
					<>
						<ActionLink
							href="/create_join_tournament"
							variant="success"
							icon={FaTrophy}
						>
							Create Tournament
						</ActionLink>

						<ActionButton
							onClick={inviteToGame}
							variant="primary"
							icon={FaGamepad}
						>
							Play Game
						</ActionButton>

						<ActionButton
							onClick={blockFriend}
							variant="warning"
							icon={HiShieldExclamation}
						>
							Block User
						</ActionButton>

						<ActionButton
							onClick={removeFriend}
							variant="danger"
							icon={IoPersonRemove}
						>
							Remove Friend
						</ActionButton>

					</>
				)}

				{friendStatusRequest === 'pending' && (
					<div className="flex items-center space-x-3 px-4 py-2.5 rounded-lg bg-gray-700/50">
						<div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent"></div>
						<span className="text-blue-400 text-sm">Request Pending</span>
					</div>
				)}

				{friendStatusRequest === 'blocking' && (
					<ActionButton
						onClick={removeBlock}
						variant="warning"
						icon={HiShieldCheck}
					>
						Unblock User
					</ActionButton>
				)}

				{friendStatusRequest === 'rejected' && (
					<div className="px-4 py-2.5 rounded-lg bg-rose-500/10 text-rose-400 text-sm text-center">
						Request Rejected
					</div>
				)}
			</div>
		</div>
	);
};



export default function FriendProfile({ params }) {
	const [profile, setProfile] = useState({});
	const [matches, setMatches] = useState([]);
	const [pageNumber, setPageNumber] = useState(1);
	const { profileData: data, setSelectedUser, isAuth } = useAuth();
	const [pongData, setPongData] = useState([]);
	const [c4stats, setC4Stats] = useState([]);
	const router = useRouter();
	const pathname = usePathname();
	const [pageNotFound, setPageNotFound] = useState(false);


	useEffect(() => {
		if (!isAuth) {
			// Direct navigation to login without going through 404
			router.replace('/login');
		}
	}, [isAuth, router]);

	const [progressData, setProgressData] = useState({
		level: 0,
		progress: 0,
		currentXp: 0,
	});

	const inviteToGame = () => {
		if (profile?.id) {
			setSelectedUser(profile);
			if (isConnected)
				sendMessage(JSON.stringify({
					type: NOTIFICATION_TYPES.INVITE_GAME,
					to_user_id: profile.id,
				}));
		}
		router.push('/waiting_friends_game');

	};

	const fetchProgressData = useCallback(async (userId) => {
		if (!userId)
			return;
		try {

			const response = await getData(`/progress/${userId}`);
			if (response.status === 200) {
				setProgressData({
					level: response.data.level,
					progress: response.data.progress,
					currentXp: response.data.current_xp,
				});
			}
		} catch (error) {

		}
	}, []);



	const fetchPongData = useCallback(async (userId) => {
		try {
			const response = await getData(`/pongstats/${userId}`);
			if (response.status === 200) {
				setPongData(response.data);
			}
		} catch (error) {
		}
	}, []);

	const fetchC4StatsData = useCallback(async (userId) => {
		try {
			const response = await getData(`/stats/${userId}`);
			if (response.status === 200) {
				setC4Stats(response.data);
			}
		} catch (error) {

		}
	}, []);


	const fetchGameHistory = useCallback(async (userId) => {
		if (!userId)
			return;
		try {

			const response = await getData(`/gamehistory/${userId}?page=${1}`);
			if (response.status === 200) {
				setMatches(response.data.results);
				setPageNumber(pageNumber);
			}
		} catch (error) {
		}
	}, []);

	useEffect(() => {
		if (!profile.id || !isAuth) return;
		fetchProgressData(profile.id);
		fetchPongData(profile.id);
		fetchC4StatsData(profile.id);
		fetchGameHistory(profile.id);
	}, [profile, fetchProgressData, fetchPongData, fetchC4StatsData, fetchGameHistory, pathname, isAuth]);

	// Update the page not found effect
	useEffect(() => {
		if (pageNotFound && isAuth) {
			setPageNotFound(false);
			notFound();
		}
	}, [pageNotFound, isAuth]);


	const RADIAN = Math.PI / 180;
	const COLORS = ['#82ca9d', '#ef4444', '#F59E0B', '#f97316'];


	const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
		const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
		const x = cx + radius * Math.cos(-midAngle * RADIAN);
		const y = cy + radius * Math.sin(-midAngle * RADIAN);

		return (
			<text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
				{`${(percent * 100).toFixed(0)}%`}
			</text>
		);
	};

	const {
		isConnected,
		notificationType,
		NOTIFICATION_TYPES,
		lastJsonMessage,
		sendMessage,
		lastMessage
	} = useNotificationContext();


	const [friendStatusRequests, setFriendStatusRequests] = useState({});
	const [currentProfileId, setCurrentProfileId] = useState(null);


	// Modify the friend status update functions
	const updateFriendStatus = (userId, status) => {
		setFriendStatusRequests(prevStatuses => ({
			...prevStatuses,
			[userId]: status
		}));
	};

	// Update the friend action callbacks
	const removeFriend = useCallback(() => {
		if (isConnected && profile?.id) {
			updateFriendStatus(profile.id, 'no');
			sendMessage(
				JSON.stringify({
					type: NOTIFICATION_TYPES.REMOVE_FRIEND,
					to_user_id: profile.id,
				})
			);
		}
	}, [isConnected, profile?.id, sendMessage]);

	const blockFriend = useCallback(() => {
		if (isConnected && profile?.id) {
			updateFriendStatus(profile.id, 'blocking');
			sendMessage(
				JSON.stringify({
					type: NOTIFICATION_TYPES.BLOCK,
					to_user_id: profile.id,
				})
			);
		}
	}, [isConnected, profile?.id, sendMessage]);

	const removeBlock = useCallback(() => {
		if (isConnected && profile?.id) {
			updateFriendStatus(profile.id, 'accepted');
			sendMessage(
				JSON.stringify({
					type: NOTIFICATION_TYPES.REMOVE_BLOCK,
					to_user_id: profile.id,
				})
			);
		}
	}, [isConnected, profile?.id, sendMessage]);

	const sendFriendRequest = useCallback(() => {
		if (isConnected && profile?.id) {
			console.log('Sending friend request to:', profile.id);
			updateFriendStatus(profile.id, 'pending');
			sendMessage(
				JSON.stringify({
					type: NOTIFICATION_TYPES.FRIENDSHIP,
					to_user_id: profile.id,
				})
			);
		}
	}, [isConnected, profile?.id, sendMessage]);

	// Update the fetch profile effect
	useEffect(() => {
		const fetchFriendProfile = async params => {
			// If not authenticated, don't try to fetch
			if (!isAuth) return;

			const unwrappedParams = await params;
			if (!unwrappedParams.friendProfile) {
				setPageNotFound(true);
				return;
			}

			if (data.username === unwrappedParams.friendProfile) {
				router.push('/profile');
				return;
			}

			try {
				const response = await getData(`/friendProfile/${unwrappedParams.friendProfile}`);
				if (response.status === 200) {
					if (currentProfileId !== response.data.id) {
						setCurrentProfileId(response.data.id);
						updateFriendStatus(response.data.id, response.data.friend);
					}
					setProfile(response.data);
				} else {
					setPageNotFound(true);
				}
			} catch (error) {
				// Only set pageNotFound if we're still authenticated
				if (isAuth) {
					setPageNotFound(true);
				}
			}
		};
		fetchFriendProfile(params);
	}, [params, data.username, pathname, currentProfileId, isAuth]);

	// Update the websocket message handler effect
	useEffect(() => {
		if (!lastJsonMessage || !isConnected || !profile.id) return;

		if (
			lastJsonMessage.type === 'user_status_change' &&
			lastJsonMessage.username === profile.username
		) {
			setProfile(prev => ({ ...prev, status: lastJsonMessage.status }));
		}

		// Get the relevant user ID from the message
		const messageUserId = lastJsonMessage.from_user_id || lastJsonMessage.to_user_id;

		// Check if this message is relevant for the current friend status
		const isRelevantMessage = messageUserId &&
			(messageUserId === profile.id || lastJsonMessage.to_user_id === profile.id);

		if (!isRelevantMessage) {
			return;
		}

		// Handle different message types
		switch (lastJsonMessage.type) {
			case NOTIFICATION_TYPES.REJECT_FRIEND:
				if (lastJsonMessage.to_user_id === profile.id) {
					updateFriendStatus(profile.id, 'no');
				}
				break;

			//
			case NOTIFICATION_TYPES.ACCEPT_FRIEND:
				if (lastJsonMessage.to_user_id === profile.id) {
					updateFriendStatus(profile.id, 'accepted');
				}
				break;

			case NOTIFICATION_TYPES.REMOVE_BLOCK:
				if (lastJsonMessage.success && lastJsonMessage.to_user_id === profile.id) {
					updateFriendStatus(profile.id, 'accepted');
				}
				break;

			case NOTIFICATION_TYPES.BLOCK:
				if (lastJsonMessage.success && lastJsonMessage.to_user_id == profile.id) {
					updateFriendStatus(profile.id, lastJsonMessage.blocked ? 'blocked' : 'blocking');
				}
				break;

			case NOTIFICATION_TYPES.REMOVE_FRIEND:
				if (lastJsonMessage.success && lastJsonMessage.to_user_id === profile.id) {
					updateFriendStatus(profile.id, 'no');
				}
				break;

			case NOTIFICATION_TYPES.ACCEPTED_DONE:
				if (lastJsonMessage.success && lastJsonMessage.to_user_id === profile.id) {
					updateFriendStatus(profile.id, 'accepted');
				}
				break;
		}

		// Handle error cases
		if ((lastJsonMessage.type === NOTIFICATION_TYPES.BLOCK ||
			lastJsonMessage.type === NOTIFICATION_TYPES.REMOVE_BLOCK ||
			lastJsonMessage.type === NOTIFICATION_TYPES.REMOVE_FRIEND) &&
			!lastJsonMessage.success &&
			lastJsonMessage.to_user_id === profile.id) {
			updateFriendStatus(profile.id, 'accepted');
			toast.error("ERROR: ", lastJsonMessage.message || lastJsonMessage.error);
		}
	}, [lastJsonMessage, isConnected, profile?.id, lastMessage]);

	// Update the pending timeout effect
	useEffect(() => {
		if (pageNotFound) {
			setPageNotFound(false);
			notFound();
		}
		if (profile?.id) {
			const timeoutId = setTimeout(() => {
				if (friendStatusRequests[profile.id] === 'pending') {
					updateFriendStatus(profile.id, 'no');
				}
			}, 2000);
			return () => clearTimeout(timeoutId);
		}
	}, [pageNotFound, friendStatusRequests, profile?.id]);

	return (
		profile && (data.username !== profile.friendProfile) && !pageNotFound && (
			<div className="min-h-screen bg-gray-900 text-white">
				{/* Hero Section with Background */}
				<div className="relative h-72 w-full overflow-hidden">
					<img
						src="/gaming-demo.jpeg"
						alt="profile background"
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
									className="w-28 sm:w-40 h-28 sm:h-40 rounded-full border-4 border-sky-500 shadow-xl object-cover transform hover:scale-105 transition-transform duration-300"
								/>
								<div
									className={`absolute -bottom-1 -right-2 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${profile?.status == 'online' ? 'bg-green-500' : 'bg-red-500'
										} text-white`}
								>
									{profile?.status == 'online' ? 'Online' : 'Offline'}
								</div>
							</div>

							<div className="mt-4 text-center">
								<h1 className="text-lg sm:text-3xl font-bold">{`${profile.first_name} ${profile.last_name}`}</h1>
								<p className="text-md text-sky-400">@{profile.username}</p>
							</div>

							{/* Level Progress Bar */}
							<div className="w-full max-w-md mt-6  p-2">
								<div className="bg-gray-700 h-4 rounded-full overflow-hidden">
									<div
										className="h-full bg-gradient-to-r from-sky-500 to-sky-400 transition-all duration-500 ease-out"
										style={{ width: `${progressData.progress}%` }}
									>
									</div>
								</div>
								<div className="flex justify-between text-xs md:text-sm mt-1">
									<span>Level {progressData.level}</span>
									<span>{progressData.currentXp}/100 XP</span>
								</div>
							</div>
						</div>

						{/* USER ACTIONS */}

						<FriendProfileActions
							friendStatusRequest={friendStatusRequests[profile?.id] || 'no'}
							sendFriendRequest={sendFriendRequest}
							inviteToGame={inviteToGame}
							blockFriend={blockFriend}
							removeFriend={removeFriend}
							removeBlock={removeBlock}
						/>
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
									<div key={index} className="flex items-center p-3 bg-gray-700 rounded-xl hover:bg-gray-600 transition-colors">
										<span className="text-sky-400 mr-3">{item.icon}</span>
										<div>
											<div className="text-sm text-gray-400">{item.label}</div>
											<div className="font-medium">{item.value}</div>
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Game History Card */}
						<div className="bg-gray-800 rounded-2xl p-6 shadow-lg">
							<h2 className="text-xl font-semibold mb-6 flex items-center">
								<FaHistory className="mr-2" /> Recent Matches
							</h2>

							<div className="space-y-4 max-h-[400px] overflow-y-auto overflow-x-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
								<div className="min-w-[480px]">
									{matches.map((match) => (
										<div
											key={match.id}
											className="bg-gray-700 rounded-xl p-4 hover:bg-gray-600 transition-all duration-300 mb-4"
										>
											<div className="flex justify-between items-center">
												{/* Player 1 */}
												<div className="flex items-center space-x-3">
													<img
														src={match.player_1.avatar}
														alt="player_1"
														className={`w-12 h-12 rounded-full border-2  cursor-pointer ${match.winner_id === match.player_1.id ? 'border-green-500' : 'border-red-500'
															}`}
														onClick={() => router.push(`/friend/${match.player_1.username}`)}
													/>
													<div>
														<div className="font-medium  cursor-pointer" onClick={() => router.push(`/friend/${match.player_1.username}`)}>{match.player_1.username}</div>
														<div className={`text-lg font-bold ${match.winner_id === match.player_1.id ? 'text-green-400' : 'text-red-400'
															}`}>
															{match.player_1_score}
														</div>
													</div>
												</div>

												{/* VS */}
												<div className="flex flex-col items-center">
													<div className="text-l font-bold text-gray-400">
														{match.finish_type == 'defeat' ? '' : match.finish_type == 'draw' ? 'Draw' : 'Disconnection'}
													</div>
													<div className="text-sm text-gray-400 mt-1">
														{match.game_type == 'connect_four' ? '🚥 Connect Four 🚥' : '🏓 Ping Pong 🏓'}
													</div>
													<div className="mt-3 text-sm text-gray-400 flex items-center justify-center">
														<MdUpdate className="mr-1" />
														{match.creation_date} • {match.creation_time.slice(0, 5)}
													</div>
												</div>

												{/* Player 2 */}
												<div className="flex items-center space-x-3">
													<div className="text-right">
														<div className="font-medium cursor-pointer" onClick={() => router.push(`/friend/${match.player_2.username}`)}>{match.player_2.username}</div>
														<div className={`text-lg font-bold ${match.winner_id === match.player_2.id ? 'text-green-400' : 'text-red-400'
															}`}>
															{match.player_2_score}
														</div>
													</div>
													<img
														src={match.player_2.avatar}
														alt="player_2"
														className={`w-12 h-12 rounded-full border-2 cursor-pointer ${match.winner_id === match.player_2.id ? 'border-green-500' : 'border-red-500'
															}`}
														onClick={() => router.push(`/friend/${match.player_2.username}`)}
													/>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
						{/* Stats Section */}

						<div className="bg-gray-800 rounded-2xl p-6 shadow-lg mb-12">
							<h2 className="text-xl font-semibold mb-6 flex items-center">
								<TfiStatsUp className="mr-2" /> Ping Pong Stats
							</h2>
							<ResponsiveContainer width="100%" height={300}>
								<AreaChart data={pongData}
									margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
									<defs>
										<linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
											<stop offset="45%" stopColor="#d62929" stopOpacity={0.8} />
											<stop offset="95%" stopColor="#d62929" stopOpacity={0} />
										</linearGradient>
										<linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
											<stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
											<stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
										</linearGradient>
									</defs>
									<XAxis dataKey="date" />
									<YAxis />
									<CartesianGrid strokeDasharray="3 3" />
									<Tooltip />
									<Area type="monotone" dataKey="losses" stroke="#d62929" fillOpacity={1} fill="url(#colorUv)" />
									<Area type="monotone" dataKey="wins" stroke="#82ca9d" fillOpacity={1} fill="url(#colorPv)" />
								</AreaChart>
							</ResponsiveContainer>
						</div>
						<div className="bg-gray-800 rounded-2xl p-6 shadow-lg mb-12">
							<h2 className="text-xl font-semibold flex mb-6 items-center">
								<TfiStatsUp className="mr-2" /> Connect Four Stats
							</h2>
							<div className="flex flex-wrap justify-center">
								<div className="flex items-center mr-4 mb-2">
									<div className="w-5 h-5 rounded-xl bg-[#82ca9d] mr-2"></div>
									<span>Wins</span>
								</div>
								<div className="flex items-center mr-4 mb-2">
									<div className="w-5 h-5 rounded-xl bg-yellow-500 mr-2"></div>
									<span>Draws</span>
								</div>
								<div className="flex items-center mr-4 mb-2">
									<div className="w-5 h-5 rounded-xl bg-red-500 mr-2"></div>
									<span>Losses</span>
								</div>
								<div className="flex items-center mr-4 mb-2">
									<div className="w-5 h-5 rounded-xl bg-orange-500 mr-2"></div>
									<span>Disconnects</span>
								</div>
							</div>
							<ResponsiveContainer width="100%" height={300}>
								<PieChart >
									<Pie
										data={c4stats}
										cx="50%"
										cy="50%"
										labelLine={false}
										label={renderCustomizedLabel}
										outerRadius={120}
										fill="#8884d8"
										dataKey="value"
										innerRadius={5}
										startAngle={0}
										endAngle={360}
										paddingAngle={3}
										minAngle={1}
										nameKey="name"
										blendStroke={true}
										rootTabIndex={2}
									>
										{c4stats.map((entry, index) => (
											<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
										))}
									</Pie>
								</PieChart>
							</ResponsiveContainer>
						</div>
					</div>
				</div>
			</div>
		)
	);
}
