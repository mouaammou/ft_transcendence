"use client";
import PongGame from "../PongGame";
import { useState, useEffect } from "react";
import '@/styles/game/game.css';
import CountdownTimer from "@/components/countDown/CountDown.jsx";
import Image from 'next/image';
import { fetchTournamentMatchPlayers } from '@/services/apiCalls';

const GamePage = ({params}) => {
	const [score1, setScore1] = useState(0);
	const [score2, setScore2] = useState(0);
	const [leftUser, setLeftUser] = useState("default");	
	const [rightUser, setRightUser] = useState("default");
	const [title, setTitle] = useState("default");

    useEffect(() => {
        const fetchTournaments = async () => {
          const identical = await params;
          try {
            const response = await fetchTournamentMatchPlayers(identical.id);
            console.log(response);
            setLeftUser(response.left);
            setRightUser(response.right);
            setTitle(response.title);   
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
					<div className="">{leftUser}</div>
				</div>
				<div className="bg-[#264653] border rounded-md resize-x resize-y flex-1 overflow-auto min-w-[100px] max-w-full">
					<PongGame  score1={score1} score2={score2} setScore1={setScore1} setScore2={setScore2}/>
				</div>
				<div className="pl-8">
					<div className="">{rightUser}</div>
				</div>
			</div>

			<div className="tournament-info">
				<div className="tournament-name">{title}</div>
				{/* <div className="tournament-date">Date</div> */}
			</div>
		</div>
	)
}

export default GamePage;