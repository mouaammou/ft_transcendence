"use client";
import PongGame from "../PongGame";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import '@/styles/game/game.css';
import CountdownTimer from "@/components/countDown/CountDown.jsx";
import Image from 'next/image';
import { fetchStartPlayTournament, fetchTournamentMatchPlayers } from '@/services/apiCalls';

const GamePage = ({params}) => {
	const router = useRouter();
	const [score1, setScore1] = useState(0);
	const [score2, setScore2] = useState(0);
	const [finished, setFinished] = useState(false);
	const [leftUser, setLeftUser] = useState("default");	
	const [rightUser, setRightUser] = useState("default");
	const [title, setTitle] = useState("default");

	const redirectFinishedTournament = async () => {
		const identical = await params;
		router.push(`/tournament/${identical.id}`);
	};

    useEffect(() => {
        const fetchTournaments = async () => {
          const identical = await params;
          try {
            let response = await fetchTournamentMatchPlayers(identical.id);
            // console.log(response);
            setLeftUser(response.left);
            setRightUser(response.right);
            setTitle(response.title);
			setFinished(response.finished);
			//not finished
			if (response.finished === false) {
				//post request to start the game
				console.log('start game');
            	response = await fetchStartPlayTournament(identical.id);
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
		<div className="game">
			<div className="up-section">
				<div className="left-score">
					{score2}
				</div>
				<div className="vs-section">
					<div className="vs-image">
						<Image src="/vs.svg" alt="vs" width={70} height={70}/>
					</div>
					<CountdownTimer />
				</div>
				<div className="right-score">
					{score1}
				</div>
			</div>
			<div className="flex items-center">
				<div className="pr-8">
					<div className="font-bold text-lg">{leftUser}</div>
				</div>
				<div className="bg-[#264653] border rounded-md flex-1 w-auto">
					<PongGame  score1={score1} score2={score2} setScore1={setScore1} setScore2={setScore2}/>
				</div>
				<div className="pl-8">
					<div className="font-bold text-lg">{rightUser}</div>
				</div>
			</div>

			<div className="tournament-info">
				<div className="tournament-name text-2xl">{title}</div>
			</div>
		</div>
	)
}

export default GamePage;