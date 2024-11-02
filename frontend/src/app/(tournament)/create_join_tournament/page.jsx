'use client';

import '@/Styles/game/game.css';
import mysocket from '@/utils/WebSocketManager';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getData } from '@/services/apiCalls';

// i have a repeted function here which is fetchPlayer

export default function CreateJoinTournamentPage() {
  const [tournament_name, setTournamentName] = useState('');
  const router = useRouter();

  const [inputError, setInputError] = useState({
    alreadyInTournament: false,
    alreadyInGame: false,
    alreadyInTournamentJoin: false,
    tournamentFull: false,
  });
  const [tab, setTab] = useState([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState('');
  const [players, setPlayers] = useState({})

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

  const handleJoinTournament = () => {
    if (selectedTournamentId !== '') {
      mysocket.sendMessage(
        JSON.stringify({
          type: 'JOIN_TOURNAMENT',
          data: {
            tournament_id: selectedTournamentId,
          },
        })
      );
      setSelectedTournamentId('');
    }
  };

  const handleCreateTournament = () => {
    if (tournament_name.trim() !== '') {
      mysocket.sendMessage(
        JSON.stringify({
          type: 'CREATE_TOURNAMENT',
          data: {
            tournament_name: tournament_name,
          },
        })
      );
    }
    setTournamentName('');
  };

  useEffect(() => {
    // Get all tournaments from the backend when the page is loaded
    mysocket.sendMessage(
      JSON.stringify({
        type: 'GET_TOURNAMENTS',
      })
    );

    const messageHandler = async e => {
      const data = JSON.parse(e.data);
      console.log(data);
      if (data.status === 'already_in_tournament') {
        setInputError({ ...inputError, alreadyInTournament: true });
        setTimeout(() => {
          router.push('/tournament_board');
        }, 1000);
      } else if (data.status === 'already_in_game') {
        setInputError({ ...inputError, alreadyInGame: true });
        setTimeout(() => {
          router.push('/game');
        }, 1000);
        console.log('pushed to game');
      } else if (data.status === 'already_in_tournament_join') {
        setInputError({ ...inputError, alreadyInTournamentJoin: true });
        setTimeout(() => {
          router.push('/tournament_board');
        }, 1000);
      } else if (data.status === 'tournament_full') {
        setInputError({ ...inputError, tournamentFull: true });
      } else if (data.status === 'created_successfully' || data.status === 'joined_successfully') {
        setTimeout(() => {
          router.push('/tournament_board');
        }, 1000);
      }
      else if (data.tournaments !== undefined) {
        setTab(data.tournaments);
        const playersAvatar = {}
        for (const tournauwa of data.tournaments) {
          if (!(tournauwa.organizer in playersAvatar)) {
            const player = await fetchPlayer(tournauwa.organizer)
            if (player) {
              playersAvatar[tournauwa.organizer] = player
            }
          }
        }
        setPlayers(playersAvatar);
      }
    };
    mysocket.registerMessageHandler(messageHandler);
    return () => {
      mysocket.unregisterMessageHandler(messageHandler);
    };
  }, [inputError.tournamentFull]);

  const handleInputChange = e => {
    setTournamentName(e.target.value);
  };

  return (
    <div className="bg-whitetrspnt m-auto w-fit lg:w-[80%] lg:max-w-[1170px] lg:p-24 p-6 rounded-3xl flex flex-col items-center lg:flex-row lg:justify-center lg:gap-[6%] lg:mt-[100px]">
      <div className="flex flex-col items-center lg:items-start">
        <p className="text-[26px] font-ibm font-semibold m-auto w-fit my-2 lg:text-[40px]  lg:m-0 lg:mb-11">
          Create tournament
        </p>
        <p className="hidden text-[16px] font-balsamiq my-1 lg:text-[25px] lg:block  lg:ml-10">
          give it a name:
        </p>
        <input
          type="text"
          value={tournament_name}
          onChange={handleInputChange}
          placeholder="my_tournament123..."
          className="rounded-lg w-[200px] px-3 text-black h-[40px] placeholder:text-black placeholder:font-sans placeholder:text-[14]
                        placeholder:font-extralight focus:outline-none focus:text-black lg:ml-10 lg:w-[255px] lg:h-[52px]"
        />
        <ul className="list-disc list-inside  my-6 lg:ml-10 max-w-[269px] lg:max-w-[399px]">
          {inputError.alreadyInTournament ? (
            <li className={`text-[14px] font-sans font-light  py-1 lg:text-[16px] text-red-500`}>
              You are already in a tournament
            </li>
          ) : null}
          {inputError.alreadyInGame ? (
            <li className={`text-[14px] font-sans font-light  py-1 lg:text-[16px] text-red-500`}>
              You are already started a game
            </li>
          ) : null}
        </ul>
        <button
          className="  border-[1px]  text-[16px] w-[114px] h-[32px]
                 border-white rounded-xl bg-[#30C7EC] my-6 font-bold lg:text-[22px] lg:w[167px] lg:h-[41] lg:self-end"
          onClick={handleCreateTournament}
        >
          CREATE
        </button>

        <div className="lg:hidden">
          <div className="w-[84px] h-[1px] mt-4 bg-white mb-[2px]"></div>
          <div className="w-[84px] h-[1px] mb-4 bg-white"></div>
        </div>
      </div>
      <div className="hidden xl:block xl:my-auto xl:w-[0.5px] xl:h-[250px]  xl:bg-white"></div>
      <div className="flex flex-col items-center lg:justify-between">
        <p className="text-[26px] font-ibm font-semibold m-auto w-fit my-2 lg:text-[40px] lg:min-w-[338px]  lg:mb-11">
          Join tournament
        </p>
        <p className="text-[16px] font-balsamiq my-1 lg:text-[25px] lg:ml-[-40px] ">
          pending tournaments:
        </p>
        <div className="flex flex-col items-center overflow-y-auto custom-scrollbar max-h-32 lg:max-h-44">
          {tab.length > 0 ? (
            tab.map((tournament, index) => {

              const player = players[tournament.organizer]
              return (
                <button
                  key={index}
                  className={`flex-shrink-0 text-[14px]  font-mono bg-[#D6D6D6] text-black font-bold
                            rounded-md m-2 w-[120px] h-[30px] text-center lg:text-[16px] 
                              lg:w-[210px] lg:h-[40px] ${tournament.id === selectedTournamentId ? 'bg-buttoncolor text-white' : ''} flex justify-center items-center gap-3 `}
                  onClick={() => {
                    setSelectedTournamentId(tournament.id);
                  }}
                >
                  {player && player.avatar && (
                    <img src={player.avatar} alt={`${player.name}'s avatar`} className="w-8 h-8  rounded-full" />
                  )}
                  {tournament.name} 
                </button>
              );
            })
          ) : (
            <p className='my-9'>no tournaments</p>
          )}
        </div>

        {inputError.alreadyInTournamentJoin ? (
          <p className={`text-[14px] font-sans font-light  py-1 lg:text-[16px] text-red-500`}>
            You are already in a tournament
          </p>
        ) : null}
        {inputError.tournamentFull ? (
          <p className={`text-[14px] font-sans font-light  py-1 lg:text-[16px] text-red-500`}>
            This tournament is full
          </p>
        ) : null}
        <button
          className="  border-[1px]  text-[16px] w-[114px] h-[32px]
                 border-white rounded-xl bg-[#30C7EC] my-6 font-bold lg:text-[22px] lg:w[137px] lg:h-[41] lg:self-end "
          onClick={handleJoinTournament}
        >
          JOIN
        </button>
      </div>
    </div>
  );
}
