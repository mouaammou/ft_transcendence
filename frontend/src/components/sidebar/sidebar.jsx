'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@components/auth/loginContext';

export default function Sidebar() {
	const router = useRouter();
	const { Logout, isAuth } = useAuth();

	const sidebarItems = [
		{ label: 'Home', icon: '/vector.svg', route: '/' },
		{ label: 'Friends', icon: '/3-User.svg', route: '/friends' },
		{ label: 'Profile', icon: '/Profil.svg', route: '/profile' },
		{ label: 'Chat', icon: '/chat.svg', route: '/chat' },
		{ label: 'Game', icon: '/Game.svg', route: '/Game' },
		{ label: 'Settings', icon: '/Setting.svg', route: '/Settings' },
	];

	return (
		isAuth &&
		<div className="fixed top-0 left-0 h-screen w-64 bg-gray-800">
			<div className="flex flex-col h-full">
			{/* Logo Section */}
			<div className="p-4 flex justify-center items-center border-b border-gray-700">
				<img src="new-logo.svg" alt="logo" className="w-12 h-12" />
			</div>

			{/* Sidebar Items */}
			<div className="flex-1 p-4">
				<ul className="space-y-4">
					{sidebarItems.map((item, index) => (
					<li
						key={index}
						className={`flex items-center cursor-pointer p-2 rounded-md transition-colors duration-300 
							${router.pathname === item.route ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
						onClick={() => router.push(item.route)}
						>
						<img src={item.icon} alt={item.label} className="w-6 h-6 mr-3" />
						<span>{item.label}</span>
					</li>
					))}
				</ul>
			</div>

			{/* Logout Section */}
			<div className="p-4 border-t border-gray-700">
				<ul>
					<li
					className="flex items-center cursor-pointer p-2 rounded-md text-gray-400 hover:bg-gray-700 hover:text-white transition-colors duration-300"
					onClick={Logout}
					>
					<img src="/Logout.svg" alt="logout" className="w-6 h-6 mr-3" />
					<span>Logout</span>
					</li>
				</ul>
			</div>
			</div>
		</div>
	);
}
