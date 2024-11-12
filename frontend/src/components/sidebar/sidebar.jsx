'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@components/auth/loginContext';

export default function Sidebar() {
	const router = useRouter();
	const { Logout, isAuth } = useAuth();

	const sidebarItems = [
		{ label: 'Home', icon: '/vector.svg', route: '/' },
		{ label: 'Friends', icon: '/friends-svg.svg', route: '/friends' },
		{ label: 'allusers', icon: '/3-User.svg', route: '/allusers' },
		{ label: 'Profile', icon: '/Profil.svg', route: '/profile' },
		{ label: 'Chat', icon: '/chat.svg', route: '/chat' },
		{ label: 'Game', icon: '/Game.svg', route: '/Game' },
		{ label: 'Settings', icon: '/Setting.svg', route: '/Settings' },
	];

	return (
		isAuth &&
			<div className="fixed top-0 left-0 h-screen w-fit bg-gray-800 z-20">
				<div className="grid grid-rows-3 h-full">
					{/* Logo Section */}
					<div className="p-4 flex justify-center items-center h-fit">
						<img src="/main-logo.svg" alt="logo" className="w-20 h-20" />
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
