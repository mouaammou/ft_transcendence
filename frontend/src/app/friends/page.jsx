"use client"

import { MdNavigateNext } from "react-icons/md";

export default function Friends () {
	return (
		<div className="friends container flex justify-center mt-14 rounded-lg max-md:p-2 max-md:w-[90%] max-sm:mb-20 bg-topBackground py-32">

			{/* friends div options */}
			<div className="friends-div-options flex items-center justify-evenly flex-wrap max-xl:gap-12">
				{/* list of friends */}
				<div className="list-friends relative ">

					{/* Icon friends */}
					<div className="icon-friends primary-button w-40 flex items-center space-x-2 lg:mb-6">
						<span className="inline-block">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 inline-block">
								<path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
							</svg>
						</span> 
						<span className="inline-block">friends</span>
					</div>

					<div className="list-friends-profile">

						{/* DIV TWO users */}
						<div className="div-for-two-users flex justify-around items-center flex-wrap gap-10 max-md:gap-1">
							{/* USER Profile status online in game */}
							<div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition my-4">
								{/* Profile Picture */}
								<div className="relative">
									<img
										src="https://randomuser.me/api/portraits/men/1.jpg"
										alt="Profile"
										className="w-14 h-14 rounded-full object-cover"
									/>
									{/* Online/Offline Status Indicator */}
									<span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white bg-red-500"></span>
								</div>

								{/* User Information */}
								<div className="flex flex-col">
									<span className="font-medium text-gray-800">Username</span>
									<span className="text-xs text-gray-500">Offline</span>
								</div>

								{/* Status: In Game / In Tournament */}
								<span className="ml-auto text-xs bg-blue-100 text-blue-800 py-1 px-2 rounded-full">
									In Tournament
								</span>
							</div>
							{/* USER Profile status online in game */}
							<div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition my-4">
								{/* Profile Picture */}
								<div className="relative">
									<img
										src="https://randomuser.me/api/portraits/men/1.jpg"
										alt="Profile"
										className="w-14 h-14 rounded-full object-cover"
									/>
									{/* Online/Offline Status Indicator */}
									<span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white bg-red-500"></span>
								</div>

								{/* User Information */}
								<div className="flex flex-col">
									<span className="font-medium text-gray-800">Username</span>
									<span className="text-xs text-gray-500">Offline</span>
								</div>

								{/* Status: In Game / In Tournament */}
								<span className="ml-auto text-xs bg-blue-100 text-blue-800 py-1 px-2 rounded-full">
									In Tournament
								</span>
							</div>
						</div>

						{/* DIV TWO users */}
						<div className="div-for-two-users flex justify-around items-center flex-wrap gap-10 max-md:gap-1">
							{/* USER Profile status online in game */}
							<div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition my-4">
								{/* Profile Picture */}
								<div className="relative">
									<img
										src="https://randomuser.me/api/portraits/men/1.jpg"
										alt="Profile"
										className="w-14 h-14 rounded-full object-cover"
									/>
									{/* Online/Offline Status Indicator */}
									<span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white bg-red-500"></span>
								</div>

								{/* User Information */}
								<div className="flex flex-col">
									<span className="font-medium text-gray-800">Username</span>
									<span className="text-xs text-gray-500">Offline</span>
								</div>

								{/* Status: In Game / In Tournament */}
								<span className="ml-auto text-xs bg-blue-100 text-blue-800 py-1 px-2 rounded-full">
									In Tournament
								</span>
							</div>
							{/* USER Profile status online in game */}
							<div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition my-4">
								{/* Profile Picture */}
								<div className="relative">
									<img
										src="https://randomuser.me/api/portraits/men/1.jpg"
										alt="Profile"
										className="w-14 h-14 rounded-full object-cover"
									/>
									{/* Online/Offline Status Indicator */}
									<span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white bg-red-500"></span>
								</div>

								{/* User Information */}
								<div className="flex flex-col">
									<span className="font-medium text-gray-800">Username</span>
									<span className="text-xs text-gray-500">Offline</span>
								</div>

								{/* Status: In Game / In Tournament */}
								<span className="ml-auto text-xs bg-blue-100 text-blue-800 py-1 px-2 rounded-full">
									In Tournament
								</span>
							</div>
						</div>

						{/* DIV TWO users */}
						<div className="div-for-two-users flex justify-around items-center flex-wrap gap-10 max-md:gap-1">
							{/* USER Profile status online in tournament*/}
							<div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition my-4">
								{/* Profile Picture */}
								<div className="relative">
									<img
										src="https://randomuser.me/api/portraits/men/1.jpg"
										alt="Profile"
										className="w-14 h-14 rounded-full object-cover"
									/>
									{/* Online/Offline Status Indicator */}
									<span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white bg-green-500"></span>
								</div>

								{/* User Information */}
								<div className="flex flex-col">
									<span className="font-medium text-gray-800">Username</span>
									<span className="text-xs text-gray-500">In Game</span>
								</div>

								{/* Status: In Game / In Tournament */}
								<span className="ml-auto text-xs bg-blue-100 text-blue-800 py-1 px-2 rounded-full">
									In Tournament
								</span>
							</div>
							{/* USER Profile status online in game */}
							<div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition my-4">
								{/* Profile Picture */}
								<div className="relative">
									<img
										src="https://randomuser.me/api/portraits/men/1.jpg"
										alt="Profile"
										className="w-14 h-14 rounded-full object-cover"
									/>
									{/* Online/Offline Status Indicator */}
									<span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white bg-red-500"></span>
								</div>

								{/* User Information */}
								<div className="flex flex-col">
									<span className="font-medium text-gray-800">Username</span>
									<span className="text-xs text-gray-500">Offline</span>
								</div>

								{/* Status: In Game / In Tournament */}
								<span className="ml-auto text-xs bg-blue-100 text-blue-800 py-1 px-2 rounded-full">
									In Tournament
								</span>
							</div>
						</div>

						{/* DIV TWO users */}
						<div className="div-for-two-users flex justify-around items-center flex-wrap gap-10 max-md:gap-1">
							{/* USER Profile status online in tournament*/}
							<div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition my-4">
								{/* Profile Picture */}
								<div className="relative">
									<img
										src="https://randomuser.me/api/portraits/men/1.jpg"
										alt="Profile"
										className="w-14 h-14 rounded-full object-cover"
									/>
									{/* Online/Offline Status Indicator */}
									<span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white bg-green-500"></span>
								</div>

								{/* User Information */}
								<div className="flex flex-col">
									<span className="font-medium text-gray-800">Username</span>
									<span className="text-xs text-gray-500">In Game</span>
								</div>

								{/* Status: In Game / In Tournament */}
								<span className="ml-auto text-xs bg-blue-100 text-blue-800 py-1 px-2 rounded-full">
									In Tournament
								</span>
							</div>
							{/* USER Profile status online in game */}
							<div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition my-4">
								{/* Profile Picture */}
								<div className="relative">
									<img
										src="https://randomuser.me/api/portraits/men/1.jpg"
										alt="Profile"
										className="w-14 h-14 rounded-full object-cover"
									/>
									{/* Online/Offline Status Indicator */}
									<span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white bg-red-500"></span>
								</div>

								{/* User Information */}
								<div className="flex flex-col">
									<span className="font-medium text-gray-800">Username</span>
									<span className="text-xs text-gray-500">Offline</span>
								</div>

								{/* Status: In Game / In Tournament */}
								<span className="ml-auto text-xs bg-blue-100 text-blue-800 py-1 px-2 rounded-full">
									In Tournament
								</span>
							</div>
						</div>
						{/* DIV TWO users */}
						<div className="div-for-two-users flex justify-around items-center flex-wrap gap-4 max-md:gap-1">
							{/* USER Profile status online in tournament*/}
							<div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition my-4">
								{/* Profile Picture */}
								<div className="relative">
									<img
										src="https://randomuser.me/api/portraits/men/1.jpg"
										alt="Profile"
										className="w-14 h-14 rounded-full object-cover"
									/>
									{/* Online/Offline Status Indicator */}
									<span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white bg-green-500"></span>
								</div>

								{/* User Information */}
								<div className="flex flex-col">
									<span className="font-medium text-gray-800">Username</span>
									<span className="text-xs text-gray-500">In Game</span>
								</div>

								{/* Status: In Game / In Tournament */}
								<span className="ml-auto text-xs bg-blue-100 text-blue-800 py-1 px-2 rounded-full">
									In Tournament
								</span>
							</div>
							{/* USER Profile status online in game */}
							<div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition my-4">
								{/* Profile Picture */}
								<div className="relative">
									<img
										src="https://randomuser.me/api/portraits/men/1.jpg"
										alt="Profile"
										className="w-14 h-14 rounded-full object-cover"
									/>
									{/* Online/Offline Status Indicator */}
									<span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white bg-red-500"></span>
								</div>

								{/* User Information */}
								<div className="flex flex-col">
									<span className="font-medium text-gray-800">Username</span>
									<span className="text-xs text-gray-500">Offline</span>
								</div>

								{/* Status: In Game / In Tournament */}
								<span className="ml-auto text-xs bg-blue-100 text-blue-800 py-1 px-2 rounded-full">
									In Tournament
								</span>
							</div>
						</div>
					</div>
					<button className="float-end absolute right-0 bottom-[-3rem] my-6 w-20 max-sm:bottom-[-5rem] max-sm:text-[1.5rem]"> 
						<span>next</span>
						<MdNavigateNext className="max-sm:text-[1.5rem] inline"/>
					</button>
				</div>

				{/* card of the friend for more option */}
				<div className="cart-friend-option max-w-sm p-4 bg-white rounded-lg shadow-md max-sm:hidden">
					{/* User Info Section */}
					<div className="flex items-center justify-center space-x-3">
						{/* Avatar */}
						<div className="relative">
							<img
							src="https://randomuser.me/api/portraits/women/2.jpg"
							alt="User Avatar"
							className="w-20 h-20 rounded-full object-cover"
							/>
							{/* Online/Offline Status Indicator */}
							<span className="absolute bottom-0 right-[0.3rem] w-3.5 h-3.5 rounded-full border-2 border-white bg-green-500"></span>
						</div>
						{/* Username and Status */}
						<div>
							<span className="text-xl font-medium text-gray-800">Username</span>
						</div>
					</div>

					{/* Status Section */}
					<div className="mt-4 space-y-2">
						<div className="flex items-center justify-between">
							<span className="text-sm text-gray-600">In Game</span>
							<span className="text-xs bg-blue-100 text-blue-800 py-1 px-2 rounded-full">Playing</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm text-gray-600">In Chat</span>
							<span className="text-xs bg-green-100 text-green-800 py-1 px-2 rounded-full">Active</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm text-gray-600">In Tournament</span>
							<span className="text-xs bg-yellow-100 text-yellow-800 py-1 px-2 rounded-full">Competing</span>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="mt-6 space-y-2">
						<button className="w-full py-2 px-4 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition">
							View Profile
						</button>
						<button className="w-full py-2 px-4 bg-indigo-500 text-white text-sm rounded-lg hover:bg-indigo-600 transition">
							Invite to Game
						</button>
						<button className="w-full py-2 px-4 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition">
							Add to Friend List
						</button>
						<button className="w-full py-2 px-4 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition">
							Block
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}