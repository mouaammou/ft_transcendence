import React, { useState, useEffect, useCallback } from 'react';
import { FaHistory } from 'react-icons/fa';
import { getData } from '@/services/apiCalls';
import { useRouter } from 'next/navigation';
import { MdUpdate } from 'react-icons/md';

import { GrHistory } from 'react-icons/gr';
import { CiUser } from 'react-icons/ci';

const GameHistory = ({profileId}) => {
	// this is causing an error, error -> "Internal React error: Expected static flag was missing. Please notify the React team."
	if (!profileId || profileId === undefined)
		return null;
	const [matches, setMatches] = useState([]);
	const [nextPage, setNextPage] = useState(null);
	const [prevPage, setPrevPage] = useState(null);
	const [pageNumber, setPageNumber] = useState(1);
	const router = useRouter();
	const fetchGameHistory = useCallback(async (userId) => {
		try {
			
			const response = await getData(`/gamehistory/${userId}?page=${1}`);
			if (response.status === 200) {
				setMatches(response.data.results);
				setNextPage(response.data.next ? pageNumber + 1 : null);
				setPrevPage(response.data.previous ? pageNumber - 1 : null);
				setPageNumber(pageNumber);
			}
		} catch (error) {
			console.error('Error fetching game history:', error);
		}
	}, []);

	useEffect(() => {
		fetchGameHistory(profileId);
	}, [fetchGameHistory]);

	return (
		<div className="bg-gray-800 rounded-2xl p-6 shadow-lg">
			<h2 className="text-xl font-semibold mb-6 flex items-center">
				<FaHistory className="mr-2" /> Recent Matches
			</h2>

			<div className="space-y-4 max-h-[400px] overflow-y-auto overflow-x-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
				<div className="min-w-[480px]">
					{matches.map((match) => (
						<div
							key={match.id}
							className="bg-gray-700 rounded-xl p-4 hover:bg-gray-600 transition-all duration-300 mb-4"
						>
							<div className="flex justify-between items-center">
								{/* Player 1 */}
								<div className="flex items-center space-x-3">
									<img
										src={match.player_1.avatar}
										alt="player_1"
										className={`w-12 h-12 rounded-full border-2  cursor-pointer ${match.winner_id === match.player_1.id ? 'border-green-500' : 'border-red-500'
											}`}
										onClick={() => router.push(`/friend/${match.player_1.username}`)}
									/>
									<div>
										<div className="font-medium  cursor-pointer" onClick={() => router.push(`/friend/${match.player_1.username}`)}>{match.player_1.username}</div>
										<div className={`text-lg font-bold ${match.winner_id === match.player_1.id ? 'text-green-400' : 'text-red-400'
											}`}>
											{match.player_1_score}
										</div>
									</div>
								</div>

								{/* VS */}
								<div className="flex flex-col items-center">
									<div className="text-l font-bold text-gray-400">
										{match.finish_type == 'defeat' ? '' : 'Disconnection'}
									</div>
									<div className="text-sm text-gray-400 mt-1">
										{match.game_type == 'connect_four' ? '🚥 Connect Four 🚥' : '🏓 Ping Pong 🏓'}
									</div>
									<div className="mt-3 text-sm text-gray-400 flex items-center justify-center">
										<MdUpdate className="mr-1" />
										{match.creation_date} • {match.creation_time.slice(0, 5)}
									</div>
								</div>

								{/* Player 2 */}
								<div className="flex items-center space-x-3">
									<div className="text-right">
										<div className="font-medium cursor-pointer" onClick={() => router.push(`/friend/${match.player_2.username}`)}>{match.player_2.username}</div>
										<div className={`text-lg font-bold ${match.winner_id === match.player_2.id ? 'text-green-400' : 'text-red-400'
											}`}>
											{match.player_2_score}
										</div>
									</div>
									<img
										src={match.player_2.avatar}
										alt="player_2"
										className={`w-12 h-12 rounded-full border-2 cursor-pointer ${match.winner_id === match.player_2.id ? 'border-green-500' : 'border-red-500'
											}`}
										onClick={() => router.push(`/friend/${match.player_2.username}`)}
									/>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default GameHistory;
