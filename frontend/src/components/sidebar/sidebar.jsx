'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@components/auth/loginContext';
import { AiFillHome } from "react-icons/ai";
import { FaUserFriends } from "react-icons/fa";
import { FaUserPlus } from "react-icons/fa";
import { ImProfile } from "react-icons/im";
import { IoChatboxEllipses } from "react-icons/io5";
import { IoGameController } from "react-icons/io5";
import { IoSettingsSharp } from "react-icons/io5";
import Link from 'next/link';

export default function Sidebar() {
	const router = useRouter();
	const { Logout, isAuth } = useAuth();

	const sidebarItems = [
		{ icon: <FaUserFriends />, route: '/friends' },
		{ icon: <FaUserPlus />, route: '/allusers' },
		{ icon: <ImProfile />, route: '/profile' },
		{ icon: <IoChatboxEllipses />, route: '/chat' },
		{ icon: <IoGameController />, route: '/play' },
		{ icon: <IoSettingsSharp />, route: '/settings' },
	];

	return (
		isAuth &&
			<div className="w-fit bg-gray-950 relative min-h-screen h-full px-2">
				<div className="flex justify-center items-center flex-col">
					{/* Logo Section */}
					<Link className="pt-2 flex justify-center items-center h-fit" href='/'>
						<img src="/main-logo.svg" alt="logo" className="w-16 h-16" />
					</Link>

					{/* Sidebar Items */}
					<div className="flex-1 p-4 lg:mt-20">
						<ul className="space-y-4 flex items-center flex-col text-2xl">
							{sidebarItems.map((item, index) => (
							<li
								className='text-gray-200 rounded-full hover:bg-gray-300 hover:text-gray-600 transition-colors duration-300 cursor-pointer'
								key={index}
								onClick={() => router.push(item.route)}
								>
								<div className='w-full h-full p-5'>
									{item.icon}
								</div>
							</li>
							))}
						</ul>
					</div>

					{/* Logout Section */}
					<div
						className="absolute bottom-0 w-full h-fit p-4 border-t border-gray-700 flex justify-around cursor-pointer text-gray-400 hover:bg-gray-700 hover:text-white transition-colors duration-300 "
						onClick={Logout}
					>
						<img src="/Logout.svg" alt="logout" className="w-6 h-6" />
						<span>Logout</span>
					</div>
				</div>
			</div>
	);
}
