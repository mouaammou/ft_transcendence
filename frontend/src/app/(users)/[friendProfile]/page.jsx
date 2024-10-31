"use client";
import { useEffect, useState } from 'react';
import { getData } from '@/services/apiCalls';
import { TfiStatsUp } from "react-icons/tfi";
import { notFound, usePathname } from 'next/navigation';
import { useWebSocketContext } from '@/components/websocket/websocketContext';
import { FaGamepad, FaUserPlus, FaBan } from 'react-icons/fa';
import { MdOutlineEmail, MdPerson, MdPhone } from 'react-icons/md';
import { FaUserCircle, FaHistory, FaClock, FaTrophy } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function FriendProfile({ params }) {

	const [userStatus, setUserStatus] = useState(() => {
		const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
		const foundUser = storedUsers.find((user) => user.username == params.friendProfile);
		if (foundUser) {
			return foundUser.status;
		}
		return 'offline';
	});

	const [profile, setProfile] = useState(() => {
		console.log('fetching profile from local storage ', params.friendProfile);
		return JSON.parse(localStorage.getItem(`profile_${params.friendProfile}`)) || {};
	});

	const [userNotFound, setUserNotFound] = useState(false);
	const {websocket, isConnected, notificationType, listOfNotifications,hasGetMessage, setHasGetMessage} = useWebSocketContext();
	const pathname = usePathname();
	const [friendStatusRequest, setFriendStatusRequest] = useState('no');
	const router = useRouter();

	useEffect(() => {
		if (notificationType.type === listOfNotifications.acceptFriend
		&& notificationType.status === true) {
			setFriendStatusRequest('accepted');
		}
		if (notificationType.type === listOfNotifications.rejectFriend 
		&& notificationType.status === true) {
			setFriendStatusRequest('no');
		}
	}, [notificationType]);

	const sendFriendRequest = () => {
		if (isConnected && profile?.id) {
			setFriendStatusRequest('pending');
			console.log('sending friend request to: ', profile.id);
			websocket.current.send(JSON.stringify({
				type: 'send_friend_request',
				to_user_id: profile.id,
			}));
		}
	}

	useEffect(() => {
		const fetchProfile = async () => {
			if (!params.friendProfile) {
				setUserNotFound(true);
				return ;
			}
			try {
				console.log("FETCHING PROFILE");
				const response = await getData(`/friendProfile/${params.friendProfile}`);
				if (response.status === 200) {
					const fetchedProfile = response.data;
					if (response.data.Error) {
						setProfile({});
						router.push('/profile');
					}
					else {
						console.log('set in local storage friend when fetch:: ', fetchedProfile.username);
						localStorage.setItem(`profile_${fetchedProfile.username}`, JSON.stringify(fetchedProfile));
						setProfile(fetchedProfile);
						setFriendStatusRequest(fetchedProfile.friend);
					}

				}
				else {
					setUserNotFound(true);
				}
			} catch (error) {
				setUserNotFound(true);
			}
		};
		fetchProfile();

		return () => {//cleanup when component unmount
			setUserNotFound(false);
			localStorage.removeItem(`profile_${params.friendProfile}`);
		};
	}, [pathname]);

	useEffect(() => {
			if (profile.id) {
				const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
				const foundUser = storedUsers.find((user) => (user.username == profile.username || user.username == params.friendProfile));
				if (foundUser)
					setUserStatus(foundUser.status);  // Update the userStatus with the found user's status
				else
					setUserStatus('offline');  // Default to offline if the user isn't found
				setHasGetMessage(false);
		}
	}, [hasGetMessage]);

	if (userNotFound) {
		notFound();
	}

	return (
		profile.id && (
			<div className="profile container max-md:p-3 overflow-hidden">
				{/* user avatar and infos */}
				<div className="profile-top-infos flex justify-evenly items-center gap-1 max-2xl:gap-10 max-sm:gap-6 mt-[6rem] max-md:mt-0 flex-wrap w-full">
					<div className="profile-pic-name flex justify-center flex-col gap-4 items-center">
						{/* avatar */}
						<div className="flex items-start gap-4 max-md:items-center max-md:flex-col max-md:justify-center max-md:gap-1">
							{/* the avatar */}
							<div className="w-40 h-40 max-md:w-40 max-md:h-40 border-2 border-white rounded-full overflow-hidden">
								{/* avatar */}
								<img className="w-full h-full object-cover" src={profile?.avatar} alt="profile picture" />
								{/* username */}
							</div>
							<div
							className="text-white bg-blue-700 hover:bg-blue-800 rounded-lg px-5 py-1 text-center inline-flex items-center"
							>
								{profile?.username}
							</div>
						</div>

						<div className="profile-update-button w-full">
							<button 
								className="edit-btn flex items-center space-x-2 rounded-md bg-white px-6 py-3 text-[1rem] shadow-md"
							>
								<span className="text-gray-700">{userStatus}</span>
								<span className={`h-3 w-3 rounded-full ${userStatus === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></span>
							</button>
						</div>
					</div>

					{/* send friend request, invite to game, invite to tournament, block    */}
					<div
						className="mt-2 divide-y rounded-lg"
					>
						<ul className="py-0 text-sm text-gray-700 w-full">
							{friendStatusRequest === 'accepted' && 
								<>
									<li className="w-full py-3 px-4 bg-emerald-500 text-white text-sm text-center rounded-md cursor-pointer my-2 mt-0 hover:bg-emerald-600 transition flex items-center justify-center">
										<FaTrophy className="mr-2 size-5" /> Invite to Tournament
									</li>
									<li className="w-full py-3 px-4 bg-sky-500 text-white text-sm text-center rounded-md cursor-pointer my-2 hover:bg-sky-600 transition flex items-center justify-center">
										<FaGamepad className="mr-2 size-5" /> Invite to Game
									</li>
								</>
							}
							{(friendStatusRequest === 'no') && (
								<li
									onClick={() => {
										sendFriendRequest();
									}}
									className="w-full py-3 px-4 bg-amber-400 text-white text-sm text-center rounded-md cursor-pointer my-2 hover:bg-amber-500 transition flex items-center justify-center">
									<FaUserPlus className="mr-2 size-5" /> Add to Friend List
								</li>
								)}
								
								{friendStatusRequest === 'pending' && (
									<li className="w-full py-3 px-4 bg-gray-500 text-white text-sm text-center rounded-md cursor-pointer my-2 hover:bg-gray-600 transition flex items-center justify-center">
										Pending
									</li>
								)}
								{friendStatusRequest === 'accepted' && (
									<li className="w-full py-3 px-4 bg-rose-500 text-white text-sm text-center rounded-md cursor-pointer my-2 hover:bg-rose-600 transition flex items-center justify-center">
										<FaBan className="mr-2 size-5" /> Block
									</li>
								)}
						</ul>
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

						<div className='max-h-96 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-[#ffffff70] scrollbar-track-transparent scroll-smooth'>
							{/* HISTORY 1 */}
							<div className="bg-white shadow-lg rounded-lg p-6 mx-auto mt-2">
								<div className="flex items-center justify-between flex-wrap max-sm:flex-col max-sm:gap-y-9 gap-x-6">
								{/* Player 1 */}
								<div className="flex flex-col items-start max-sm:justify-center max-sm:items-center">
									<div className="flex items-center">
										<img className="w-16 h-16 rounded-full mr-4 border-2 border-green-500" src="https://randomuser.me/api/portraits/men/1.jpg" alt="Player 1 Avatar"/>
										<div>
										<h3 className="text-lg text-gray-800">John Doe</h3>
										<p className="text-3xl font-bold text-green-600 max-sm:text-lg">21</p>
										</div>
									</div>
								</div>

								{/* Versus */}
								<div className="flex items-center">
									<svg
									fill="#444"
									height="1.5rem"
									width="1.5rem"
									version="1.1"
									id="Layer_1"
									xmlns="http://www.w3.org/2000/svg"
									xmlnsXlink="http://www.w3.org/1999/xlink"
									viewBox="0 0 510.31 510.31"
									xmlSpace="preserve"
									stroke="#000000"
									strokeWidth="0.0051031"
									transform="rotate(180) matrix(1, 0, 0, 1, 0, 0)"
									>
										<g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
										<g
											id="SVGRepo_tracerCarrier"
											strokeLinecap="round"
											strokeLinejoin="round"
											stroke="#CCCCCC"
											strokeWidth="14.288680000000003"
										></g>
										<g id="SVGRepo_iconCarrier">
											<g>
												<g>
												<path
													d="M504.06,443.728c-8.341-8.341-21.845-8.341-30.165,0h-0.021L412.946,382.8c20.096-23.915,34.731-50.389,36.928-72.768 c1.131-11.733-7.424-22.165-19.157-23.317c-11.925-1.195-22.165,7.445-23.317,19.157c-0.256,2.773-1.067,5.803-2.091,8.917 l-59.648-59.627l128.235-128.235c2.325-2.347,4.096-5.205,5.141-8.341l30.165-90.496c2.56-7.68,0.555-16.128-5.141-21.845 c-5.717-5.717-14.187-7.701-21.845-5.141L391.719,31.27c-3.136,1.045-5.995,2.816-8.341,5.163L255.143,164.646L126.93,36.432 c-2.325-2.347-5.184-4.117-8.341-5.163L28.092,1.104c-7.616-2.56-16.128-0.597-21.824,5.141 c-5.717,5.717-7.723,14.165-5.163,21.845l30.165,90.496c1.045,3.136,2.816,5.995,5.163,8.341l128.213,128.213l-59.904,59.925 c-0.917-2.965-1.621-5.824-1.771-8.405c-0.704-11.755-10.88-20.693-22.592-20.011c-11.776,0.725-20.693,10.837-19.989,22.592 c1.344,22.251,16.149,49.237,36.864,73.643l-60.821,60.843c-8.341-8.341-21.845-8.341-30.165,0c-8.341,8.32-8.341,21.824,0,30.165 l30.165,30.165c4.16,4.16,9.621,6.251,15.083,6.251s10.901-2.091,15.083-6.251c8.32-8.341,8.32-21.845,0-30.165l60.907-60.928 c23.915,20.096,50.411,34.709,72.789,36.885c0.725,0.085,1.408,0.107,2.091,0.107c10.859,0,20.139-8.235,21.205-19.264 c1.152-11.712-7.445-22.165-19.157-23.296c-2.773-0.277-5.803-1.067-8.917-2.112l59.648-59.627l59.904,59.904 c-2.965,0.917-5.824,1.621-8.405,1.771c-11.776,0.704-20.715,10.816-20.011,22.592c0.683,11.307,10.091,20.032,21.269,20.032 c0.448,0,0.875,0,1.323-0.043c22.251-1.344,49.216-16.149,73.621-36.864l60.843,60.843c-8.32,8.32-8.32,21.824,0,30.165 c4.181,4.16,9.643,6.251,15.104,6.251c5.44,0,10.901-2.091,15.083-6.251l30.165-30.165 C512.38,465.552,512.38,452.048,504.06,443.728z M157.927,382.544c-5.653-4.587-11.2-9.557-16.448-14.784 c-0.149-0.149-0.299-0.32-0.448-0.469c-4.715-4.736-9.237-9.728-13.419-14.784l67.2-67.179l30.187,30.165L157.927,382.544z M298.194,207.696l-12.864-12.885L409.98,70.16l45.269-15.083l-15.104,45.248L315.495,224.998L298.194,207.696z"
												></path>
												</g>
											</g>
										</g>
									</svg>
								</div>

								{/* Player 2 */}
								<div className="flex flex-col items-end max-sm:justify-center max-sm:items-center">
									<div className="flex items-center">
										<div className="text-right mr-4">
										<h4 className="text-lg text-gray-800">Jane Smith</h4>
										<p className="text-3xl max-sm:text-lg font-bold text-red-600">18</p>
										</div>
										<img className="w-16 h-16 rounded-full border-2 border-red-500" src="https://randomuser.me/api/portraits/women/3.jpg" alt="Player 2 Avatar"/>
									</div>
								</div>
								</div>

								{/* Match Duration */}
								<div className="flex justify-center items-center mt-2 text-sm text-gray-600">
								<FaClock className="mr-1" />
								<span>Match Duration: 15m 30s</span>
								</div>
							</div>
							{/* END HISTORY 1*/}
							{/* HISTORY 1 */}
							<div className="bg-white shadow-lg rounded-lg p-6 mx-auto mt-2">
								<div className="flex items-center justify-between flex-wrap max-sm:flex-col max-sm:gap-y-9 gap-x-6">
								{/* Player 1 */}
								<div className="flex flex-col items-start max-sm:justify-center max-sm:items-center">
									<div className="flex items-center">
										<img className="w-16 h-16 rounded-full mr-4 border-2 border-green-500" src="https://randomuser.me/api/portraits/men/1.jpg" alt="Player 1 Avatar"/>
										<div>
										<h3 className="text-lg text-gray-800">John Doe</h3>
										<p className="text-3xl font-bold text-green-600 max-sm:text-lg">21</p>
										</div>
									</div>
								</div>

								{/* Versus */}
								<div className="flex items-center">
									<svg
									fill="#444"
									height="1.5rem"
									width="1.5rem"
									version="1.1"
									id="Layer_1"
									xmlns="http://www.w3.org/2000/svg"
									xmlnsXlink="http://www.w3.org/1999/xlink"
									viewBox="0 0 510.31 510.31"
									xmlSpace="preserve"
									stroke="#000000"
									strokeWidth="0.0051031"
									transform="rotate(180) matrix(1, 0, 0, 1, 0, 0)"
									>
										<g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
										<g
											id="SVGRepo_tracerCarrier"
											strokeLinecap="round"
											strokeLinejoin="round"
											stroke="#CCCCCC"
											strokeWidth="14.288680000000003"
										></g>
										<g id="SVGRepo_iconCarrier">
											<g>
												<g>
												<path
													d="M504.06,443.728c-8.341-8.341-21.845-8.341-30.165,0h-0.021L412.946,382.8c20.096-23.915,34.731-50.389,36.928-72.768 c1.131-11.733-7.424-22.165-19.157-23.317c-11.925-1.195-22.165,7.445-23.317,19.157c-0.256,2.773-1.067,5.803-2.091,8.917 l-59.648-59.627l128.235-128.235c2.325-2.347,4.096-5.205,5.141-8.341l30.165-90.496c2.56-7.68,0.555-16.128-5.141-21.845 c-5.717-5.717-14.187-7.701-21.845-5.141L391.719,31.27c-3.136,1.045-5.995,2.816-8.341,5.163L255.143,164.646L126.93,36.432 c-2.325-2.347-5.184-4.117-8.341-5.163L28.092,1.104c-7.616-2.56-16.128-0.597-21.824,5.141 c-5.717,5.717-7.723,14.165-5.163,21.845l30.165,90.496c1.045,3.136,2.816,5.995,5.163,8.341l128.213,128.213l-59.904,59.925 c-0.917-2.965-1.621-5.824-1.771-8.405c-0.704-11.755-10.88-20.693-22.592-20.011c-11.776,0.725-20.693,10.837-19.989,22.592 c1.344,22.251,16.149,49.237,36.864,73.643l-60.821,60.843c-8.341-8.341-21.845-8.341-30.165,0c-8.341,8.32-8.341,21.824,0,30.165 l30.165,30.165c4.16,4.16,9.621,6.251,15.083,6.251s10.901-2.091,15.083-6.251c8.32-8.341,8.32-21.845,0-30.165l60.907-60.928 c23.915,20.096,50.411,34.709,72.789,36.885c0.725,0.085,1.408,0.107,2.091,0.107c10.859,0,20.139-8.235,21.205-19.264 c1.152-11.712-7.445-22.165-19.157-23.296c-2.773-0.277-5.803-1.067-8.917-2.112l59.648-59.627l59.904,59.904 c-2.965,0.917-5.824,1.621-8.405,1.771c-11.776,0.704-20.715,10.816-20.011,22.592c0.683,11.307,10.091,20.032,21.269,20.032 c0.448,0,0.875,0,1.323-0.043c22.251-1.344,49.216-16.149,73.621-36.864l60.843,60.843c-8.32,8.32-8.32,21.824,0,30.165 c4.181,4.16,9.643,6.251,15.104,6.251c5.44,0,10.901-2.091,15.083-6.251l30.165-30.165 C512.38,465.552,512.38,452.048,504.06,443.728z M157.927,382.544c-5.653-4.587-11.2-9.557-16.448-14.784 c-0.149-0.149-0.299-0.32-0.448-0.469c-4.715-4.736-9.237-9.728-13.419-14.784l67.2-67.179l30.187,30.165L157.927,382.544z M298.194,207.696l-12.864-12.885L409.98,70.16l45.269-15.083l-15.104,45.248L315.495,224.998L298.194,207.696z"
												></path>
												</g>
											</g>
										</g>
									</svg>
								</div>

								{/* Player 2 */}
								<div className="flex flex-col items-end max-sm:justify-center max-sm:items-center">
									<div className="flex items-center">
										<div className="text-right mr-4">
										<h4 className="text-lg text-gray-800">Jane Smith</h4>
										<p className="text-3xl max-sm:text-lg font-bold text-red-600">18</p>
										</div>
										<img className="w-16 h-16 rounded-full border-2 border-red-500" src="https://randomuser.me/api/portraits/women/3.jpg" alt="Player 2 Avatar"/>
									</div>
								</div>
								</div>

								{/* Match Duration */}
								<div className="flex justify-center items-center mt-2 text-sm text-gray-600">
								<FaClock className="mr-1" />
								<span>Match Duration: 15m 30s</span>
								</div>
							</div>
							{/* END HISTORY 1*/}
							{/* HISTORY 1 */}
							<div className="bg-white shadow-lg rounded-lg p-6 mx-auto mt-2">
								<div className="flex items-center justify-between flex-wrap max-sm:flex-col max-sm:gap-y-9 gap-x-6">
								{/* Player 1 */}
								<div className="flex flex-col items-start max-sm:justify-center max-sm:items-center">
									<div className="flex items-center">
										<img className="w-16 h-16 rounded-full mr-4 border-2 border-green-500" src="https://randomuser.me/api/portraits/men/1.jpg" alt="Player 1 Avatar"/>
										<div>
										<h3 className="text-lg text-gray-800">John Doe</h3>
										<p className="text-3xl font-bold text-green-600 max-sm:text-lg">21</p>
										</div>
									</div>
								</div>

								{/* Versus */}
								<div className="flex items-center">
									<svg
									fill="#444"
									height="1.5rem"
									width="1.5rem"
									version="1.1"
									id="Layer_1"
									xmlns="http://www.w3.org/2000/svg"
									xmlnsXlink="http://www.w3.org/1999/xlink"
									viewBox="0 0 510.31 510.31"
									xmlSpace="preserve"
									stroke="#000000"
									strokeWidth="0.0051031"
									transform="rotate(180) matrix(1, 0, 0, 1, 0, 0)"
									>
										<g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
										<g
											id="SVGRepo_tracerCarrier"
											strokeLinecap="round"
											strokeLinejoin="round"
											stroke="#CCCCCC"
											strokeWidth="14.288680000000003"
										></g>
										<g id="SVGRepo_iconCarrier">
											<g>
												<g>
												<path
													d="M504.06,443.728c-8.341-8.341-21.845-8.341-30.165,0h-0.021L412.946,382.8c20.096-23.915,34.731-50.389,36.928-72.768 c1.131-11.733-7.424-22.165-19.157-23.317c-11.925-1.195-22.165,7.445-23.317,19.157c-0.256,2.773-1.067,5.803-2.091,8.917 l-59.648-59.627l128.235-128.235c2.325-2.347,4.096-5.205,5.141-8.341l30.165-90.496c2.56-7.68,0.555-16.128-5.141-21.845 c-5.717-5.717-14.187-7.701-21.845-5.141L391.719,31.27c-3.136,1.045-5.995,2.816-8.341,5.163L255.143,164.646L126.93,36.432 c-2.325-2.347-5.184-4.117-8.341-5.163L28.092,1.104c-7.616-2.56-16.128-0.597-21.824,5.141 c-5.717,5.717-7.723,14.165-5.163,21.845l30.165,90.496c1.045,3.136,2.816,5.995,5.163,8.341l128.213,128.213l-59.904,59.925 c-0.917-2.965-1.621-5.824-1.771-8.405c-0.704-11.755-10.88-20.693-22.592-20.011c-11.776,0.725-20.693,10.837-19.989,22.592 c1.344,22.251,16.149,49.237,36.864,73.643l-60.821,60.843c-8.341-8.341-21.845-8.341-30.165,0c-8.341,8.32-8.341,21.824,0,30.165 l30.165,30.165c4.16,4.16,9.621,6.251,15.083,6.251s10.901-2.091,15.083-6.251c8.32-8.341,8.32-21.845,0-30.165l60.907-60.928 c23.915,20.096,50.411,34.709,72.789,36.885c0.725,0.085,1.408,0.107,2.091,0.107c10.859,0,20.139-8.235,21.205-19.264 c1.152-11.712-7.445-22.165-19.157-23.296c-2.773-0.277-5.803-1.067-8.917-2.112l59.648-59.627l59.904,59.904 c-2.965,0.917-5.824,1.621-8.405,1.771c-11.776,0.704-20.715,10.816-20.011,22.592c0.683,11.307,10.091,20.032,21.269,20.032 c0.448,0,0.875,0,1.323-0.043c22.251-1.344,49.216-16.149,73.621-36.864l60.843,60.843c-8.32,8.32-8.32,21.824,0,30.165 c4.181,4.16,9.643,6.251,15.104,6.251c5.44,0,10.901-2.091,15.083-6.251l30.165-30.165 C512.38,465.552,512.38,452.048,504.06,443.728z M157.927,382.544c-5.653-4.587-11.2-9.557-16.448-14.784 c-0.149-0.149-0.299-0.32-0.448-0.469c-4.715-4.736-9.237-9.728-13.419-14.784l67.2-67.179l30.187,30.165L157.927,382.544z M298.194,207.696l-12.864-12.885L409.98,70.16l45.269-15.083l-15.104,45.248L315.495,224.998L298.194,207.696z"
												></path>
												</g>
											</g>
										</g>
									</svg>
								</div>

								{/* Player 2 */}
								<div className="flex flex-col items-end max-sm:justify-center max-sm:items-center">
									<div className="flex items-center">
										<div className="text-right mr-4">
										<h4 className="text-lg text-gray-800">Jane Smith</h4>
										<p className="text-3xl max-sm:text-lg font-bold text-red-600">18</p>
										</div>
										<img className="w-16 h-16 rounded-full border-2 border-red-500" src="https://randomuser.me/api/portraits/women/3.jpg" alt="Player 2 Avatar"/>
									</div>
								</div>
								</div>

								{/* Match Duration */}
								<div className="flex justify-center items-center mt-2 text-sm text-gray-600">
								<FaClock className="mr-1" />
								<span>Match Duration: 15m 30s</span>
								</div>
							</div>
							{/* END HISTORY 1*/}
							{/* HISTORY 1 */}
							<div className="bg-white shadow-lg rounded-lg p-6 mx-auto mt-2">
								<div className="flex items-center justify-between flex-wrap max-sm:flex-col max-sm:gap-y-9 gap-x-6">
								{/* Player 1 */}
								<div className="flex flex-col items-start max-sm:justify-center max-sm:items-center">
									<div className="flex items-center">
										<img className="w-16 h-16 rounded-full mr-4 border-2 border-green-500" src="https://randomuser.me/api/portraits/men/1.jpg" alt="Player 1 Avatar"/>
										<div>
										<h3 className="text-lg text-gray-800">John Doe</h3>
										<p className="text-3xl font-bold text-green-600 max-sm:text-lg">21</p>
										</div>
									</div>
								</div>

								{/* Versus */}
								<div className="flex items-center">
									<svg
									fill="#444"
									height="1.5rem"
									width="1.5rem"
									version="1.1"
									id="Layer_1"
									xmlns="http://www.w3.org/2000/svg"
									xmlnsXlink="http://www.w3.org/1999/xlink"
									viewBox="0 0 510.31 510.31"
									xmlSpace="preserve"
									stroke="#000000"
									strokeWidth="0.0051031"
									transform="rotate(180) matrix(1, 0, 0, 1, 0, 0)"
									>
										<g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
										<g
											id="SVGRepo_tracerCarrier"
											strokeLinecap="round"
											strokeLinejoin="round"
											stroke="#CCCCCC"
											strokeWidth="14.288680000000003"
										></g>
										<g id="SVGRepo_iconCarrier">
											<g>
												<g>
												<path
													d="M504.06,443.728c-8.341-8.341-21.845-8.341-30.165,0h-0.021L412.946,382.8c20.096-23.915,34.731-50.389,36.928-72.768 c1.131-11.733-7.424-22.165-19.157-23.317c-11.925-1.195-22.165,7.445-23.317,19.157c-0.256,2.773-1.067,5.803-2.091,8.917 l-59.648-59.627l128.235-128.235c2.325-2.347,4.096-5.205,5.141-8.341l30.165-90.496c2.56-7.68,0.555-16.128-5.141-21.845 c-5.717-5.717-14.187-7.701-21.845-5.141L391.719,31.27c-3.136,1.045-5.995,2.816-8.341,5.163L255.143,164.646L126.93,36.432 c-2.325-2.347-5.184-4.117-8.341-5.163L28.092,1.104c-7.616-2.56-16.128-0.597-21.824,5.141 c-5.717,5.717-7.723,14.165-5.163,21.845l30.165,90.496c1.045,3.136,2.816,5.995,5.163,8.341l128.213,128.213l-59.904,59.925 c-0.917-2.965-1.621-5.824-1.771-8.405c-0.704-11.755-10.88-20.693-22.592-20.011c-11.776,0.725-20.693,10.837-19.989,22.592 c1.344,22.251,16.149,49.237,36.864,73.643l-60.821,60.843c-8.341-8.341-21.845-8.341-30.165,0c-8.341,8.32-8.341,21.824,0,30.165 l30.165,30.165c4.16,4.16,9.621,6.251,15.083,6.251s10.901-2.091,15.083-6.251c8.32-8.341,8.32-21.845,0-30.165l60.907-60.928 c23.915,20.096,50.411,34.709,72.789,36.885c0.725,0.085,1.408,0.107,2.091,0.107c10.859,0,20.139-8.235,21.205-19.264 c1.152-11.712-7.445-22.165-19.157-23.296c-2.773-0.277-5.803-1.067-8.917-2.112l59.648-59.627l59.904,59.904 c-2.965,0.917-5.824,1.621-8.405,1.771c-11.776,0.704-20.715,10.816-20.011,22.592c0.683,11.307,10.091,20.032,21.269,20.032 c0.448,0,0.875,0,1.323-0.043c22.251-1.344,49.216-16.149,73.621-36.864l60.843,60.843c-8.32,8.32-8.32,21.824,0,30.165 c4.181,4.16,9.643,6.251,15.104,6.251c5.44,0,10.901-2.091,15.083-6.251l30.165-30.165 C512.38,465.552,512.38,452.048,504.06,443.728z M157.927,382.544c-5.653-4.587-11.2-9.557-16.448-14.784 c-0.149-0.149-0.299-0.32-0.448-0.469c-4.715-4.736-9.237-9.728-13.419-14.784l67.2-67.179l30.187,30.165L157.927,382.544z M298.194,207.696l-12.864-12.885L409.98,70.16l45.269-15.083l-15.104,45.248L315.495,224.998L298.194,207.696z"
												></path>
												</g>
											</g>
										</g>
									</svg>
								</div>

								{/* Player 2 */}
								<div className="flex flex-col items-end max-sm:justify-center max-sm:items-center">
									<div className="flex items-center">
										<div className="text-right mr-4">
										<h4 className="text-lg text-gray-800">Jane Smith</h4>
										<p className="text-3xl max-sm:text-lg font-bold text-red-600">18</p>
										</div>
										<img className="w-16 h-16 rounded-full border-2 border-red-500" src="https://randomuser.me/api/portraits/women/3.jpg" alt="Player 2 Avatar"/>
									</div>
								</div>
								</div>

								{/* Match Duration */}
								<div className="flex justify-center items-center mt-2 text-sm text-gray-600">
								<FaClock className="mr-1" />
								<span>Match Duration: 15m 30s</span>
								</div>
							</div>
							{/* END HISTORY 1*/}
							{/* HISTORY 1 */}
							<div className="bg-white shadow-lg rounded-lg p-6 mx-auto mt-2">
								<div className="flex items-center justify-between flex-wrap max-sm:flex-col max-sm:gap-y-9 gap-x-6">
								{/* Player 1 */}
								<div className="flex flex-col items-start max-sm:justify-center max-sm:items-center">
									<div className="flex items-center">
										<img className="w-16 h-16 rounded-full mr-4 border-2 border-green-500" src="https://randomuser.me/api/portraits/men/1.jpg" alt="Player 1 Avatar"/>
										<div>
										<h3 className="text-lg text-gray-800">John Doe</h3>
										<p className="text-3xl font-bold text-green-600 max-sm:text-lg">21</p>
										</div>
									</div>
								</div>

								{/* Versus */}
								<div className="flex items-center">
									<svg
									fill="#444"
									height="1.5rem"
									width="1.5rem"
									version="1.1"
									id="Layer_1"
									xmlns="http://www.w3.org/2000/svg"
									xmlnsXlink="http://www.w3.org/1999/xlink"
									viewBox="0 0 510.31 510.31"
									xmlSpace="preserve"
									stroke="#000000"
									strokeWidth="0.0051031"
									transform="rotate(180) matrix(1, 0, 0, 1, 0, 0)"
									>
										<g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
										<g
											id="SVGRepo_tracerCarrier"
											strokeLinecap="round"
											strokeLinejoin="round"
											stroke="#CCCCCC"
											strokeWidth="14.288680000000003"
										></g>
										<g id="SVGRepo_iconCarrier">
											<g>
												<g>
												<path
													d="M504.06,443.728c-8.341-8.341-21.845-8.341-30.165,0h-0.021L412.946,382.8c20.096-23.915,34.731-50.389,36.928-72.768 c1.131-11.733-7.424-22.165-19.157-23.317c-11.925-1.195-22.165,7.445-23.317,19.157c-0.256,2.773-1.067,5.803-2.091,8.917 l-59.648-59.627l128.235-128.235c2.325-2.347,4.096-5.205,5.141-8.341l30.165-90.496c2.56-7.68,0.555-16.128-5.141-21.845 c-5.717-5.717-14.187-7.701-21.845-5.141L391.719,31.27c-3.136,1.045-5.995,2.816-8.341,5.163L255.143,164.646L126.93,36.432 c-2.325-2.347-5.184-4.117-8.341-5.163L28.092,1.104c-7.616-2.56-16.128-0.597-21.824,5.141 c-5.717,5.717-7.723,14.165-5.163,21.845l30.165,90.496c1.045,3.136,2.816,5.995,5.163,8.341l128.213,128.213l-59.904,59.925 c-0.917-2.965-1.621-5.824-1.771-8.405c-0.704-11.755-10.88-20.693-22.592-20.011c-11.776,0.725-20.693,10.837-19.989,22.592 c1.344,22.251,16.149,49.237,36.864,73.643l-60.821,60.843c-8.341-8.341-21.845-8.341-30.165,0c-8.341,8.32-8.341,21.824,0,30.165 l30.165,30.165c4.16,4.16,9.621,6.251,15.083,6.251s10.901-2.091,15.083-6.251c8.32-8.341,8.32-21.845,0-30.165l60.907-60.928 c23.915,20.096,50.411,34.709,72.789,36.885c0.725,0.085,1.408,0.107,2.091,0.107c10.859,0,20.139-8.235,21.205-19.264 c1.152-11.712-7.445-22.165-19.157-23.296c-2.773-0.277-5.803-1.067-8.917-2.112l59.648-59.627l59.904,59.904 c-2.965,0.917-5.824,1.621-8.405,1.771c-11.776,0.704-20.715,10.816-20.011,22.592c0.683,11.307,10.091,20.032,21.269,20.032 c0.448,0,0.875,0,1.323-0.043c22.251-1.344,49.216-16.149,73.621-36.864l60.843,60.843c-8.32,8.32-8.32,21.824,0,30.165 c4.181,4.16,9.643,6.251,15.104,6.251c5.44,0,10.901-2.091,15.083-6.251l30.165-30.165 C512.38,465.552,512.38,452.048,504.06,443.728z M157.927,382.544c-5.653-4.587-11.2-9.557-16.448-14.784 c-0.149-0.149-0.299-0.32-0.448-0.469c-4.715-4.736-9.237-9.728-13.419-14.784l67.2-67.179l30.187,30.165L157.927,382.544z M298.194,207.696l-12.864-12.885L409.98,70.16l45.269-15.083l-15.104,45.248L315.495,224.998L298.194,207.696z"
												></path>
												</g>
											</g>
										</g>
									</svg>
								</div>

								{/* Player 2 */}
								<div className="flex flex-col items-end max-sm:justify-center max-sm:items-center">
									<div className="flex items-center">
										<div className="text-right mr-4">
										<h4 className="text-lg text-gray-800">Jane Smith</h4>
										<p className="text-3xl max-sm:text-lg font-bold text-red-600">18</p>
										</div>
										<img className="w-16 h-16 rounded-full border-2 border-red-500" src="https://randomuser.me/api/portraits/women/3.jpg" alt="Player 2 Avatar"/>
									</div>
								</div>
								</div>

								{/* Match Duration */}
								<div className="flex justify-center items-center mt-2 text-sm text-gray-600">
								<FaClock className="mr-1" />
								<span>Match Duration: 15m 30s</span>
								</div>
							</div>
							{/* END HISTORY 1*/}
						</div>
					</div>

					{/* user statistics */}
					<div className='user-stats mx-auto p-4 max-md:mt-10'>
						<div className="stats-icon text-xl font-medium lg:text-center max-lg:mt-10"><TfiStatsUp className="inline-block mx-2"/>Your Stats</div>
						
						<div className="user-stats-details flex justify-center items-center flex-wrap gap-5 p-5 mt-14 rounded-lg px-8">

							{/* <!-- Gauge Component --> */}
							<div className="relative size-60">
								<svg
								className="rotate-[135deg] size-full"
								viewBox="0 0 36 36"
								xmlns="http://www.w3.org/2000/svg"
								>
								{/* <!-- Background Circle (Gauge) --> */}
								<circle
									cx="18"
									cy="18"
									r="16"
									fill="none"
									className="stroke-current text-white"
									strokeWidth="1"
									strokeDasharray="75 100"
								></circle>

								{/* <!-- Gauge Progress --> */}
								<circle
									cx="18"
									cy="18"
									r="16"
									fill="none"
									className="stroke-current text-red-500"
									strokeWidth="3"
									strokeDasharray="18.75 100"
								></circle>
								</svg>

								{/* <!-- Value Text --> */}
								<div className="absolute top-1/2 start-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
									<span className="text-4xl font-bold text-red-500">25</span>
									<span className="text-red-500 block">loses</span>
								</div>
							</div>
							{/* <!-- End Gauge Component --> */}

							{/* <!-- Gauge Component --> */}
							<div className="relative size-60">
								<svg
								className="rotate-[135deg] size-full"
								viewBox="0 0 36 36"
								xmlns="http://www.w3.org/2000/svg"
								>
								{/* <!-- Background Circle (Gauge) --> */}
								<circle
									cx="18"
									cy="18"
									r="16"
									fill="none"
									className="stroke-current text-white"
									strokeWidth="1"
									strokeDasharray="75 100"
									strokeLinecap="round"
								></circle>
								{/*  */}
								{/* <!-- Gauge Progress --> */}
								<circle
									cx="18"
									cy="18"
									r="16"
									fill="none"
									className="stroke-current text-green-500"
									strokeWidth="2"
									strokeDasharray="56.25 100"
									strokeLinecap="round"
								></circle>
								</svg>

								{/* <!-- Value Text --> */}
								<div className="absolute top-1/2 start-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
									<span className="text-3xl font-bold text-green-600">75</span>
									<span className="text-green-600 block">Wins</span>
								</div>
							</div>
							{/* <!-- End Gauge Component --> */}

							{/* <!-- Gauge Component --> */}
							<div className="relative size-60">
								<svg
								className="rotate-[135deg] size-full"
								viewBox="0 0 36 36"
								xmlns="http://www.w3.org/2000/svg"
								>
									{/* <!-- Background Circle (Gauge) --> */}
									<circle
										cx="18"
										cy="18"
										r="16"
										fill="none"
										className="stroke-current text-white"
										strokeWidth="1"
										strokeDasharray="75 100"
										strokeLinecap="round"
									></circle>
									{/* <!-- Gauge Progress --> */}
									<circle
										cx="18"
										cy="18"
										r="16"
										fill="none"
										className="stroke-current text-yellow-500"
										strokeWidth="2"
										strokeDasharray="56.25 100"
										strokeLinecap="round"
									></circle>
								</svg>

								{/* <!-- Value Text --> */}
								<div className="absolute top-9 start-1/2 transform -translate-x-1/2 text-center">
									<span className="text-4xl font-bold text-yellow-500">50</span>
									<span className="text-yellow-500 block">Average</span>
								</div>
							</div>
							{/* <!-- End Gauge Component --> */}
						</div>
						
					</div>
				</div>
			</div>
		)
	);
}
