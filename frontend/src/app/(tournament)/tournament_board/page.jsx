'use client';
import React from 'react';
import Board from './board';
import Image from 'next/image';
import mysocket from '@/utils/WebSocketManager';
import { useEffect, useState } from 'react';
import { getData } from '@/services/apiCalls';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/loginContext';
import Modal from '@/components/modals/MessageDisplayer';

export default function TournamentBoardPage() {
  const [players, setPlayers] = useState([]);
  const [fulfilled, setFulfilled] = useState(false);
  const [fetchedPlayers, setFetchedPlayers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const router = useRouter();
  const { profileData } = useAuth();

  const defaultPlayer = {
    id: -1,
    username: 'Waiting...',
    avatar: '/defaultAvatar.svg',
  };

  const startTournament = () => {
    setFulfilled(false);
    mysocket.sendMessage(
      JSON.stringify({
        type: 'START_TOURNAMENT',
      })
    );
  };

  const leaveTournament = () => {
    mysocket.sendMessage(
      JSON.stringify({
        type: 'LEAVE_TOURNAMENT',
      })
    );
  };

  useEffect(() => {
    mysocket.sendMessage(
      JSON.stringify({
        type: 'GET_PLAYERS',
      })
    );
    const parse_players = data => {
      // data = {round1: Array(1), round2: null, round3: null}
      let players = [];
      for (let round in data) {
        if (data[round] !== null) {
          players = players.concat(data[round]);
        }
      }
      return players;
    };
    const handleMessage = message => {
      const data = JSON.parse(message.data);
      console.log('data  ---> ', data);
      if (data.status === 'players') {
        console.log('bla bla bla bla', data.data);
        setPlayers(data.data);
      } else if (data.status === 'no_tournament_found') {                   
        console.log('the player does not exist in any tournament');
        router.push('/create_join_tournament');
      } else if (data.status === 'fulfilled') {
        setFulfilled(true);
      } else if (data.status === 'PUSH_TO_GAME') {
        router.push('/game');
      } else if (data.status === 'left_tournament') {
        setModalOpen(true);
        setModalMessage('You have left the tournament');
        setTimeout(() => {
          router.push('/play');
        }, 2000);
      } else if (data.status === 'you_can_not_leave') {
        console.log('you can not leave the tournament');    
        setModalOpen(true);
        setModalMessage('The tournament has already started, you can not leave');
      } else if (data.status === 'celebration') {
        alert('celebration');
        console.log(
          ' celebration celebration celebration celebration celebration celebration celebration'
        );
      }
    };

    mysocket.registerMessageHandler(handleMessage);

    return () => {
      mysocket.unregisterMessageHandler(handleMessage);
    };
  }, []);

  const fetchPlayer = async playerId => {
    try {
      const response = await getData(`/userById/${playerId}`);
      if (response.status === 200) {
        return response.data;
      } else {
        console.log(response);
        return null;
      }
    } catch (error) {
      console.error(`Failed to fetch player with i ${playerId}: ${error}`);
      return null;
    }
  };

  const fetchPlayers = async () => {
    const newFetchedPlayers = [];
    for (let player of players) {
      const existingPlayer = fetchedPlayers.find(fetchedPlayer => fetchPlayer.id == player);
      if (player === -1) {
        newFetchedPlayers.push(defaultPlayer);
      } else if (existingPlayer) {
        console.log('player is added \n');
        newFetchedPlayers.push(existingPlayer);
      } else {
        const newPlayer = await fetchPlayer(player);
        if (newPlayer !== null) {
          console.log('player is fetched ', newPlayer);
          newFetchedPlayers.push(newPlayer);
        } else {
          console.log('Failed to fetch a player');
        }
      }
    }
    setFetchedPlayers(newFetchedPlayers);
  };

  useEffect(() => {
    console.log('hi\n');
    console.log(players);

    fetchPlayers();
  }, [players]);

  const imageUrls = fetchedPlayers?.reduce((acc, player, index) => {
    acc[`imageUrl${index + 1}`] = player?.avatar;
    return acc;
  }, {});

  const userNames = fetchedPlayers?.reduce((acc, player, index) => {
    acc[`userName${index + 1}`] = player?.username;
    return acc;
  }, {});

  const organizerUsername = userNames?.userName1;

  console.log('image Urls --> ', imageUrls);
  return (
    <>
      <div className="flex justify-evenly items-center  p-4 lg:p-12 ">
        {/* make a button to leave the tournament  */}
        <Board {...imageUrls} {...userNames} />
        <button
          className="hidden md:block font-bold text-slate-950 md:relative md:top-[-235px] md:right-[65px] md:text-[16px] md:w-[114px]
                   md:h-[32px] md:border-white  md:rounded-xl md:bg-gray-200"
          onClick={leaveTournament}
        >
          Leave
        </button>
        {/* <Image
          className="hidden md:block"
          width={109}
          height={92}
          src="/trofi.svg"
          alt="notFound"
        /> */}
        {fulfilled && profileData.username === organizerUsername && (
          <button
            onClick={startTournament}
            className="relative inline-flex h-8 overflow-hidden rounded-full p-[2px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
          >
            <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
            <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl">
              Start
            </span>
          </button>
        )}
        {/*<button
            onClick={startTournament}
            className="border-[1px] m-10 text-[16px] w-[114px] h-[32px] border-white text-white rounded-xl bg-[#00539D]
                       p-[10px] text-center my-6 font-bold lg:text-[22px] lg:w[137px] lg:h-[41] flex items-center justify-center"
          >
            Start
          </button> */}
      </div>
      <Modal isOpen={modalOpen} message={modalMessage} onClose={() => setModalOpen(false)} />
    </>
  );
}
