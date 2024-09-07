'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/loginContext.jsx';
import useWebSocket from '@components/websocket/websocket';
import { MdOutlineAlternateEmail } from 'react-icons/md';
import { MdDataSaverOff } from 'react-icons/md';
import { IoMdPhonePortrait } from 'react-icons/io';
import { TfiStatsUp } from "react-icons/tfi";
import { GrHistory } from "react-icons/gr";


const Profile = () => {
  const { isConnected, messages } = useWebSocket('ws://localhost:8000/ws/online/');

  useEffect(() => {
    if (isConnected) {
      console.log('Connected to WebSocket!');
    }
  }, [isConnected]);

  useEffect(() => {
    if (messages.length > 0) {
      console.log('Received messages:', messages);
    }
  }, [messages]);

  const { profileData: data, fetch_profile } = useAuth();
  useEffect(() => {
    fetch_profile();
  }, []);

return (
	<div className="profile container max-md:p-3 overflow-hidden">
      {/* user avatar and infos */}
      <div className="profile-top-infos flex justify-center items-center gap-[20rem] max-2xl:gap-10 max-sm:gap-6 mt-[6rem] max-md:mt-0 flex-wrap w-full">
        <div className="profile-pic-name flex items-start justify-center flex-col gap-4 max-md:items-center">
          {/* avatar */}
          <div className="flex items-start gap-4 max-md:items-center max-md:flex-col max-md:justify-center max-md:gap-1">
            {/* the avatar */}
            <div className="w-52 h-52 max-md:w-40 max-md:h-40 border-2 border-white rounded-full overflow-hidden">
              <img className="w-full h-full object-cover" src={data.avatar} alt="profile picture" />
            </div>

            {/* username & nickname */}
            <div className="mt-24 max-md:mt-3">
              <h3>{data?.username}</h3>
            </div>
          </div>

          <div className="profile-update-button">
            <button className="edit-btn rounded-md bg-white text-black px-6 py-3 text-[1rem]">
              <Link href="/edit_profile">Update Profile</Link>
            </button>
          </div>
        </div>

        {/* display user infos */}
        <div className="user-infos">
          <div className="info-section rounded-md text-lg font-roboto max-sm:text-unset flex items-start justify-center flex-col px-8 h-72">
            <div className="flex justify-center items-center gap-7 py-3">
              <MdOutlineAlternateEmail className="bg-white text-black w-8 h-8 p-1 rounded-full" />
              <span>email: {data?.email}</span>
            </div>
            <div className="flex justify-center items-center gap-7 py-3">
              <MdDataSaverOff className="bg-white text-black w-8 h-8 p-1 rounded-full" />
              <span>first_name: {data?.first_name}</span>
            </div>
            <div className="flex justify-center items-center gap-7 py-3">
              <MdDataSaverOff className="bg-white text-black w-8 h-8 p-1 rounded-full" />
              <span>last_name: {data?.last_name}</span>
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
			<div className='user-stats mx-auto p-4'>
				<div className="stats-icon text-xl font-medium text-brand-500 text-center max-lg:mt-10"><TfiStatsUp className="inline-block mx-2"/>Your Stats</div>
				
				<div className="user-stats-details flex justify-center items-center flex-wrap gap-5 p-5 mt-14 bg-[#ffffff1f] rounded-lg px-8">

					{/* <!-- Gauge Component --> */}
					<div className="relative size-52">
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
					<div className="relative size-56">
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
					<div className="relative size-25">
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
								className="stroke-current text-blue-600"
								stroke-width="2"
								stroke-dasharray="56.25 100"
								stroke-linecap="round"
							></circle>
						</svg>

						{/* <!-- Value Text --> */}
						<div className="absolute top-9 start-1/2 transform -translate-x-1/2 text-center">
							<span className="text-4xl font-bold text-blue-600">50</span>
							<span className="text-blue-600 block">Average</span>
						</div>
					</div>
					{/* <!-- End Gauge Component --> */}
				</div>
				
			</div>
      </div>
	</div>
);
};

export default Profile;
