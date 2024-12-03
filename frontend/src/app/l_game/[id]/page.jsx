"use client";
import PongGame from "../PongGame";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import '@/styles/game/game.css';
import CountdownTimer from "@/components/countDown/CountDown.jsx";
import Image from 'next/image';
import { fetchStartPlayTournament, fetchTournamentMatchPlayers } from '@/services/apiCalls';

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
	const [leftUser, setLeftUser] = useState("default");	
	const [rightUser, setRightUser] = useState("default");
	const [title, setTitle] = useState("default");
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
            setLeftUser(response.left);
            setRightUser(response.right);
            setTitle(response.title);
			setFinished(response.finished);
			setRound(getRound(response.match_index));
			//not finished
			if (response.finished === false) {
				//post request to start the game
				console.log('start game');
            	response = await fetchStartPlayTournament(identical.id);
				// setLeftUser(response);
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
		<div className="flex flex-col items-center justify-start max-w-[100vw] w-full h-full ">
			<div className="flex w-full h-fit justify-evenly items-center my-24">
				
				<div className="w-fit h-fit flex-1 flex flex-col items-center justify-center text-xl font-bold">
					<div className="mr-4 ml-1 sm:hidden">
						<div className="font-bold text-lg">{leftUser}</div>
					</div>
					{score2}
				</div>
				<div className="w-fit h-fit flex flex-col items-center">
					<svg className="max-w-16 w-full min-w-6" width="70" height="55" viewBox="0 0 70 55" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M32.7971 0.132284C32.5665 0.276441 32.5665 0.444623 32.6818 2.00632C32.7682 2.94334 32.8691 3.77224 32.9124 3.8323C33.0421 4.00048 33.5032 3.97646 33.6761 3.79626C33.8779 3.60405 33.6329 0.396571 33.4023 0.15631C33.2006 -0.0479113 33.1141 -0.0479113 32.7971 0.132284Z" fill="currentColor"/>
						<path d="M46.1707 3.78424C42.5247 4.86542 38.6192 6.03068 37.4951 6.36705L35.4487 6.97971L35.2326 7.54433C34.3391 9.80278 26.2399 33.4204 26.2976 33.5646C26.3408 33.6607 26.5138 33.7688 26.6579 33.8048C26.8164 33.8529 28.9204 33.5526 31.3271 33.1321C33.7482 32.7237 35.7514 32.4113 35.7802 32.4353C35.8234 32.4594 34.2238 37.1324 32.235 42.8026C29.5545 50.4549 28.661 53.1699 28.7619 53.314C28.9493 53.5543 29.5834 53.6263 29.7707 53.4221C29.8572 53.338 31.6874 50.7552 33.8491 47.6799C35.9964 44.6046 37.7978 42.0698 37.841 42.0338C37.8698 41.9977 37.9707 42.0698 38.0428 42.1779C38.3598 42.6584 39.6136 43.7516 40.5215 44.3523C44.5134 46.9952 52.4684 48.0283 59.2417 46.7789C64.3001 45.8419 67.9317 43.3792 69.3008 39.9555C69.9061 38.4539 70.0646 37.3727 69.9781 35.3425C69.8916 33.2763 69.6178 32.3152 68.6955 30.8256C67.6291 29.1197 65.3665 27.4139 62.9166 26.4769C61.3746 25.8882 59.4291 25.3837 56.9215 24.9272C52.6414 24.1343 52.2234 24.1103 52.3243 24.6389C52.382 24.9752 52.627 25.0473 56.0424 25.636C61.2305 26.5369 64.0983 27.6061 66.2312 29.4441C68.3208 31.2461 69.099 33.2162 68.9693 36.3636C68.8973 38.4419 68.6667 39.2467 67.7732 40.7964C66.0582 43.7276 62.5995 45.5175 57.2674 46.2503C56.5756 46.3464 54.9616 46.4065 53.2322 46.4065C50.8832 46.4065 50.0185 46.3585 48.5486 46.1302C43.3317 45.3494 40.0315 43.6555 38.2445 40.8204C37.596 39.7753 36.8899 38.0214 36.789 37.1204C36.7025 36.4357 36.7169 36.3876 37.034 36.2795C37.2213 36.2074 39.1813 36.0152 41.3862 35.8471C44.3837 35.6068 45.4357 35.5587 45.5799 35.6548C45.6951 35.7389 45.8248 35.9912 45.8825 36.2435C46.0698 37.0724 46.776 38.1175 47.6118 38.7782C48.9953 39.8594 50.7103 40.3519 53.1602 40.3519C55.5957 40.3519 57.0368 39.9675 58.305 38.9945C59.357 38.1896 59.5732 37.7331 59.5732 36.3276C59.5732 35.3305 59.5155 35.0422 59.2561 34.6457C58.4059 33.3243 57.3106 32.8678 52.9152 31.9668C49.9032 31.3542 49.6726 31.3181 49.4421 31.5103C48.9377 31.9308 49.3556 32.087 52.7711 32.8078C56.6621 33.6126 57.5124 33.925 58.1176 34.7539C58.622 35.4266 58.7806 36.5438 58.4923 37.3006C58.2185 37.9613 57.325 38.7062 56.2874 39.1026C55.4227 39.4389 55.3074 39.451 53.2322 39.451C51.3155 39.451 50.9697 39.4149 50.2347 39.1626C48.5197 38.598 47.5254 37.6971 46.9489 36.2315C46.6319 35.4266 46.4878 35.1983 46.0842 34.9701C45.6231 34.7058 45.5078 34.6938 44.2396 34.7779C43.4037 34.8259 42.9138 34.8139 42.9426 34.7418C42.9714 34.6818 44.8737 31.9668 47.1651 28.7233C51.402 22.6928 51.5749 22.3804 50.9408 22.1762C50.84 22.1402 48.6639 22.4045 46.0987 22.7648C43.5479 23.1252 41.4294 23.4015 41.4006 23.3775C41.3573 23.3535 44.0955 18.6564 47.4677 12.9502C50.84 7.244 53.5925 2.46281 53.5925 2.31865C53.5925 2.03034 53.3331 1.79008 53.0305 1.79008C52.9008 1.80209 49.8168 2.69106 46.1707 3.78424Z" fill="#A8DADC"/>
						<path d="M19.8125 6.05471C19.4522 6.35504 19.6828 6.55926 21.4986 7.60439C23.1559 8.54141 23.5162 8.63751 23.7036 8.21706C23.8333 7.94076 23.5594 7.73654 21.9166 6.81153C20.144 5.81445 20.1152 5.81445 19.8125 6.05471Z" fill="#A8DADC"/>
						<path d="M0.299675 11.1963C-0.132663 11.5807 -0.10384 12.0372 0.429376 13.0944C1.03465 14.3317 12.506 41.3851 13.2266 43.3071C13.8751 45.013 14.2065 45.4214 15.1289 45.6377C15.8206 45.8059 25.6923 45.7938 26.4129 45.6257C27.3208 45.4214 27.6667 45.001 28.2719 43.3432C28.589 42.5263 29.4681 40.3159 30.2607 38.4419C31.745 34.886 31.8027 34.6457 31.0533 34.7298C30.8083 34.7539 30.5921 35.1263 29.8572 36.8682C29.3528 38.0214 28.4593 40.2318 27.8396 41.7695C26.8452 44.2802 26.6867 44.5925 26.3408 44.7487C26.0094 44.8809 24.9573 44.9169 20.6916 44.9169C14.5236 44.9169 14.8983 45.001 14.3795 43.5594C13.7742 41.8536 3.25398 16.9265 1.69757 13.5148C1.30846 12.6619 0.991415 11.9171 0.991415 11.857C0.991415 11.809 3.25398 11.7609 6.03536 11.7609H11.0793L11.1514 12.0252C11.1802 12.1814 11.3675 12.8901 11.5693 13.6229C11.7566 14.3437 13.6013 19.6174 15.6621 25.3356C17.7373 31.0538 19.6108 36.3156 19.8558 37.0243C20.1007 37.7331 20.3313 38.3698 20.3746 38.4299C20.5187 38.6341 21.1384 38.562 21.2248 38.3338C21.2681 38.2256 21.5275 37.4208 21.8157 36.5678C22.1039 35.7029 23.9053 30.7055 25.8076 25.4558C28.9493 16.7583 30.0733 13.4668 30.3183 12.2054C30.4048 11.7849 30.4336 11.7609 30.938 11.7609C31.6297 11.7609 31.8747 11.6167 31.8027 11.2684C31.7594 11.0041 31.673 10.9801 30.938 10.944C29.8139 10.896 29.4825 11.1603 29.2519 12.3135C28.9493 13.7551 28.589 14.8242 24.77 25.3957C22.7236 31.0779 20.9798 35.9191 20.9078 36.1474L20.7781 36.5678L20.461 35.6669C20.2737 35.1743 18.5155 30.309 16.5556 24.8551C12.9383 14.8723 12.5348 13.671 12.2322 12.2414C12.1313 11.7609 11.944 11.3525 11.7566 11.1843L11.4684 10.92H0.602312L0.299675 11.1963Z" fill="#A8DADC"/>
						<path d="M52.5405 11.0041C52.4828 11.0401 52.4396 11.2083 52.4396 11.3525C52.4396 11.7008 52.5837 11.7249 54.6013 11.809C60.5676 12.0492 65.0062 14.1275 67.1823 17.7074C67.557 18.332 68.364 20.3863 68.2776 20.4704C68.2199 20.5064 60.7117 21.2032 59.5155 21.2872C59.04 21.3113 59.0111 21.2872 58.6364 20.5184C57.7141 18.6324 56.1577 17.8035 53.2322 17.6833C51.6038 17.6113 50.595 17.7434 49.4132 18.1999C48.1018 18.7044 46.9777 19.7616 47.266 20.2061C47.4965 20.5424 47.7559 20.4463 48.6494 19.7135C49.6726 18.8486 50.422 18.6083 52.2955 18.5242C53.8519 18.4522 55.1201 18.6564 56.1433 19.1489C56.8783 19.5093 57.2674 19.9538 57.7718 20.9869C58.4203 22.3324 58.0888 22.2843 63.6083 21.7798C66.2168 21.5395 68.5082 21.2993 68.6811 21.2392C69.2864 21.047 69.3872 20.6265 69.099 19.6535C68.7387 18.4882 68.0902 17.2028 67.4273 16.3379C66.6347 15.3168 64.963 13.8872 63.7813 13.2385C61.2737 11.845 57.253 10.92 53.7222 10.92C53.1313 10.92 52.5837 10.956 52.5405 11.0041Z" fill="#A8DADC"/>
						<path d="M48.8368 50.3708C48.7359 50.4789 48.6927 50.6351 48.7359 50.7192C48.9088 51.0916 50.9985 53.6864 51.1282 53.6864C51.4741 53.6864 51.719 53.5182 51.719 53.278C51.7046 52.9416 49.5574 50.2747 49.2547 50.2267C49.125 50.2026 48.9377 50.2747 48.8368 50.3708Z" fill="#A8DADC"/>
						<path d="M37.4951 51.3078C37.4087 51.3919 37.0628 52.1487 36.7169 52.9897C36.2269 54.1789 36.1117 54.5754 36.2414 54.7315C36.6737 55.3202 36.9619 55.0078 37.7401 53.1218C38.2878 51.7763 38.3454 51.5241 38.1869 51.3559C37.9563 51.1276 37.6825 51.1036 37.4951 51.3078Z" fill="#A8DADC"/>
					</svg>
					<CountdownTimer />
				</div>
				<div className="w-fit h-fit flex-1 flex flex-col items-center justify-center text-xl font-bold">
					<div className="ml-4 mr-1 sm:hidden">
						<div className="font-bold text-lg">{rightUser}</div>
					</div>
					{score1}
				</div>
			</div>
			<div className="flex items-center flex-wrap w-auto h-fit">
				<div className="mx-8 max-sm:hidden">
					<div className="font-bold text-lg">{leftUser}</div>
				</div>
				<div className="bg-[#264653] border rounded-md flex-1 w-auto mx-4 min-w-[100px]">
					<PongGame leftUser={leftUser} rightUser={rightUser} score1={score1} score2={score2} setScore1={setScore1} setScore2={setScore2} tournament_id={tournament_id}/>
				</div>
				<div className="mx-8 max-sm:hidden">
					<div className="font-bold text-lg">{rightUser}</div>
				</div>
			</div>

			<div className="mx-auto mt-4">
				<div className="tournament-name text-2xl">{title} {round}</div>
			</div>
		</div>
	)
}

export default GamePage;