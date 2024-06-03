"use client";
import PongGame from "./PongGame";
import { useState, useEffect } from "react";

const GamePage = () => {
	const [score1, setScore1] = useState(0);
	const [score2, setScore2] = useState(0);


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
						<img src="/vs.svg" alt="vs" />
					</div>
					<div className="vs-time">
						03 : 15
					</div>
				</div>
				<div className="right-score">
					{score1}
				</div>
			</div>
			<div className="down-section">
				<div className="left-user">
					<img className="left-user-img" src="/avatar3.jpeg" alt="user1" />
					<div className="left-user-name">user1</div>
				</div>
				<div className="self-game">
					<PongGame  score1={score1} score2={score2} setScore1={setScore1} setScore2={setScore2}/>
				</div>
				<div className="right-user">
					<img className="right-user-img" src="/avatar4.jpeg" alt="user1" />
					<div className="right-user-name">user2</div>
				</div>
			</div>
		</div>
	)
}

export default GamePage;