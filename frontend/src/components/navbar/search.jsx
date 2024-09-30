"use client";

import { getData } from '@/services/apiCalls';
import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import { useEffect } from 'react';

const SearchProfileComponent = () => {
	const [searchTerm, setSearchTerm] = useState('');
	const [loading, setLoading] = useState(false);

	const handleSearch = async (e) => {
		e.preventDefault();
		setLoading(true);
		
		try {
			if (searchTerm.trim() === '') {
				throw new Error('Search term cannot be empty');
			}
			const response = await getData(`/friendProfile/${searchTerm}`);
			//delay for 1 second
			await new Promise((resolve) => setTimeout(resolve, 500));// 1 second delay, to simulate a real-world API call
			if (response.status === 200) {
				const data = await response.data;
				// Custom Tailwind CSS toast with animations
				toast.custom((t) => (
				
					<div
						className={`${
						t.visible ? 'animate-enter' : 'animate-leave'
						} w-full max-w-64  bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
					>
						<Link href={`/${data.username}`} className="text-xs text-blue-500">
							<div className="flex items-center justify-center space-x-5 p-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition">
								{/* Profile Picture */}
								<div className="relative">
									<div>
										<img
											src={data.avatar}
											alt="Profile"
											className="w-14 h-14 rounded-full object-cover"
										/>
										{/* Online/Offline Status Indicator */}

										{/* {onlineStatus}
										{
											(onlineStatus === "online") ?
												(<span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white bg-green-500"></span>)
											:
												(<span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white bg-red-500"></span>)
										} */}
									</div>
								</div>

								{/* Status: In Game / In Tournament */}
								<div>
									{/* Username */}
									<div className="mb-3 text-center">
										<span className="font-medium text-gray-800 text-[.9rem]">{data.username}</span>
									</div>
									<span className="ml-auto text-xs bg-blue-100 text-blue-800 py-1 px-2 rounded-full">
										In Tournament
									</span>
								</div>
							</div>
						</Link>
						<div className="flex border-l border-gray-200">
							<button
								onClick={() => toast.dismiss(t.id)}
								className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium outline-none text-gray-700 bg-gray-100 hover:bg-gray-200"
							>
								Close
							</button>
						</div>
					</div>
				), {
						id: 'custom-id',
						duration: 5000, // The toast will disappear after 5 seconds
						position: 'top-right'
				});

			} else {
				throw new Error('Profile not found');
			}
		} catch (err) {
			// Error toast
			toast.error(err.message, {
				duration: 5000,
				position: 'top-right',
			});
		} finally {
			setLoading(false);
		}
	};


	return (
		<div>
			<Toaster /> {/* This renders the toast notifications */}
			<form className="relative" onSubmit={handleSearch}>
			<div className="relative max-w-96 w-96">
				<div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
					<svg
					className="w-4 h-4 text-gray-500 dark:text-gray-400"
					aria-hidden="true"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 20 20"
					>
					<path
						stroke="currentColor"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
					/>
					</svg>
				</div>
				<input
					type="search"
					id="default-search"
					className="block w-full max-w-96 p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 outline-none"
					placeholder="Search Profiles"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
				/>
				<button
					type="submit"
					className="text-white absolute start-[18.5rem] bottom-2.5 bg-gray-700 hover:bg-gray-800 outline-none font-medium rounded-lg text-sm px-4 py-2"
				>
					Search
				</button>
			</div>

			<div className="absolute">
				{/* Loading and Error States */}
				{loading &&  <div className="flex items-center space-x-1 text-sm">
									<span>search</span>
									<span className="inline-flex space-x-1">
									<span className="w-1 h-1 bg-current rounded-full animate-loading-dot"></span>
									<span className="w-1 h-1 bg-current rounded-full animate-loading-dot" style={{ animationDelay: '0.2s' }}></span>
									<span className="w-1 h-1 bg-current rounded-full animate-loading-dot" style={{ animationDelay: '0.4s' }}></span>
									</span>
								</div>}
			</div>
			</form>
		</div>
	);
};

export default SearchProfileComponent;

