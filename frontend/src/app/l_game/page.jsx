'use client';
import PongGame from './PongGame';
import { useState, useEffect } from 'react';
import '@/styles/game/game.css';
import CountdownTimer from '@/components/countDown/CountDown.jsx';
import Image from 'next/image';
import TopBar from'@/components/local_tournament/TopBar';
// import TopBar from'@/components/local_tournament/TopBar';
import { FaUser } from 'react-icons/fa';
import { MdScoreboard } from "react-icons/md";
import { apiPlayRegularGame } from '@/services/gameApi';




const GamePage = () => {
	const [score1, setScore1] = useState(0);
	const [score2, setScore2] = useState(0);
	const [leftNickname, setLeftNickname] = useState("");
	const [rightNickname, setRightNickname] = useState("");

	const handlePlayClick = async () => {
		const response = await apiPlayRegularGame();
		// console.log(response);
	}

	return (
		<>
		<TopBar />
		{/* <div className="flex justify-center items-center w-full h-full border"> */}
			<div className="w-full h-full flex flex-col">
				<div className="flex justify-between px-[5%]">
					<div className="flex w-fit h-auto justify-center items-end font-bold text-cyan-200 text-xl">
						<div className="flex justify-center items-center ">
							<MdScoreboard className="pr-1" />
							{score2}
						</div>
					</div>
						<div className="vs-section">
							<div className="vs-image">
								<Image src="/vs.svg" alt="vs" width={70} height={70} />
							</div>
							<CountdownTimer className='w-full h-auto flex justify-center' />
						</div>
					<div className="flex w-fit h-auto justify-center items-end font-bold text-cyan-200 text-xl">
					<div className="flex justify-center items-center ">
							{score1}
							<MdScoreboard className="pl-1" />
						</div>
					</div>
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
				/>
				<div
					onClick={handlePlayClick}
					className="mt-16 flex justify-center items-center max-w-96 w-full h-fit mx-auto custom-button "
				>
					Play
				</div>
			</div>
		{/* </div> */}
		</>
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
