"use client";
import PongGame from "../PongGame";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import '@/styles/game/game.css';
import CountdownTimer from "@/components/countDown/CountDown.jsx";
import Image from 'next/image';
import { fetchStartPlayTournament, fetchTournamentMatchPlayers } from '@/services/apiCalls';
import TopBar from'@/components/local_tournament/TopBar';
import { FaUser } from 'react-icons/fa';
import { MdScoreboard } from "react-icons/md";
import { apiPlayTournamentGame } from '@/services/gameApi';
import { MdOutlineSportsScore } from "react-icons/md";





const rounds = [
	'Opening Matches',
	'Semifinals',
	'Finals',
	'Champion'
]
  
const getRound = (match_index) => {
	if (match_index <= 4) {
		return rounds[0];
	} else if (match_index <= 6) {
		return rounds[1];
	} else if (match_index === 7) {
		return rounds[2];
	} else {
		return rounds[3];
	}
}

const GamePage = ({params}) => {
	const router = useRouter();
	const [score1, setScore1] = useState(0);
	const [score2, setScore2] = useState(0);
	const [maxScore, setMaxScore] = useState(0);
	const [finished, setFinished] = useState(false);
	const [leftNickname, setLeftNickname] = useState("left player");
	const [rightNickname, setRightNickname] = useState("right player");
	const [title, setTitle] = useState("Local Tournament");
	const [tournament_id, setTournament_id] = useState(-1);
	const [round, setRound] = useState(rounds[0]);
	const [playStart, setPlayStart] = useState(false);

	const handlePlayClick = async () => {
		const response = await apiPlayTournamentGame(tournament_id);
		setPlayStart(true);
		// console.log(response);
	}


	const redirectFinishedTournament = async () => {
		const identical = await params;
		router.push(`/tournament/${tournament_id}`);
	};

    useEffect(() => {
        const fetchTournaments = async () => {
          const identical = await params;
          try {
			setTournament_id(identical.id);
            let response = await fetchTournamentMatchPlayers(identical.id);
            setLeftNickname(response.left);
            setRightNickname(response.right);
            setTitle(response.title);
			setFinished(response.finished);
			setRound(getRound(response.match_index));
			//not finished
			if (response.finished === false) {
				//post request to start the game
				console.log('start game');
            	// response = await fetchStartPlayTournament(identical.id);
				// setLeftNickname(response);
				// console.log(response);
			} else
			{
				redirectFinishedTournament();
			}
          } catch (error) {
            console.log('Error:', error);
          }
        };
        fetchTournaments();
      }, []);


	// const changeScore1 = () => {
	// 	setScore1(score1 + 1);
	// }
	return (
		<>
		<TopBar activeIndex={1} />
		{/* <div className="flex justify-center items-center w-full h-full border"> */}
			<div className="w-full h-full flex flex-col">
				<div className="flex justify-between px-[5%]">
					<div className="flex w-fit h-auto justify-center items-end font-bold text-white text-xl">
					<div className="flex justify-center items-center max-sm:text-sm ">
							<MdScoreboard className="pr-1" />
							{score2}
						</div>
					</div>
						<div className="vs-section">
							<div className="vs-image mt-4">
								<Image className="max-sm:w-8 " src="/vs.svg" alt="vs" width={70} height={70} />
							</div>
							<CountdownTimer className='w-full h-auto flex justify-center  max-sm:text-sm' />
							<div className='w-full h-auto flex flex-col justify-center items-center text-xl max-sm:text-sm text-red-600' >
								<MdOutlineSportsScore />
								{maxScore}
							</div>
						</div>

					<div className="flex w-fit h-auto justify-center items-end font-bold text-yellow-200 text-xl">
					<div className="flex justify-center items-center  max-sm:text-sm">
							<MdScoreboard className="pr-1" />
							{score1}
						</div>
					</div>
				</div>

				<div className="flex justify-between ">
					<div className="w-fit h-fit flex justify-center items-center pl-[5%]">
						<div className="flex gap-x-1 justify-center items-center text-xl max-sm:text-sm break-all py-2">
							<FaUser />
							{leftNickname}
						</div>
					</div>
					<div className="w-fit h-fit flex justify-center items-center pr-[5%]">
						<div className="flex gap-x-1 justify-center items-center text-xl max-sm:text-sm text-yellow-200 break-all py-2">
							{rightNickname}
							<FaUser />
						</div>
					</div>
				</div>
				<PongGame
					score1={score1}
					score2={score2}
					setScore1={setScore1}
					setScore2={setScore2}
					setMaxScore={setMaxScore}
					leftNickname={leftNickname}
					rightNickname={rightNickname}
					setLeftNickname={setLeftNickname}
					setRightNickname={setRightNickname}
					title={title}
					setTitle={setTitle}
					tournament_id={tournament_id}
					playStart={playStart}
				/>
				<div className="flex w-full h-fit justify-center items-center text-2xl  max-sm:text-sm py-4 capitalize break-all">
					{title}
				</div>
				<div
					onClick={handlePlayClick}
					className="mt-16 flex justify-center items-center max-w-96 w-full max-sm:w-fit max-sm:text-sm h-fit mx-auto custom-button "
				>
					Play
				</div>
			</div>
		{/* </div> */}
		</>
	);
}

export default GamePage;

