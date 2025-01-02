'use client';
import React from 'react';
import Board from './board';
import { useEffect, useState } from 'react';
import { getData } from '@/services/apiCalls';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/loginContext';
import { Modal } from '@/components/modals/Modal';
import { useGlobalWebSocket } from '@/utils/WebSocketManager';
import confetti from 'canvas-confetti';


function winner_celebration() {
  let end = Date.now() + (5 * 1000);

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
    const websocket = useGlobalWebSocket();
  const { sendMessage, isConnected, lastMessage } = websocket || {};
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

    if (data.status === 'players') {

      setPlayers(data.data);
    } else if (data.status === 'no_tournament_found') {

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

      setModalOpen(true);
      setModalMessage('Tournament Participation in Progress');
      setMsgDescription(
        'The tournament has already commenced, and your participation is crucial. \
      Please remain engaged to support the event and your fellow players. Thank you for your commitment!'
      );
    } else if (data.status === 'organizer_can_not_leave') {

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

    if (isConnected)
      sendMessage(JSON.stringify({ type: 'GET_PLAYERS' }));

    if (isConnected)
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

        return null;
      }
    } catch (error) {

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

        newFetchedPlayers.push(existingPlayer);
      } else {
        const newPlayer = await fetchPlayer(player);
        if (newPlayer !== null) {

          newFetchedPlayers.push(newPlayer);
        } else {

        }
      }
    }
    setFetchedPlayers(newFetchedPlayers);
  };

  useEffect(() => {



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


  return (
    <div>
      <div className="flex flex-col justify-evenly items-center  p-4 lg:p-12  gap-8">
        <Board {...imageUrls} {...userNames} />
        <button
          className='custom-button w-fit'
          onClick={leaveTournament}
        >
          Leave
        </button>
        {fulfilled && profileData.username === organizerUsername && (
          <button
            onClick={startTournament}
            className="relative custom-button w-fit">
              Start
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
    </div>
  );
}
