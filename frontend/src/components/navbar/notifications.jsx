"use client";
import { useState } from 'react';
import { IoIosNotificationsOutline } from 'react-icons/io';
import Link from 'next/link';

const NotificationBell = () => {
	const [isOpen, setIsOpen] = useState(false);

	const toggleNotifications = () => {
		setIsOpen(!isOpen);
	};

	return (
		<div className="">
			{/* Notification Bell Icon */}
			<div className="notifications absolute right-40 top-4">
				<div className="relative">
					<IoIosNotificationsOutline
						className="text-[2.2rem] text-white hover:text-gray-400 transition duration-200 cursor-pointer"
						onClick={toggleNotifications}
					/>
					{/* Notification Badge */}
					<span className="absolute top-0 right-0 inline-flex items-center justify-center px-1 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
						1
					</span>
				</div>
			</div>

			{/* Notification Dropdown */}
			{isOpen && (
				<div
					onMouseLeave={() => setIsOpen(false)}
					id="toast-message-cta"
					className="main-div overflow-y-scroll max-h-52 absolute right-40 top-5 mt-10 p-4 rounded-lg shadow-lg bg-gray-800 text-gray-400  scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-700"
					role="alert"
				>
					<div className="flex p-4 w-96 border-b border-gray-700">
						<img
						className="w-8 h-8 rounded-full"
						src="https://randomuser.me/api/portraits/women/7.jpg"
						alt="Jese Leos"
						/>
						<div className="ml-3 text-sm font-normal">
							<span className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
								Jese Leos
							</span>
							<div className="mb-2 text-sm font-normal">
								Hi Neil, thanks for sharing your thoughts regarding Flowbite.
							</div>
							<Link
								href="#"
								className="inline-flex px-2.5 py-1.5 text-xs font-medium text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800"
							>
								Reply
							</Link>
						</div>
					</div>
					<div className="flex p-4 w-96 border-b border-gray-700">
						<img
						className="w-8 h-8 rounded-full"
						src="https://randomuser.me/api/portraits/women/7.jpg"
						alt="Jese Leos"
						/>
						<div className="ml-3 text-sm font-normal">
							<span className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
								Jese Leos
							</span>
							<div className="mb-2 text-sm font-normal">
								Hi Neil, thanks for sharing your thoughts regarding Flowbite.
							</div>
							<Link
								href="#"
								className="inline-flex px-2.5 py-1.5 text-xs font-medium text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800"
							>
								Reply
							</Link>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default NotificationBell;
