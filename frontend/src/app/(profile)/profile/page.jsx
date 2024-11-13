'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/loginContext.jsx';
import { MdOutlineAlternateEmail } from 'react-icons/md';
import { MdDataSaverOff } from 'react-icons/md';
import { IoMdPhonePortrait } from 'react-icons/io';
import { TfiStatsUp } from 'react-icons/tfi';
import { GrHistory } from 'react-icons/gr';

import { CiUser } from 'react-icons/ci';
import { FaUser } from 'react-icons/fa6';
import { FaUserCheck } from 'react-icons/fa6';
import { MdEmail } from 'react-icons/md';
//phone number
import { MdPhone } from 'react-icons/md';
import { GiBattleAxe } from 'react-icons/gi';
import { FaClock } from 'react-icons/fa';
import { FaHistory } from 'react-icons/fa';
import { MdUpdate } from "react-icons/md";


import Image from 'next/image';

const Profile = () => {
  const { profileData: data } = useAuth();

  return (
    // <div className="profile container max-md:p-3 overflow-hidden">
    // 	{/* user avatar and infos */}
    // 	<div className="profile-top-infos flex justify-center items-center gap-[20rem] max-2xl:gap-10 max-sm:gap-6 mt-[6rem] max-md:mt-0 flex-wrap w-full">
    // 	<div className="profile-pic-name flex justify-center flex-col gap-4 items-start">
    // 		{/* avatar */}
    // 		<div className="flex items-start gap-4 max-md:items-center max-md:flex-col max-md:justify-center max-md:gap-1">
    // 			{/* the avatar */}
    // 			<div className="w-52 h-52 max-md:w-40 max-md:h-40 border-2 border-white rounded-full overflow-hidden">
    // 			<img className="w-full h-full object-cover" src={data.avatar} alt="profile picture" />
    // 			</div>

    // 			{/* username & nickname */}
    // 			<div className="mt-24 max-md:mt-3">
    // 			<h3>{data?.username}</h3>
    // 			</div>
    // 		</div>

    // 		<div className="profile-update-button">
    // 			<button className="edit-btn rounded-md bg-white text-black px-6 py-3 text-[1rem]">
    // 			<Link href="/edit_profile">Update Profile</Link>
    // 			</button>
    // 		</div>
    // 	</div>

    // 	{/* display user infos */}
    // 	<div className="user-infos">
    // 		<div className="info-section rounded-md text-lg font-roboto max-sm:text-unset flex items-start justify-center flex-col px-8 h-72">
    // 			<div className="flex justify-center items-center gap-7 py-3">
    // 			<MdOutlineAlternateEmail className="bg-white text-black w-8 h-8 p-1 rounded-full" />
    // 			<span>email: {data?.email}</span>
    // 			</div>
    // 			<div className="flex justify-center items-center gap-7 py-3">
    // 			<MdDataSaverOff className="bg-white text-black w-8 h-8 p-1 rounded-full" />
    // 			<span>first_name: {data?.first_name}</span>
    // 			</div>
    // 			<div className="flex justify-center items-center gap-7 py-3">
    // 			<MdDataSaverOff className="bg-white text-black w-8 h-8 p-1 rounded-full" />
    // 			<span>last_name: {data?.last_name}</span>
    // 			</div>
    // 			<div className="flex justify-center items-center gap-7 py-3">
    // 			<IoMdPhonePortrait className="bg-white text-black w-8 h-8 p-1 rounded-full" />
    // 			<span>phone number: 06666666666</span>
    // 			</div>
    // 		</div>
    // 	</div>
    // 	</div>
    // 	{/* user level */}
    // 	<div className="profile-level h-full mt-4 mx-auto w-[83%] max-xl:w-[95%]">
    // 	<div className="bg-gray-200 rounded-md h-10 text-center overflow-hidden border border-white">
    // 		<div
    // 			className="bg-darkgreen text-white text-center p-0.5 h-full"
    // 			style={{ width: '45%' }}
    // 		>
    // 			<div className="leading-9">Level 45%</div>
    // 		</div>
    // 	</div>
    // 	</div>

    // 	{/* for stats charts and history */}
    // 	<div className="user-stats-history flex justify-between items-start flex-wrap pt-9 mt-10">

    // 		{/* user history: games 1v1 */}
    // 		<div className="user-history mx-auto p-4">
    // 			<div className="flex justify-between items-center mb-1">
    // 				<div className="text-xl font-medium text-brand-500">
    // 					<GrHistory className="inline-block mx-2"/>
    // 					Match History
    // 				</div>
    // 			</div>

    // 			<div className='max-h-96 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-[#ffffff70] scrollbar-track-transparent scroll-smooth'>
    // 				{/* <!-- Match Entry 1--> */}
    // 				<div className="bg-white shadow-md rounded-lg px-8 py-2 h-20 max-sm:h-full flex justify-between gap-2 flex-col sm:flex-row items-center mx-auto mt-8">
    // 					{/* <!-- User Profile and Basic Info --> */}
    // 					<div className="flex items-center mb-4 sm:mb-0 sm:mr-6">
    // 						<img className="w-14 h-14 rounded-full mr-4" src="https://randomuser.me/api/portraits/men/1.jpg" alt="User Avatar"/>
    // 						<div>
    // 							<h3 className="text-lg font-semibold text-gray-800">John Doe</h3>
    // 							<p className="text-sm text-gray-600">2023-09-07</p>
    // 						</div>
    // 					</div>

    // 					{/* <!-- Match Details --> */}
    // 					<div className="flex flex-col sm:flex-row items-center justify-between">
    // 						{/* <!-- Gauge Component --> */}
    // 						<div className="relative size-24 max-sm:size-12 mb-4 sm:mb-0">
    // 							{/* <!-- Value Text --> */}
    // 							<div className="absolute top-1/2 start-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
    // 								<span className="text-xl font-bold text-purple-600">75</span>
    // 								<span className="text-purple-600 block text-xs">Score</span>
    // 							</div>
    // 						</div>

    // 						{/* <!-- Match Result --> */}
    // 						<div className="text-center sm:text-right flex flex-row max-sm:flex-col items-center gap-5 max-sm:gap-0">
    // 							<span className="bg-green-200 text-green-600 py-1 px-3 rounded-full text-sm font-semibold">Win</span>
    // 							<div>
    // 								<p className="mt-2 text-sm text-gray-600">21 - 18</p>
    // 								<p className="text-sm text-gray-600 inline">15m 30s</p>
    // 							</div>
    // 						</div>
    // 					</div>
    // 				</div>
    // 				{/* <!-- Match Entry 1--> */}
    // 				<div className="bg-white shadow-md rounded-lg px-8 py-2 h-20 max-sm:h-full flex justify-between gap-2 flex-col sm:flex-row items-center mx-auto mt-8">
    // 					{/* <!-- User Profile and Basic Info --> */}
    // 					<div className="flex items-center mb-4 sm:mb-0 sm:mr-6">
    // 						<img className="w-14 h-14 rounded-full mr-4" src="https://randomuser.me/api/portraits/men/1.jpg" alt="User Avatar"/>
    // 						<div>
    // 							<h3 className="text-lg font-semibold text-gray-800">John Doe</h3>
    // 							<p className="text-sm text-gray-600">2023-09-07</p>
    // 						</div>
    // 					</div>

    // 					{/* <!-- Match Details --> */}
    // 					<div className="flex flex-col sm:flex-row items-center justify-between">
    // 						{/* <!-- Gauge Component --> */}
    // 						<div className="relative size-24 max-sm:size-12 mb-4 sm:mb-0">
    // 							{/* <!-- Value Text --> */}
    // 							<div className="absolute top-1/2 start-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
    // 								<span className="text-xl font-bold text-purple-600">75</span>
    // 								<span className="text-purple-600 block text-xs">Score</span>
    // 							</div>
    // 						</div>

    // 						{/* <!-- Match Result --> */}
    // 						<div className="text-center sm:text-right flex flex-row max-sm:flex-col items-center gap-5 max-sm:gap-0">
    // 							<span className="bg-green-200 text-green-600 py-1 px-3 rounded-full text-sm font-semibold">Win</span>
    // 							<div>
    // 								<p className="mt-2 text-sm text-gray-600">21 - 18</p>
    // 								<p className="text-sm text-gray-600 inline">15m 30s</p>
    // 							</div>
    // 						</div>
    // 					</div>
    // 				</div>
    // 				{/* <!-- Match Entry 1--> */}
    // 				<div className="bg-white shadow-md rounded-lg px-8 py-2 h-20 max-sm:h-full flex justify-between gap-2 flex-col sm:flex-row items-center mx-auto mt-8">
    // 					{/* <!-- User Profile and Basic Info --> */}
    // 					<div className="flex items-center mb-4 sm:mb-0 sm:mr-6">
    // 						<img className="w-14 h-14 rounded-full mr-4" src="https://randomuser.me/api/portraits/men/1.jpg" alt="User Avatar"/>
    // 						<div>
    // 							<h3 className="text-lg font-semibold text-gray-800">John Doe</h3>
    // 							<p className="text-sm text-gray-600">2023-09-07</p>
    // 						</div>
    // 					</div>

    // 					{/* <!-- Match Details --> */}
    // 					<div className="flex flex-col sm:flex-row items-center justify-between">
    // 						{/* <!-- Gauge Component --> */}
    // 						<div className="relative size-24 max-sm:size-12 mb-4 sm:mb-0">
    // 							{/* <!-- Value Text --> */}
    // 							<div className="absolute top-1/2 start-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
    // 								<span className="text-xl font-bold text-purple-600">75</span>
    // 								<span className="text-purple-600 block text-xs">Score</span>
    // 							</div>
    // 						</div>

    // 						{/* <!-- Match Result --> */}
    // 						<div className="text-center sm:text-right flex flex-row max-sm:flex-col items-center gap-5 max-sm:gap-0">
    // 							<span className="bg-green-200 text-green-600 py-1 px-3 rounded-full text-sm font-semibold">Win</span>
    // 							<div>
    // 								<p className="mt-2 text-sm text-gray-600">21 - 18</p>
    // 								<p className="text-sm text-gray-600 inline">15m 30s</p>
    // 							</div>
    // 						</div>
    // 					</div>
    // 				</div>
    // 				{/* <!-- Match Entry 1--> */}
    // 				<div className="bg-white shadow-md rounded-lg px-8 py-2 h-20 max-sm:h-full flex justify-between gap-2 flex-col sm:flex-row items-center mx-auto mt-8">
    // 					{/* <!-- User Profile and Basic Info --> */}
    // 					<div className="flex items-center mb-4 sm:mb-0 sm:mr-6">
    // 						<img className="w-14 h-14 rounded-full mr-4" src="https://randomuser.me/api/portraits/men/1.jpg" alt="User Avatar"/>
    // 						<div>
    // 							<h3 className="text-lg font-semibold text-gray-800">John Doe</h3>
    // 							<p className="text-sm text-gray-600">2023-09-07</p>
    // 						</div>
    // 					</div>

    // 					{/* <!-- Match Details --> */}
    // 					<div className="flex flex-col sm:flex-row items-center justify-between">
    // 						{/* <!-- Gauge Component --> */}
    // 						<div className="relative size-24 max-sm:size-12 mb-4 sm:mb-0">
    // 							{/* <!-- Value Text --> */}
    // 							<div className="absolute top-1/2 start-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
    // 								<span className="text-xl font-bold text-purple-600">75</span>
    // 								<span className="text-purple-600 block text-xs">Score</span>
    // 							</div>
    // 						</div>

    // 						{/* <!-- Match Result --> */}
    // 						<div className="text-center sm:text-right flex flex-row max-sm:flex-col items-center gap-5 max-sm:gap-0">
    // 							<span className="bg-green-200 text-green-600 py-1 px-3 rounded-full text-sm font-semibold">Win</span>
    // 							<div>
    // 								<p className="mt-2 text-sm text-gray-600">21 - 18</p>
    // 								<p className="text-sm text-gray-600 inline">15m 30s</p>
    // 							</div>
    // 						</div>
    // 					</div>
    // 				</div>
    // 				{/* <!-- Match Entry 1--> */}
    // 				<div className="bg-white shadow-md rounded-lg px-8 py-2 h-20 max-sm:h-full flex justify-between gap-2 flex-col sm:flex-row items-center mx-auto mt-8">
    // 					{/* <!-- User Profile and Basic Info --> */}
    // 					<div className="flex items-center mb-4 sm:mb-0 sm:mr-6">
    // 						<img className="w-14 h-14 rounded-full mr-4" src="https://randomuser.me/api/portraits/men/1.jpg" alt="User Avatar"/>
    // 						<div>
    // 							<h3 className="text-lg font-semibold text-gray-800">John Doe</h3>
    // 							<p className="text-sm text-gray-600">2023-09-07</p>
    // 						</div>
    // 					</div>

    // 					{/* <!-- Match Details --> */}
    // 					<div className="flex flex-col sm:flex-row items-center justify-between">
    // 						{/* <!-- Gauge Component --> */}
    // 						<div className="relative size-24 max-sm:size-12 mb-4 sm:mb-0">
    // 							{/* <!-- Value Text --> */}
    // 							<div className="absolute top-1/2 start-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
    // 								<span className="text-xl font-bold text-purple-600">75</span>
    // 								<span className="text-purple-600 block text-xs">Score</span>
    // 							</div>
    // 						</div>

    // 						{/* <!-- Match Result --> */}
    // 						<div className="text-center sm:text-right flex flex-row max-sm:flex-col items-center gap-5 max-sm:gap-0">
    // 							<span className="bg-green-200 text-green-600 py-1 px-3 rounded-full text-sm font-semibold">Win</span>
    // 							<div>
    // 								<p className="mt-2 text-sm text-gray-600">21 - 18</p>
    // 								<p className="text-sm text-gray-600 inline">15m 30s</p>
    // 							</div>
    // 						</div>
    // 					</div>
    // 				</div>

    // 			</div>

    // 		</div>

    // 		{/* user statistics */}
    // 		<div className='user-stats mx-auto p-4 max-md:mt-10'>
    // 			<div className="stats-icon text-xl font-medium lg:text-center max-lg:mt-10"><TfiStatsUp className="inline-block mx-2"/>Your Stats</div>

    // 			<div className="user-stats-details flex justify-center items-center flex-wrap gap-5 p-5 mt-14 rounded-lg px-8">

    // 				{/* <!-- Gauge Component --> */}
    // 				<div className="relative size-60">
    // 					<svg
    // 					className="rotate-[135deg] size-full"
    // 					viewBox="0 0 36 36"
    // 					xmlns="http://www.w3.org/2000/svg"
    // 					>
    // 					{/* <!-- Background Circle (Gauge) --> */}
    // 					<circle
    // 						cx="18"
    // 						cy="18"
    // 						r="16"
    // 						fill="none"
    // 						className="stroke-current text-white"
    // 						strokeWidth="1"
    // 						strokeDasharray="75 100"
    // 					></circle>

    // 					{/* <!-- Gauge Progress --> */}
    // 					<circle
    // 						cx="18"
    // 						cy="18"
    // 						r="16"
    // 						fill="none"
    // 						className="stroke-current text-red-500"
    // 						strokeWidth="3"
    // 						strokeDasharray="18.75 100"
    // 					></circle>
    // 					</svg>

    // 					{/* <!-- Value Text --> */}
    // 					<div className="absolute top-1/2 start-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
    // 						<span className="text-4xl font-bold text-red-500">25</span>
    // 						<span className="text-red-500 block">loses</span>
    // 					</div>
    // 				</div>
    // 				{/* <!-- End Gauge Component --> */}

    // 				{/* <!-- Gauge Component --> */}
    // 				<div className="relative size-60">
    // 					<svg
    // 					className="rotate-[135deg] size-full"
    // 					viewBox="0 0 36 36"
    // 					xmlns="http://www.w3.org/2000/svg"
    // 					>
    // 					{/* <!-- Background Circle (Gauge) --> */}
    // 					<circle
    // 						cx="18"
    // 						cy="18"
    // 						r="16"
    // 						fill="none"
    // 						className="stroke-current text-white"
    // 						strokeWidth="1"
    // 						strokeDasharray="75 100"
    // 						strokeLinecap="round"
    // 					></circle>
    // 					{/*  */}
    // 					{/* <!-- Gauge Progress --> */}
    // 					<circle
    // 						cx="18"
    // 						cy="18"
    // 						r="16"
    // 						fill="none"
    // 						className="stroke-current text-green-500"
    // 						strokeWidth="2"
    // 						strokeDasharray="56.25 100"
    // 						strokeLinecap="round"
    // 					></circle>
    // 					</svg>

    // 					{/* <!-- Value Text --> */}
    // 					<div className="absolute top-1/2 start-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
    // 						<span className="text-3xl font-bold text-green-600">75</span>
    // 						<span className="text-green-600 block">Wins</span>
    // 					</div>
    // 				</div>
    // 				{/* <!-- End Gauge Component --> */}

    // 				{/* <!-- Gauge Component --> */}
    // 				<div className="relative size-60">
    // 					<svg
    // 					className="rotate-[135deg] size-full"
    // 					viewBox="0 0 36 36"
    // 					xmlns="http://www.w3.org/2000/svg"
    // 					>
    // 						{/* <!-- Background Circle (Gauge) --> */}
    // 						<circle
    // 							cx="18"
    // 							cy="18"
    // 							r="16"
    // 							fill="none"
    // 							className="stroke-current text-white"
    // 							strokeWidth="1"
    // 							strokeDasharray="75 100"
    // 							strokeLinecap="round"
    // 						></circle>
    // 						{/* <!-- Gauge Progress --> */}
    // 						<circle
    // 							cx="18"
    // 							cy="18"
    // 							r="16"
    // 							fill="none"
    // 							className="stroke-current text-yellow-500"
    // 							strokeWidth="2"
    // 							strokeDasharray="56.25 100"
    // 							strokeLinecap="round"
    // 						></circle>
    // 					</svg>

    // 					{/* <!-- Value Text --> */}
    // 					<div className="absolute top-9 start-1/2 transform -translate-x-1/2 text-center">
    // 						<span className="text-4xl font-bold text-yellow-500">50</span>
    // 						<span className="text-yellow-500 block">Average</span>
    // 					</div>
    // 				</div>
    // 				{/* <!-- End Gauge Component --> */}
    // 			</div>

    // 		</div>
    // 	</div>
    // </div>
	<>
	<div className="w-full h-[80%]">
		<div className="profile-bg w-full h-60 ">
			<Image
			src="/gaming-demo.jpeg"
			alt="profile background"
			width={1000}
			height={1000}
			className="w-full object-cover object-center h-full"
			/>
		</div>
		<div className="profile-grid w-full">
			{/* avatar and infos */}
			<div className="profile-avatar mt-24">
			{/* avatar and username*/}
			<div className="avatar-and-username">
				{/* avatar and username */}
				<div className="avatar-and-username flex justify-center items-center flex-wrap gap-6">
					<div className="avatar">
					<img
						src={data.avatar}
						alt="profile avatar"
						width={100}
						height={100}
						className="w-48 h-4w-48 rounded-full object-cover object-center border-[5px] border-sky-600"
					/>
					</div>
					<div className="username">
					<div className="flex justify-center items-center gap-2">
						<h3 className="font-light">{data.first_name}</h3>
						<h3 className="font-light">{data.last_name}</h3>
					</div>
					<h4 className="text-center">@{data.username}</h4>
					</div>
				</div>
				{/* level */}
				<div className="profile-level">
					<div className="flex flex-col items-center space-y-2">
					<div className="text-lg font-semibold text-gray-100">
						<span>Level</span>
					</div>
					<div className="w-full bg-gray-200 rounded-full h-10 overflow-hidden border border-gray-300">
						<div
							className="bg-sky-500 text-white text-center h-full flex items-center justify-center"
							style={{ width: '45%' }}
						>
							<span className="text-sm font-medium">45%</span>
						</div>
					</div>
					</div>
				</div>
			</div>
			{/* level */}
			</div>
			{/* only infos and edit */}
			<div className="profile-infos pt-10 flex justify-center items-center flex-col gap-10">
			<div className="profile-detail-1 flex justify-start items-center gap-16 py-2 px-20 pl-52 border border-gray-500 w-[70%] rounded-full">
				<div className="icon flex-shrink-0">
					<FaUser className="w-6 h-6" />
				</div>
				<button className="text-xl font-semibold text-gray-50">
					{data.first_name} {data.last_name}
				</button>
			</div>

			<div className="profile-detail-1 flex justify-start items-center gap-16 py-2 px-20 pl-52 border border-gray-500 w-[70%] rounded-full">
				<div className="icon flex-shrink-0">
					<FaUserCheck className="w-6 h-6" />
				</div>
				<button className="text-xl font-semibold text-gray-50">{data.username}</button>
			</div>

			<div className="profile-detail-1 flex justify-start items-center gap-16 py-2 px-20 pl-52 border border-gray-500 w-[70%] rounded-full">
				<div className="icon flex-shrink-0">
					<MdEmail className="w-6 h-6" />
				</div>
				<button className="text-xl font-semibold text-gray-50">{data.email}</button>
			</div>

			<div className="profile-detail-1 flex justify-start items-center gap-16 py-2 px-20 pl-52 border border-gray-500 w-[70%] rounded-full">
				<div className="icon flex-shrink-0">
					<MdPhone className="w-6 h-6" />
				</div>
				<button className="text-xl font-semibold text-gray-50">
					{data.phone || 'no available phone number'}
				</button>
			</div>

			<div className="edit-profile self-end pr-36">
				<Link href="/edit_profile">
					<button className="edit-btn rounded-full bg-white text-black px-6 py-3 text-[1rem]">
					Update Profile
					</button>
				</Link>
			</div>
			</div>
			{/* match histroy */}
			<div className="user-history mx-auto p-4">
			<div className="flex justify-between items-center mb-1">
				<div className="flex items-center bg-gray-800 hover:bg-gray-600 transition-all text-white py-3 px-4 rounded-lg shadow-md">
					<FaHistory className="mr-3" />
					Match History
				</div>
			</div>

			<div className="max-h-96 w-full overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-[#ffffff70] scrollbar-track-transparent scroll-smooth">
				{/* HISTORY 1 */}
				<div className="bg-white shadow-lg rounded-lg p-6 mx-auto mt-2 w-full">
					<div className="flex items-center justify-between flex-wrap max-sm:flex-col max-sm:gap-y-9 gap-x-6 w-[30rem]">
					{/* Player 1 */}
					<div className="flex flex-col items-start max-sm:justify-center max-sm:items-center">
						<div className="flex items-center">
							<img
							className="w-16 h-16 rounded-full mr-4 border-2 border-green-500"
							src="https://randomuser.me/api/portraits/men/1.jpg"
							alt="Player 1 Avatar"
							/>
							<div>
							<h3 className="text-lg text-gray-800">John Doe</h3>
							<p className="text-3xl font-bold text-green-600 max-sm:text-lg">21</p>
							</div>
						</div>
					</div>

					{/* Versus */}
					<div>
						<GiBattleAxe 
							className='text-3xl text-gray-600'
						/>
					</div>

					{/* Player 2 */}
					<div className="flex flex-col items-end max-sm:justify-center max-sm:items-center">
						<div className="flex items-center">
							<div className="text-right mr-4">
							<h4 className="text-lg text-gray-800">Jane Smith</h4>
							<p className="text-3xl max-sm:text-lg font-bold text-red-600">18</p>
							</div>
							<img
							className="w-16 h-16 rounded-full border-2 border-red-500"
							src="https://randomuser.me/api/portraits/women/3.jpg"
							alt="Player 2 Avatar"
							/>
						</div>
					</div>
					</div>

					{/* Match Duration */}
					<div className="flex justify-center items-center mt-2 text-sm text-gray-600">
					<MdUpdate className="mr-1 w-6 h-6" />
					<span>
						2023-09-07: 3:00 PM
					</span>
					</div>
				</div>
				{/* END HISTORY 1*/}
			</div>
			</div>
			{/* user stats */}
			<div className="user-stats h-fit">user stats</div>
		</div>
	</div>
	</>
);
};

export default Profile;
