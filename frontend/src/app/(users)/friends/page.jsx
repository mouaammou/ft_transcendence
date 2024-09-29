"use client";
import { useEffect, useState } from "react";
import { getData } from "@/services/apiCalls";
import { useWebSocketContext } from "@/components/websocket/websocketContext";
import { MdNavigateNext } from "react-icons/md";
import { MdNavigateBefore } from "react-icons/md";
import Link  from "next/link";
import {useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import NotFound_404 from "@/components/error_pages/404";

const Friends = () => {
	const {users, setUsers}  = useWebSocketContext();
	const [nextPage, setNextPage] = useState(null);
	const [prevPage, setPrevPage] = useState(null);
	const router = useRouter();
	const query_params = useSearchParams();
	const [pageNotFound, setPageNotFound] = useState(false);
	const [pageNumber, setPageNumber] = useState(1);
	
	const fetchAllUsers = async (pageNumber) => {

		router.push(`/friends?page=${pageNumber}`);

		try {
			const response = await getData(`/friends?page=${pageNumber}`);
			if (response.status === 200) {
				setUsers(response.data.results.map(user => ({ ...user, status: "offline" })));
				setPrevPage(() => {
					if (response.data.previous) 
						return response.data.previous.split("page=")[1] || 1; // If there's no page number, return null
						// Extract the page number from the previous URL
					return null; // No previous page
				});

				// Update nextPage
				setNextPage(() => {
					if (response.data.next)
						return response.data.next.split("page=")[1] || null; // If there's no page number, return null
					return null; // No next page
				});
			}
			else {
				setPageNotFound(true);
			}
		} catch (error) {
			console.error("Error fetching users in friends page:", error);
			setPageNotFound(true)
		}
	};

	// Fetch users on the initial render
	useEffect(() => {
		const page = query_params.get('page') || 1;
		fetchAllUsers(page);
		setPageNumber(page);
	
		return () => {
			setPageNotFound(false);
		}
	}, [pageNumber]);

	return (
	(pageNotFound) ? 
		<NotFound_404 gobackPage="/friends" />
	:
		
	<div className="friends container flex justify-center mt-14 rounded-lg max-md:p-2 max-md:w-[90%] max-sm:mb-20 bg-topBackground py-32">

		{/* friends div options */}
		<div className="friends-div-options flex items-center justify-center flex-wrap max-xl:gap-12">
			{/* list of friends */}
			<div className="list-friends relative ">
				{/* Icon friends */}
				<div className="icon-friends primary-button border-none w-40 flex items-center space-x-2 lg:mb-6">
					<span className="inline-block">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 inline-block">
							<path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
						</svg>
					</span> 
					<span className="inline-block">Friends</span>
				</div>

				<div className="list-friends-profile">

					{/* DIV TWO users */}
					<div className="div-for-two-users flex justify-center items-center flex-wrap gap-4 max-sm:gap-1 p-2 md:p-10 mx-auto">
						{users && users.map((user, index) => (
							/* USER Profile status online in game */
							<Link href={`/${user.username}`} className="text-xs text-blue-500" key={index}>
								<div className="flex items-center justify-center space-x-5 p-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition" key={user.id}>
									{/* Profile Picture */}
									<div className="relative">
										<div>
											<img
												src={user.avatar}
												alt="Profile"
												className="w-14 h-14 rounded-full object-cover"
											/>
											{/* Online/Offline Status Indicator */}

											{
												(user.status === "online") ?
													(<span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white bg-green-500"></span>)
												:
													(<span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white bg-red-500"></span>)
											}
										</div>
									</div>

									{/* Status: In Game / In Tournament */}
									<div>
										{/* Username */}
										<div className="mb-3 text-center">
											<span className="font-medium text-gray-800 text-[.9rem]">{user.username}</span>
										</div>
										<span className="ml-auto text-xs bg-blue-100 text-blue-800 py-1 px-2 rounded-full">
											In Tournament
										</span>
									</div>
								</div>
							</Link>
						))}
					</div>
				</div>
				<button className="float-end absolute right-0 bottom-[-3rem] my-6 w-20 max-sm:bottom-[-5rem] max-sm:text-[1.5rem]">
					<span 
						className={` ${!nextPage ? 'text-gray-500' : ''}`} 
						onClick={() => nextPage && fetchAllUsers(nextPage)}>
						Next
						<MdNavigateNext className="max-sm:text-[1.5rem] inline"/>
					</span>	
				</button>
				<button className="float-end absolute left-0 bottom-[-3rem] my-6 w-20 max-sm:bottom-[-5rem] max-sm:text-[1.5rem]">
					<span 
						className={` ${!prevPage ? 'text-gray-500' : ''}`} 
						onClick={() => prevPage && fetchAllUsers(prevPage)}>
						<MdNavigateBefore className="max-sm:text-[1.5rem] inline"/>
						Prev
					</span>
				</button>
			</div>
		</div>
	</div>
	)
}

export default Friends;
