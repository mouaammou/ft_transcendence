'use client';
import PongGame from './PongGame';
import { useState, useEffect } from 'react';
import '@/styles/game/game.css';
import CountdownTimer from '@/components/countDown/CountDown.jsx';
import Image from 'next/image';
import TopBar from'@/components/local_tournament/TopBar';


const GamePage = () => {
	const [score1, setScore1] = useState(0);
	const [score2, setScore2] = useState(0);

	return (
		<div className="w-full h-fit flex flex-col border">
		  <div className="flex justify-between px-[5%]">
			<div className="flex w-fit h-auto justify-center items-end font-bold text-cyan-200 text-xl">{score2}</div>
				<div className="vs-section">
					<div className="vs-image">
						<Image src="/vs.svg" alt="vs" width={70} height={70} />
					</div>
					<CountdownTimer className='w-full h-auto flex justify-center' />
				</div>
			<div className="flex w-fit h-auto justify-center items-end font-bold text-cyan-200 text-xl">{score1}</div>
		  </div>

		<div className="flex justify-between ">
			<div className="w-fit h-fit flex justify-center items-center pl-[5%]">
				<div className="text-xl break-all">player1.username</div>
			</div>
			<div className="w-fit h-fit flex justify-center items-center pr-[5%]">
				<div className="text-xl break-all">player2?.username</div>
			</div>
		</div>
		  {/* <div className=""> */}
			
			{/* <div className="self-game"> */}
		<PongGame score1={score1} score2={score2} setScore1={setScore1} setScore2={setScore2} />
			{/* </div> */}
		  {/* </div> */}
		</div>
	  );

	// return (

	// 	<>
	// 	<TopBar />
	// 	<div className="game">
	// 		<div className="up-section">
	// 			<div className="left-score">
	// 				{score2}
	// 			</div>
	// 			<div className="vs-section">
	// 				<div className="vs-image">
	// 					<Image src="/vs.svg" alt="vs" width={70} height={70}/>
	// 				</div>
	// 				<CountdownTimer />
	// 			</div>
	// 			<div className="right-score">
	// 				{score1}
	// 			</div>
	// 		</div>
	// 		<div className="down-section">
	// 				<PongGame  score1={score1} score2={score2} setScore1={setScore1} setScore2={setScore2}/>
	// 		</div>
	// 	</div>
	// 	</>
	// )
}

export default GamePage;
