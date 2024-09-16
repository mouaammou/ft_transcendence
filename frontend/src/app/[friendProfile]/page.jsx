"use client";
import { useEffect, useState } from 'react';
import { getData } from '@/services/apiCalls';
import { MdOutlineAlternateEmail } from 'react-icons/md';
import { MdDataSaverOff } from 'react-icons/md';
import { IoMdPhonePortrait } from 'react-icons/io';
import { TfiStatsUp } from "react-icons/tfi";
import { GrHistory } from "react-icons/gr";
import { notFound } from 'next/navigation';
import { useWebSocketContext } from '@/components/websocket/websocketContext';
import { FaTrophy, FaGamepad, FaUserPlus, FaBan } from 'react-icons/fa';

export default function FriendProfile({ params }) {
	const [profile, setProfile] = useState({});
	const [userNotFound, setUserNotFound] = useState(false);
	const {websocket, isConnected} = useWebSocketContext();
	const [userStatus, setUserStatus] = useState('offline');
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		const fetchProfile = async () => {
			if (!params.friendProfile) {
				setUserNotFound(true);
				return ;
			}
			try {
				const response = await getData(`/friendProfile/${params.friendProfile}`);
				if (response.status === 200) {
					const fetchedProfile = response.data;
					setProfile(fetchedProfile);
					setUserStatus(fetchedProfile.status);
				}
				else {
					setUserNotFound(true);
				}
			} catch (error) {
				setUserNotFound(true);
			}
		};
		fetchProfile();

		if (isConnected) {
			websocket.current.onmessage = (event) => {
				const data = JSON.parse(event.data);
				if (data.type === 'user_status_change')
					setUserStatus(data.status);
			}
		}

		return () => {
			setProfile({});
			setUserNotFound(false);
		};
	}, []);

	if (userNotFound) {
		return notFound();
	}

	return (
		<div className="profile container max-md:p-3 overflow-hidden">
			{/* user avatar and infos */}
			<div className="profile-top-infos flex justify-center items-center gap-[20rem] max-2xl:gap-10 max-sm:gap-6 mt-[6rem] max-md:mt-0 flex-wrap w-full">
			<div className="profile-pic-name flex justify-center flex-col gap-4 items-center">
				{/* avatar */}
				<div className="flex items-start gap-4 max-md:items-center max-md:flex-col max-md:justify-center max-md:gap-1">
					{/* the avatar */}
					<div className="w-52 h-52 max-md:w-40 max-md:h-40 border-2 border-white rounded-full overflow-hidden">
					<img className="w-full h-full object-cover" src={profile?.avatar} alt="profile picture" />
					</div>

					{/* username & nickname */}
					{/* drop down menu */}
						<div className="relative inline-block text-left">
							<button
							onClick={() => setIsOpen(!isOpen)}
							className="text-white bg-blue-700 hover:bg-blue-800 rounded-lg px-5 py-2.5 text-center inline-flex items-center"
							type="button"
							>
								<span className='text-lg'>{profile?.username}
									<svg
										className="w-2.5 h-2.5 ms-3 inline"
										aria-hidden="true"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 10 6"
									>
										<path
										stroke="currentColor"
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="m1 1 4 4 4-4"
										/>
									</svg>
								</span>
							</button>

							{isOpen && (
								<div
									onMouseLeave={() => setIsOpen(false)}
									className="z-10 absolute left-0 mt-2 w-72 divide-y rounded-lg shadow"
								>
									<ul className="py-0 text-sm text-gray-700 w-full">
										{/* <li className="w-full py-2 px-4 bg-blue-500 text-white text-sm text-center rounded-md cursor-pointer my-2 mt-0 hover:bg-blue-600 transition">
											Invite to Tournament
										</li>
										<li className="w-full py-2 px-4 bg-indigo-500 text-white text-sm text-center rounded-md cursor-pointer my-2 hover:bg-indigo-600 transition">
											Invite to Game
										</li>
										<li className="w-full py-2 px-4 bg-green-500 text-white text-sm text-center rounded-md cursor-pointer my-2 hover:bg-green-600 transition">
											Add to Friend List
										</li>
										<li className="w-full py-2 px-4 bg-red-500 text-white text-sm text-center rounded-md cursor-pointer my-2 hover:bg-red-600 transition">
											Block
										</li> */}
										{/* <li className="w-full py-2 px-4 bg-purple-600 text-white text-sm text-center rounded-md cursor-pointer my-2 mt-0 hover:bg-purple-700 transition">
											Invite to Tournament
										</li>
										<li className="w-full py-2 px-4 bg-teal-500 text-white text-sm text-center rounded-md cursor-pointer my-2 hover:bg-teal-600 transition">
											Invite to Game
										</li>
										<li className="w-full py-2 px-4 bg-amber-500 text-white text-sm text-center rounded-md cursor-pointer my-2 hover:bg-amber-600 transition">
											Add to Friend List
										</li>
										<li className="w-full py-2 px-4 bg-rose-600 text-white text-sm text-center rounded-md cursor-pointer my-2 hover:bg-rose-700 transition">
											Block
										</li> */}

										<li className="w-full py-3 px-4 bg-emerald-500 text-white text-sm text-center rounded-md cursor-pointer my-2 mt-0 hover:bg-emerald-600 transition flex items-center justify-center">
											<FaTrophy className="mr-2" /> Invite to Tournament
										</li>
										<li className="w-full py-3 px-4 bg-sky-500 text-white text-sm text-center rounded-md cursor-pointer my-2 hover:bg-sky-600 transition flex items-center justify-center">
											<FaGamepad className="mr-2" /> Invite to Game
										</li>
										<li className="w-full py-3 px-4 bg-amber-400 text-white text-sm text-center rounded-md cursor-pointer my-2 hover:bg-amber-500 transition flex items-center justify-center">
											<FaUserPlus className="mr-2" /> Add to Friend List
										</li>
										<li className="w-full py-3 px-4 bg-rose-500 text-white text-sm text-center rounded-md cursor-pointer my-2 hover:bg-rose-600 transition flex items-center justify-center">
											<FaBan className="mr-2" /> Block
										</li>

									</ul>

								</div>

							)}
						</div>

				</div>

				<div className="profile-update-button w-full">
					<button 
						className="edit-btn flex items-center space-x-2 rounded-md bg-white px-6 py-3 text-[1rem] shadow-md"
					>
						<span className="text-gray-700">{userStatus === 'online' ? 'Online' : 'Offline'}</span>
						<span className={`h-3 w-3 rounded-full ${userStatus === 'online' ? 'bg-green-500' : 'bg-red-500'}`}/>
					</button>
				</div>
			</div>

			{/* display user infos */}
			<div className="user-infos">
				<div className="info-section rounded-md text-lg font-roboto max-sm:text-unset flex items-start justify-center flex-col px-8 h-72">
					<div className="flex justify-center items-center gap-7 py-3">
					<MdOutlineAlternateEmail className="bg-white text-black w-8 h-8 p-1 rounded-full" />
					<span>email: {profile?.email}</span>
					</div>
					<div className="flex justify-center items-center gap-7 py-3">
					<MdDataSaverOff className="bg-white text-black w-8 h-8 p-1 rounded-full" />
					<span>first_name: {profile?.first_name}</span>
					</div>
					<div className="flex justify-center items-center gap-7 py-3">
					<MdDataSaverOff className="bg-white text-black w-8 h-8 p-1 rounded-full" />
					<span>last_name: {profile?.last_name}</span>
					</div>
					<div className="flex justify-center items-center gap-7 py-3">
					<IoMdPhonePortrait className="bg-white text-black w-8 h-8 p-1 rounded-full" />
					<span>phone number: 06666666666</span>
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
						<div className="text-xl font-medium text-brand-500">
							<GrHistory className="inline-block mx-2"/>
							Match History
						</div>
					</div>

					<div className='max-h-96 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-[#ffffff70] scrollbar-track-transparent scroll-smooth'>
						{/* <!-- Match Entry 1--> */}
						<div className="bg-white shadow-md rounded-lg px-8 py-2 h-20 max-sm:h-full flex justify-between gap-2 flex-col sm:flex-row items-center mx-auto mt-8">
							{/* <!-- User Profile and Basic Info --> */}
							<div className="flex items-center mb-4 sm:mb-0 sm:mr-6">
								<img className="w-14 h-14 rounded-full mr-4" src="https://randomuser.me/api/portraits/men/1.jpg" alt="User Avatar"/>
								<div>
									<h3 className="text-lg font-semibold text-gray-800">John Doe</h3>
									<p className="text-sm text-gray-600">2023-09-07</p>
								</div>
							</div>

							{/* <!-- Match Details --> */}
							<div className="flex flex-col sm:flex-row items-center justify-between">
								{/* <!-- Gauge Component --> */}
								<div className="relative size-24 max-sm:size-12 mb-4 sm:mb-0">
									{/* <!-- Value Text --> */}
									<div className="absolute top-1/2 start-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
										<span className="text-xl font-bold text-purple-600">75</span>
										<span className="text-purple-600 block text-xs">Score</span>
									</div>
								</div>

								{/* <!-- Match Result --> */}
								<div className="text-center sm:text-right flex flex-row max-sm:flex-col items-center gap-5 max-sm:gap-0">
									<span className="bg-green-200 text-green-600 py-1 px-3 rounded-full text-sm font-semibold">Win</span>
									<div>
										<p className="mt-2 text-sm text-gray-600">21 - 18</p>
										<p className="text-sm text-gray-600 inline">15m 30s</p>
									</div>
								</div>
							</div>
						</div>
						{/* <!-- Match Entry 1--> */}
						<div className="bg-white shadow-md rounded-lg px-8 py-2 h-20 max-sm:h-full flex justify-between gap-2 flex-col sm:flex-row items-center mx-auto mt-8">
							{/* <!-- User Profile and Basic Info --> */}
							<div className="flex items-center mb-4 sm:mb-0 sm:mr-6">
								<img className="w-14 h-14 rounded-full mr-4" src="https://randomuser.me/api/portraits/men/1.jpg" alt="User Avatar"/>
								<div>
									<h3 className="text-lg font-semibold text-gray-800">John Doe</h3>
									<p className="text-sm text-gray-600">2023-09-07</p>
								</div>
							</div>

							{/* <!-- Match Details --> */}
							<div className="flex flex-col sm:flex-row items-center justify-between">
								{/* <!-- Gauge Component --> */}
								<div className="relative size-24 max-sm:size-12 mb-4 sm:mb-0">
									{/* <!-- Value Text --> */}
									<div className="absolute top-1/2 start-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
										<span className="text-xl font-bold text-purple-600">75</span>
										<span className="text-purple-600 block text-xs">Score</span>
									</div>
								</div>

								{/* <!-- Match Result --> */}
								<div className="text-center sm:text-right flex flex-row max-sm:flex-col items-center gap-5 max-sm:gap-0">
									<span className="bg-green-200 text-green-600 py-1 px-3 rounded-full text-sm font-semibold">Win</span>
									<div>
										<p className="mt-2 text-sm text-gray-600">21 - 18</p>
										<p className="text-sm text-gray-600 inline">15m 30s</p>
									</div>
								</div>
							</div>
						</div>
						{/* <!-- Match Entry 1--> */}
						<div className="bg-white shadow-md rounded-lg px-8 py-2 h-20 max-sm:h-full flex justify-between gap-2 flex-col sm:flex-row items-center mx-auto mt-8">
							{/* <!-- User Profile and Basic Info --> */}
							<div className="flex items-center mb-4 sm:mb-0 sm:mr-6">
								<img className="w-14 h-14 rounded-full mr-4" src="https://randomuser.me/api/portraits/men/1.jpg" alt="User Avatar"/>
								<div>
									<h3 className="text-lg font-semibold text-gray-800">John Doe</h3>
									<p className="text-sm text-gray-600">2023-09-07</p>
								</div>
							</div>

							{/* <!-- Match Details --> */}
							<div className="flex flex-col sm:flex-row items-center justify-between">
								{/* <!-- Gauge Component --> */}
								<div className="relative size-24 max-sm:size-12 mb-4 sm:mb-0">
									{/* <!-- Value Text --> */}
									<div className="absolute top-1/2 start-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
										<span className="text-xl font-bold text-purple-600">75</span>
										<span className="text-purple-600 block text-xs">Score</span>
									</div>
								</div>

								{/* <!-- Match Result --> */}
								<div className="text-center sm:text-right flex flex-row max-sm:flex-col items-center gap-5 max-sm:gap-0">
									<span className="bg-green-200 text-green-600 py-1 px-3 rounded-full text-sm font-semibold">Win</span>
									<div>
										<p className="mt-2 text-sm text-gray-600">21 - 18</p>
										<p className="text-sm text-gray-600 inline">15m 30s</p>
									</div>
								</div>
							</div>
						</div>
						{/* <!-- Match Entry 1--> */}
						<div className="bg-white shadow-md rounded-lg px-8 py-2 h-20 max-sm:h-full flex justify-between gap-2 flex-col sm:flex-row items-center mx-auto mt-8">
							{/* <!-- User Profile and Basic Info --> */}
							<div className="flex items-center mb-4 sm:mb-0 sm:mr-6">
								<img className="w-14 h-14 rounded-full mr-4" src="https://randomuser.me/api/portraits/men/1.jpg" alt="User Avatar"/>
								<div>
									<h3 className="text-lg font-semibold text-gray-800">John Doe</h3>
									<p className="text-sm text-gray-600">2023-09-07</p>
								</div>
							</div>

							{/* <!-- Match Details --> */}
							<div className="flex flex-col sm:flex-row items-center justify-between">
								{/* <!-- Gauge Component --> */}
								<div className="relative size-24 max-sm:size-12 mb-4 sm:mb-0">
									{/* <!-- Value Text --> */}
									<div className="absolute top-1/2 start-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
										<span className="text-xl font-bold text-purple-600">75</span>
										<span className="text-purple-600 block text-xs">Score</span>
									</div>
								</div>

								{/* <!-- Match Result --> */}
								<div className="text-center sm:text-right flex flex-row max-sm:flex-col items-center gap-5 max-sm:gap-0">
									<span className="bg-green-200 text-green-600 py-1 px-3 rounded-full text-sm font-semibold">Win</span>
									<div>
										<p className="mt-2 text-sm text-gray-600">21 - 18</p>
										<p className="text-sm text-gray-600 inline">15m 30s</p>
									</div>
								</div>
							</div>
						</div>
						{/* <!-- Match Entry 1--> */}
						<div className="bg-white shadow-md rounded-lg px-8 py-2 h-20 max-sm:h-full flex justify-between gap-2 flex-col sm:flex-row items-center mx-auto mt-8">
							{/* <!-- User Profile and Basic Info --> */}
							<div className="flex items-center mb-4 sm:mb-0 sm:mr-6">
								<img className="w-14 h-14 rounded-full mr-4" src="https://randomuser.me/api/portraits/men/1.jpg" alt="User Avatar"/>
								<div>
									<h3 className="text-lg font-semibold text-gray-800">John Doe</h3>
									<p className="text-sm text-gray-600">2023-09-07</p>
								</div>
							</div>

							{/* <!-- Match Details --> */}
							<div className="flex flex-col sm:flex-row items-center justify-between">
								{/* <!-- Gauge Component --> */}
								<div className="relative size-24 max-sm:size-12 mb-4 sm:mb-0">
									{/* <!-- Value Text --> */}
									<div className="absolute top-1/2 start-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
										<span className="text-xl font-bold text-purple-600">75</span>
										<span className="text-purple-600 block text-xs">Score</span>
									</div>
								</div>

								{/* <!-- Match Result --> */}
								<div className="text-center sm:text-right flex flex-row max-sm:flex-col items-center gap-5 max-sm:gap-0">
									<span className="bg-green-200 text-green-600 py-1 px-3 rounded-full text-sm font-semibold">Win</span>
									<div>
										<p className="mt-2 text-sm text-gray-600">21 - 18</p>
										<p className="text-sm text-gray-600 inline">15m 30s</p>
									</div>
								</div>
							</div>
						</div>
						
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
								stroke-width="1"
								stroke-dasharray="75 100"
							></circle>

							{/* <!-- Gauge Progress --> */}
							<circle
								cx="18"
								cy="18"
								r="16"
								fill="none"
								className="stroke-current text-red-500"
								stroke-width="3"
								stroke-dasharray="18.75 100"
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
								stroke-width="1"
								stroke-dasharray="75 100"
								stroke-linecap="round"
							></circle>
							{/*  */}
							{/* <!-- Gauge Progress --> */}
							<circle
								cx="18"
								cy="18"
								r="16"
								fill="none"
								className="stroke-current text-green-500"
								stroke-width="2"
								stroke-dasharray="56.25 100"
								stroke-linecap="round"
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
									stroke-width="1"
									stroke-dasharray="75 100"
									stroke-linecap="round"
								></circle>
								{/* <!-- Gauge Progress --> */}
								<circle
									cx="18"
									cy="18"
									r="16"
									fill="none"
									className="stroke-current text-yellow-500"
									stroke-width="2"
									stroke-dasharray="56.25 100"
									stroke-linecap="round"
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
	);
}
