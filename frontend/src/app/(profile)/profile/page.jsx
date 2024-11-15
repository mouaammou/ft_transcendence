'use client';
import Link from 'next/link';
import { useAuth } from '@/components/auth/loginContext.jsx';
import { MdOutlineAlternateEmail, MdDataSaverOff, MdEmail, MdPhone, MdUpdate } from 'react-icons/md';
import { IoMdPhonePortrait } from 'react-icons/io';
import { TfiStatsUp } from 'react-icons/tfi';
import { GrHistory } from 'react-icons/gr';
import { CiUser } from 'react-icons/ci';
import { FaUser, FaUserCheck, FaClock, FaHistory } from 'react-icons/fa';
import { GiBattleAxe } from 'react-icons/gi';
import Image from 'next/image';
import DoughnutChart from '@/components/userStats/userStatsCharts';

const Profile = () => {
	const { profileData: data } = useAuth();

	return (
		data && (
			<div className="min-h-screen bg-gray-900 text-white">
			{/* Hero Section with Background */}
				<div className="relative h-72 w-full overflow-hidden">
					<Image
						src="/gaming-demo.jpeg"
						alt="profile background"
						width={1920}
						height={1080}
						className="w-full h-full object-cover object-center filter brightness-50"
					/>
				<div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900" />
			</div>

			{/* Main Content */}
			<div className="container mx-auto px-4 -mt-32 relative z-1">
				{/* Profile Header */}
				<div className="flex flex-col items-center mb-12">
					<div className="relative">
						<img
							src={data.avatar}
							alt="profile avatar"
							className="w-40 h-40 rounded-full border-4 border-sky-500 shadow-xl object-cover transform hover:scale-105 transition-transform duration-300"
						/>
						<div className="absolute -bottom-2 -right-2 bg-sky-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
							Level 5
						</div>
					</div>
					
					<div className="mt-4 text-center">
						<h1 className="text-3xl font-bold">{`${data.first_name} ${data.last_name}`}</h1>
						<p className="text-sky-400">@{data.username}</p>
					</div>

					{/* Level Progress Bar */}
					<div className="w-full max-w-md mt-6">
						<div className="bg-gray-700 h-4 rounded-full overflow-hidden">
							<div 
								className="h-full bg-gradient-to-r from-sky-500 to-sky-400 transition-all duration-500 ease-out"
								style={{ width: '45%' }}
							>
							</div>
						</div>
						<div className="flex justify-between text-sm mt-1">
							<span>Level 5</span>
							<span>45/100 XP</span>
						</div>
					</div>
				</div>

				{/* Grid Layout for Info Cards */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
					{/* User Info Card */}
					<div className="bg-gray-800 rounded-2xl p-6 shadow-lg">
					<h2 className="text-xl font-semibold mb-6 flex items-center">
						<FaUser className="mr-2" /> Profile Information
					</h2>
					
					<div className="space-y-4">
						{[
							{ icon: <FaUserCheck />, label: "Username", value: data.username },
							{ icon: <MdEmail />, label: "Email", value: data.email },
							{ icon: <MdPhone />, label: "Phone", value: data.phone || "No phone number" },
						].map((item, index) => (
							<div key={index} className="flex items-center p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
							<span className="text-sky-400 mr-3">{item.icon}</span>
							<div>
								<div className="text-sm text-gray-400">{item.label}</div>
								<div className="font-medium">{item.value}</div>
							</div>
							</div>
						))}
					</div>

					<Link href="/edit_profile">
						<button className="w-full mt-6 bg-sky-500 hover:bg-sky-600 text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center">
							<MdUpdate className="mr-2" /> Update Profile
						</button>
					</Link>
					</div>

					{/* Match History Card */}
					<div className="bg-gray-800 rounded-2xl p-6 shadow-lg">
					<h2 className="text-xl font-semibold mb-6 flex items-center">
						<FaHistory className="mr-2" /> Recent Matches
					</h2>
					
					<div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
						{[1, 2, 3, 4, 5, 6].map((match, index) => (
							<div key={index} className="bg-gray-700 rounded-xl p-4 hover:bg-gray-600 transition-all duration-300">
							<div className="flex justify-between items-center">
								{/* Player 1 */}
								<div className="flex items-center space-x-3">
									<img
									src="https://randomuser.me/api/portraits/men/1.jpg"
									alt="Player 1"
									className="w-12 h-12 rounded-full border-2 border-green-500"
									/>
									<div>
									<div className="font-medium">John Doe</div>
									<div className="text-green-400 text-lg font-bold">21</div>
									</div>
								</div>

								{/* VS */}
								<div className="flex flex-col items-center">
									<GiBattleAxe className="text-gray-400 text-xl" />
									<div className="text-sm text-gray-400 mt-1">VS</div>
								</div>

								{/* Player 2 */}
								<div className="flex items-center space-x-3">
									<div className="text-right">
									<div className="font-medium">Jane Smith</div>
									<div className="text-red-400 text-lg font-bold">18</div>
									</div>
									<img
									src="https://randomuser.me/api/portraits/women/3.jpg"
									alt="Player 2"
									className="w-12 h-12 rounded-full border-2 border-red-500"
									/>
								</div>
							</div>
							
							<div className="mt-3 text-sm text-gray-400 flex items-center justify-center">
								<MdUpdate className="mr-1" />
								2023-09-07 • 3:00 PM
							</div>
							</div>
						))}
					</div>
					</div>
				</div>

				{/* Stats Section */}
				<div className="bg-gray-800 rounded-2xl p-6 shadow-lg mb-12">
					<h2 className="text-xl font-semibold mb-6 flex items-center">
						<TfiStatsUp className="mr-2" /> Statistics
					</h2>
					<div className="max-w-3xl mx-auto">
						<DoughnutChart />
					</div>
				</div>
			</div>
			</div>
		)
	);
};

export default Profile;