'use client';
import React from 'react';
import Board from './board';
import Image from 'next/image';
import mysocket from '@/utils/WebSocketManager';
import { useEffect, useState } from 'react';
import { getData } from '@/services/apiCalls';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/loginContext';
import { Modal } from '@/components/modals/Modal';
import { useGlobalWebSocket } from '@/utils/WebSocketManager';
import confetti from 'canvas-confetti';


function winner_celebration() {
  let end = Date.now() + (5 * 1000);

  // go Buckeyes!

  (function frame() {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 }
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 }
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }());
}

export default function TournamentBoardPage() {
  const { sendMessage, isConnected, lastMessage } = useGlobalWebSocket();
  const [players, setPlayers] = useState([]);
  const [fulfilled, setFulfilled] = useState(false);
  const [fetchedPlayers, setFetchedPlayers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [msgDescription, setMsgDescription] = useState('');
  const [exitTournament, setExitTournament] = useState(false);
  const router = useRouter();
  const { profileData } = useAuth();

  const defaultPlayer = {
    id: -1,
    username: 'Waiting...',
    avatar: '/defaultAvatar.svg',
  };

  const pushToPlay = () => {
    router.push('/create_join_tournament');
  };

  const startTournament = () => {
    if (isConnected)
      sendMessage(
        JSON.stringify({
          type: 'START_TOURNAMENT',
        })
      );
  };

  const leaveTournament = () => {
    if (isConnected)
      sendMessage(
        JSON.stringify({
          type: 'LEAVE_TOURNAMENT',
        })
      );
  };


  useEffect(() => {
    if (!lastMessage) return;
    const data = JSON.parse(lastMessage.data);
    console.log('data  ---> ', data);
    if (data.status === 'players') {
      console.log('bla bla bla bla', data.data);
      setPlayers(data.data);
    } else if (data.status === 'no_tournament_found') {
      console.log('the player does not exist in any tournament');
      router.push('/create_join_tournament');
    } else if (data.status === 'fulfilled') {
      setFulfilled(true);
    } else if (data.status === 'not_fulfilled') {
      setFulfilled(false);
    } else if (data.status === 'PUSH_TO_GAME') {
      router.push('/game');
    } else if (data.status === 'left_tournament') {
      setModalOpen(true);
      setModalMessage('You have withdrawn from the tournament');
      setMsgDescription(
        'You have successfully exited the tournament. If you wish to rejoin or need further assistance, please go to play page. Thank you for your participation!'
      );
      setExitTournament(true);
    } else if (data.status === 'you_can_not_leave') {
      console.log('you can not leave the tournament');
      setModalOpen(true);
      setModalMessage('Tournament Participation in Progress');
      setMsgDescription(
        'The tournament has already commenced, and your participation is crucial. \
      Please remain engaged to support the event and your fellow players. Thank you for your commitment!'
      );
    } else if (data.status === 'organizer_can_not_leave') {
      console.log('you can not leave the tournament');
      setModalOpen(true);
      setModalMessage('Stay Engaged as Tournament Organizer');
      setMsgDescription(
        'The tournament is currently underway with active participants. As the organizer, your presence is essential to ensure the smooth management of the event. \
      Please remain available to address any issues and support the players throughout the tournament. Thank you for your commitment!'
      );
    } else if (data.status === 'celebration') {
      winner_celebration()
      setModalMessage('Congratulations on Your Tournament Victory!');
      setMsgDescription(
        'You have emerged victorious in the tournament! Your hard work and dedication have paid off,\
         showcasing your exceptional skills. Celebrate this achievement and continue to strive for greatness!'
      );
      setExitTournament(true);
      setTimeout(() => {
        setModalOpen(true);
      }, 15000);
    }
  }, [lastMessage]);

  useEffect(() => {

    // if (isConnected)
    sendMessage(JSON.stringify({ type: 'GET_PLAYERS' }));

    // if (isConnected)
    sendMessage(JSON.stringify({ inBoardPage: true }));

    const parse_players = data => {
      data = { round1: Array(1), round2: null, round3: null }
      let players = [];
      for (let round in data) {
        if (data[round] !== null) {
          // players = players.concat(data[round]); 
        }
      }
      return players;
    };


    return () => {
      if (isConnected)
        sendMessage(JSON.stringify({ inBoardPage: false }));
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
      <div className="flex flex-col justify-evenly items-center  p-4 lg:p-12  gap-8">
        <Board {...imageUrls} {...userNames} />
        <button
          className=" font-bold text-slate-950 relative text-[16px] w-[114px]
                   h-[32px] border-white  rounded-xl bg-gray-200"
          onClick={leaveTournament}
        >
          Leave
        </button>
        {fulfilled && profileData.username === organizerUsername && (
          <button
            onClick={startTournament}
            className="relative text-[16px] w-[114px] h-8   inline-flexoverflow-hidden rounded-full p-[2px] 
                      focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
            <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
            <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl">
              Start
            </span>
          </button>
        )}
      </div>
      <Modal
        isOpen={modalOpen}
        title={modalMessage}
        description={msgDescription}
        action={() => {
          setModalOpen(false);
          if (exitTournament) {
            pushToPlay();
            setExitTournament(false);
          }
        }}
      />
    </>
  );
}
