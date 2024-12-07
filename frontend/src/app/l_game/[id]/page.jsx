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
	const [finished, setFinished] = useState(false);
	const [leftNickname, setLeftNickname] = useState("");	
	const [rightNickname, setRightNickname] = useState("");
	const [title, setTitle] = useState("");
	const [tournament_id, setTournament_id] = useState(0);
	const [round, setRound] = useState(rounds[0]);


	const redirectFinishedTournament = async () => {
		const identical = await params;
		router.push(`/tournament/${identical.id}`);
	};

    useEffect(() => {
        const fetchTournaments = async () => {
          const identical = await params;
          try {
			setTournament_id(identical.id);
            let response = await fetchTournamentMatchPlayers(identical.id);
            // console.log(response);
            setLeftNickname(response.left);
            setRightNickname(response.right);
            setTitle(response.title);
			setFinished(response.finished);
			setRound(getRound(response.match_index));
			//not finished
			if (response.finished === false) {
				//post request to start the game
				console.log('start game');
            	response = await fetchStartPlayTournament(identical.id);
				// setLeftNickname(response);
				console.log(response);
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
					<div className="flex w-fit h-auto justify-center items-end font-bold text-cyan-200 text-xl">{score2}</div>
						<div className="vs-section">
							<div className="vs-image">
								<Image className="max-sm:w-4 " src="/vs.svg" alt="vs" width={70} height={70} />
							</div>
							<CountdownTimer className='w-full h-auto flex justify-center' />
						</div>
					<div className="flex w-fit h-auto justify-center items-end font-bold text-cyan-200 text-xl">{score1}</div>
				</div>

				<div className="flex justify-between ">
					<div className="w-fit h-fit flex justify-center items-center pl-[5%]">
						<div className="flex gap-x-1 justify-center items-center text-xl break-all py-2">
							<FaUser />
							{leftNickname}
						</div>
					</div>
					<div className="w-fit h-fit flex justify-center items-center pr-[5%]">
						<div className="flex gap-x-1 justify-center items-center text-xl break-all py-2">
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
					setLeftNickname={setLeftNickname}
					setRightNickname={setRightNickname}
					tournament_id={tournament_id}
				/>
				<div className="flex w-full h-fit justify-center items-center text-2xl py-4 capitalize">
					{title}
				</div>
			</div>
		{/* </div> */}
		</>
	)
}

export default GamePage;

