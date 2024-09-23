"use client";
import PongGame from "./PongGame";
import { useState, useEffect } from "react";
import '@/Styles/game/game.css';
import CountdownTimer from "@/components/countDown/CountDown.jsx";
import Image from 'next/image';

const GamePage = () => {
	const [score1, setScore1] = useState(0);
	const [score2, setScore2] = useState(0);
	const [leftUser, setLeftUser] = useState("Azziiizzz");	
	const [rightUser, setRightUser] = useState("Mouad");


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
			<div className="down-section">
				<div className="left-user">
					<Image className="left-user-img" src="/oredoine.webp" alt="user1" width={100} height={100}/>
					<div className="left-user-name">{leftUser}</div>
				</div>
				<div className="self-game">
					<PongGame  score1={score1} score2={score2} setScore1={setScore1} setScore2={setScore2} setLeftUser={setLeftUser} setRightUser={setRightUser}/>
				</div>
				<div className="right-user">
					<Image className="right-user-img" src="/mouad.jpeg" alt="user1" width={100} height={100}/>
					<div className="right-user-name">{rightUser}</div>
				</div>
			</div>

			<div className="tournament-info">
				<div className="tournament-name">Tournament Name</div>
				{/* <div className="tournament-date">Date</div> */}
			</div>
		</div>
	)
}

export default GamePage;