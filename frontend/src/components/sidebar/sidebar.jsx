'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@components/auth/loginContext';
import { AiFillHome } from 'react-icons/ai';
import { FaUserFriends, FaUserPlus } from 'react-icons/fa';
import { ImProfile } from 'react-icons/im';
import { IoChatboxEllipses, IoGameController, IoSettingsSharp } from 'react-icons/io5';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
const router = useRouter();
const pathname = usePathname();
const { Logout, isAuth } = useAuth();

const sidebarItems = [
	{ icon: <FaUserFriends className="text-2xl" />, route: '/friends', label: 'Friends' },
	{ icon: <FaUserPlus className="text-2xl" />, route: '/allusers', label: 'Find Users' },
	{ icon: <ImProfile className="text-2xl" />, route: '/profile', label: 'Profile' },
	{ icon: <IoChatboxEllipses className="text-2xl" />, route: '/chat', label: 'Chat' },
	{ icon: <IoGameController className="text-2xl" />, route: '/play', label: 'Play' },
	{ icon: <IoSettingsSharp className="text-2xl" />, route: '/settings', label: 'Settings' },
];

return (
isAuth && (
	<div className="w-28 bg-gradient-to-b from-gray-900 to-gray-950 relative min-h-screen h-full border-r border-gray-800/50">
	<div className="flex flex-col h-full">
		{/* Logo Section */}
		<Link 
		className="pt-4 pb-2 flex justify-center items-center h-fit relative"
		href="/"
		>
		<img 
			src="/main-logo.svg" 
			alt="logo" 
			className="w-16 h-16"
		/>
		{/* Removed hover effect */}
		<div className="absolute inset-0 bg-blue-500/10 rounded-full filter blur-xl opacity-0"></div>
		</Link>

		{/* Sidebar Items */}
		<div className="flex-1 px-2 lg:mt-12">
		<ul className="space-y-2 flex flex-col items-center">
			{sidebarItems.map((item, index) => {
			const isActive = pathname === item.route;
			return (
				<li
				key={index}
				onClick={() => router.push(item.route)}
				className={`w-full flex items-center rounded-xl cursor-pointer
					${isActive 
					? 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-400'
					: 'text-gray-400'
					}`}
				>
				<div className="min-w-[4rem] h-14 flex items-center justify-center relative">
					{item.icon}
					{isActive && (
					<div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full"></div>
					)}
				</div>
				{/* Removed hover effect */}
				{!isActive && (
					<div className="absolute left-0 w-1 h-8 bg-blue-500 rounded-r-full opacity-0"></div>
				)}
				</li>
			);
			})}
		</ul>
		</div>

		{/* Logout Section */}
		<div
		onClick={Logout}
		className="w-full p-4 border-t border-gray-800/50 cursor-pointer bg-gradient-to-r from-red-500/20 to-red-600/20"
		>
		<div className="flex items-center justify-center space-x-2">
			<img 
			src="/Logout.svg" 
			alt="logout" 
			className="w-6 h-6" 
			/>
			{/* Removed hover effect */}
			<span className="hidden text-gray-400 whitespace-nowrap font-medium">
			Logout
			</span>
		</div>
		</div>
	</div>
	</div>
)
);

}