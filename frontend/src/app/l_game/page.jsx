'use client';
import PongGame from './PongGame';
import { useState, useEffect } from 'react';
// import '@/styles/game/game.css';
import CountdownTimer from '@/components/countDown/CountDown.jsx';
import Image from 'next/image';

const GamePage = () => {
	const [score1, setScore1] = useState(0);
	const [score2, setScore2] = useState(0);

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
					<PongGame  score1={score1} score2={score2} setScore1={setScore1} setScore2={setScore2}/>
			</div>
		</div>
	)
}

export default GamePage;
