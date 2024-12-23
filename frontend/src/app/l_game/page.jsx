'use client';
// import PongGame from './newGame';
import PongGame from './PongGame';
import { useState, useEffect } from 'react';
// import '@/styles/game/game.css';
import CountdownTimer from '@/components/countDown/CountDown.jsx';
import Image from 'next/image';
import TopBar from'@/components/local_tournament/TopBar';
// import TopBar from'@/components/local_tournament/TopBar';
import { FaUser } from 'react-icons/fa';
import { MdScoreboard } from "react-icons/md";
import { apiPlayRegularGame } from '@/services/gameApi';
import { MdOutlineSportsScore } from "react-icons/md";




const GamePage = () => {
	const [score1, setScore1] = useState(0);
	const [score2, setScore2] = useState(0);
	const [maxScore, setMaxScore] = useState(0);
	const [leftNickname, setLeftNickname] = useState("left player");
	const [rightNickname, setRightNickname] = useState("right player");
	const [title, setTitle] = useState("Local Game");
	const [playStart, setPlayStart] = useState(false);


	const handlePlayClick = async () => {
		const response = await apiPlayRegularGame();
		setPlayStart(true);
	}

	return (
		<>
		<TopBar />
		{/* <div className="flex justify-center items-center w-full h-full border"> */}
			<div className="w-full h-full flex flex-col">
				<div className="flex justify-between px-[5%]">
					<div className="flex w-fit h-auto justify-center items-end font-bold text-white text-xl">
						<div className="flex justify-center items-center  max-sm:text-sm">
							<MdScoreboard className="pr-1" />
							{score2}
						</div>
					</div>
						<div className="vs-section">
							<div className="vs-image mt-4">
								<Image className="max-sm:w-8" src="/vs.svg" alt="vs" width={70} height={70} />
							</div>
							<CountdownTimer className='w-full h-auto flex justify-center  max-sm:text-sm' />
							<div className='w-full h-auto flex flex-col justify-center items-center text-xl max-sm:text-sm text-red-600' >
								<MdOutlineSportsScore />
								{maxScore}
							</div>
						</div>
					<div className="flex w-fit h-auto justify-center items-end font-bold text-cyan-200 text-xl">
					<div className="flex justify-center items-center text-yellow-200 max-sm:text-sm">
							{score1}
							<MdScoreboard className="pl-1" />
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
					setMaxScore={setMaxScore}
					setScore1={setScore1}
					setScore2={setScore2}
					leftNickname={leftNickname}
					rightNickname={rightNickname}
					setLeftNickname={setLeftNickname}
					setRightNickname={setRightNickname}
					title={title}
					setTitle={setTitle}
					playStart={playStart}
				/>
				<div className="flex w-full h-fit justify-center items-center text-2xl max-sm:text-sm py-4 capitalize break-all">
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
