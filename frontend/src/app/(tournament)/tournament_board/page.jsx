'use client';
import React from 'react';
import Board from './board';
import Image from 'next/image';
import mysocket from '@/utils/WebSocketManager';
import { useEffect, useState } from 'react';
import { getData } from '@/services/apiCalls';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/loginContext';

export default function TournamentBoardPage() {
  const [players, setPlayers] = useState([]);
  const [fulfilled, setFulfilled] = useState(false);
  const [fetchedPlayers, setFetchedPlayers] = useState([]);
  const router = useRouter();
  const { profileData } = useAuth();

  const defaultPlayer = {
    id : -1,
    username: 'default',
    avatar : '/defaultAvatar.svg',
  }

  const startTournament = () => {
    setFulfilled(false);
    mysocket.sendMessage(
      JSON.stringify({
        type: 'START_TOURNAMENT',
      })
    );
  };

  useEffect(() => {
    mysocket.sendMessage(
      JSON.stringify({
        type: 'GET_PLAYERS',
      })
    );
    const parse_players = (data) => {
      // data = {round1: Array(1), round2: null, round3: null}
      let players = [];
      for (let round in data) {
        if (data[round] !== null) {
          players = players.concat(data[round]);
        }
      }
      return players;
    }
    const handleMessage = message => {
      const data = JSON.parse(message.data);
      // console.log('bla',data);
      if (data.status === 'players') {
        console.log('bla bla bla bla', data.data);
        setPlayers(parse_players(data.data));
      } else if (data.status === 'no_tournament_found') {
        console.log('the player does not exist in any tournament');
        router.push('/create_join_tournament');
      } else if (data.status === 'fulfilled') {
        // console.log('the tournament is fullfilled');
        setFulfilled(true);
      } else if (data.status === 'PUSH_TO_GAME') {
        router.push('/game');
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
        newFetchedPlayers.push(defaultPlayer)
      }
      else if (existingPlayer) {
        console.log("player is added \n")
        newFetchedPlayers.push(existingPlayer)
      }else {
        const newPlayer = await fetchPlayer(player);
        if (newPlayer !==  null) {
          console.log('player is fetched ', newPlayer);
          newFetchedPlayers.push(newPlayer);
        }else {
          console.log("Failed to fetch a player");
        }
      }
    }
    setFetchedPlayers(newFetchedPlayers);
  }

  
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
        <Board {...imageUrls} {...userNames} />
        <Image
          className="hidden md:block"
          width={109}
          height={92}
          src="/trofi.svg"
          alt="notFound"
        />
        {fulfilled && profileData.username === organizerUsername && (
          <button
            onClick={startTournament}
            className="border-[1px] m-10 text-[16px] w-[114px] h-[32px] border-white text-white rounded-xl bg-[#00539D]
                       p-[10px] text-center my-6 font-bold lg:text-[22px] lg:w[137px] lg:h-[41] flex items-center justify-center"
          >
            Start
          </button>
        )}
      </div>
    </>
  );
}
