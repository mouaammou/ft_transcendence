'use client';
import Link from 'next/link';
import { useAuth } from '@/components/auth/loginContext.jsx';
import { MdEmail, MdPhone, MdUpdate } from 'react-icons/md';
import { TfiStatsUp } from 'react-icons/tfi';
import { FaUser, FaUserCheck, FaClock, FaHistory } from 'react-icons/fa';
import { GiBattleAxe } from 'react-icons/gi';
import Image from 'next/image';
import DoughnutChart from '@/components/userStats/userStatsCharts';
import GameHistory from '@/components/history/GameHistory';
import { getData, postData } from '@/services/apiCalls';
import { useEffect, useState, useCallback } from 'react';

const Profile = () => {
	const { profileData: data } = useAuth();

	const [progressData, setProgressData] = useState({
        level: 0,
        progress: 0,
        currentXp: 0,
    });

	const fetchProgressData = useCallback(async (userId) => {
        try {

            const response = await getData(`/progress/${userId}`);
            if (response.status === 200) { 
                setProgressData({
                    level: response.data.level,
                    progress: response.data.progress,
                    currentXp: response.data.current_xp,
                });
            }
        } catch (error) {
            console.error('Error fetching progress data:', error);
        }
    }, []);

    useEffect(() => {
		fetchProgressData(data.id);
    }, [data]);

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
								Level {progressData.level}
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
									style={{ width: `${progressData.progress}%` }}
								>
								</div>
							</div>
							<div className="flex justify-between text-sm mt-1">
								<span>Level {progressData.level}</span>
								<span>{progressData.currentXp}/100 XP</span>
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
						<GameHistory profileId={data.id} />

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