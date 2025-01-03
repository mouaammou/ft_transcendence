'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getData } from '@/services/apiCalls';
import { useGlobalWebSocket } from '@/utils/WebSocketManager';
import { FaNetworkWired } from "react-icons/fa6";
import { PiShareNetworkFill } from "react-icons/pi";
// i have a repeted function here which is fetchPlayer

export default function CreateJoinTournamentPage() {
  const [tournament_name, setTournamentName] = useState('');
  const router = useRouter();
  const websocket = useGlobalWebSocket();
  const { sendMessage, isConnected, lastMessage } = websocket || {};

  const [inputError, setInputError] = useState({
    alreadyInTournament: false,
    alreadyInGame: false,
    alreadyInTournamentJoin: false,
    tournamentFull: false,
    tournamentName: false,
  });
  const [tab, setTab] = useState([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState('');
  const [players, setPlayers] = useState({});

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
      console.log(`Failed to fetch player with id ${playerId}: ${error}`);
      return null;
    }
  };

  const handleJoinTournament = () => {
    if (selectedTournamentId !== '') {
      sendMessage(
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

  /**
   * Handles the creation of a tournament. If the tournament name is not empty,
   * it sends a message to the server to create the tournament. If the tournament
   * name is empty, it resets the input error and the tournament name.
   */
  const handleCreateTournament = () => {
    setInputError({ ...inputError, tournamentName: false });
    if (tournament_name.trim() !== '') {
      if (tournament_name.length > 12) {
        setInputError({ ...inputError, tournamentName: true });
        setTournamentName('');
        return;
      }
      sendMessage(
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

  const fetchData = async () => {
    if (!lastMessage || !lastMessage.data) return;
    const data = JSON.parse(lastMessage.data);
    console.log(data);
    if (data.status === 'tournaments_created') {
      setTab(data.tournaments);
      const playersAvatar = {};
      for (const tournauwa of data.tournaments) {
        if (!(tournauwa.organizer in playersAvatar)) {
          const player = await fetchPlayer(tournauwa.organizer);
          if (player) {
            playersAvatar[tournauwa.organizer] = player;
          }
        }
      }
      setPlayers(playersAvatar);
    }
  };

  useEffect(() => {

    fetchData();
  }, [lastMessage]);


  useEffect(() => {
    // Get all tournaments from the backend when the page is loaded
    if (!isConnected) return;
    sendMessage(
      JSON.stringify({
        type: 'GET_TOURNAMENTS',
      })
    );
  }, []);


  useEffect(() => {
    if (!lastMessage || !lastMessage.data) return;
    const data = JSON.parse(lastMessage.data);
    if (data.status === 'already_in_tournament') {
      console.log("data from create join tournament 333333 ", data);
      console.log(data);
      setInputError({ ...inputError, alreadyInTournament: true });
      setTimeout(() => {
        router.push('/tournament_board');
      }, 2000);
    } else if (data.status === 'already_in_game') {
      setInputError({ ...inputError, alreadyInGame: true });
      setTimeout(() => {
        router.push('/game');
      }, 2000);
      console.log('pushed to game');
    } else if (data.status === 'already_in_tournament_join') {
      setInputError({ ...inputError, alreadyInTournamentJoin: true });
      setTimeout(() => {
        router.push('/tournament_board');
      }, 1000);
    } else if (data.status === 'tournament_full') {
      setInputError({ ...inputError, tournamentFull: true });
    } else if (data.status === 'created_successfully' || data.status === 'joined_successfully') {
      router.push('/tournament_board');
    }
    return () => {
    };
  }, [lastMessage]);

  const handleInputChange = e => {
    setTournamentName(e.target.value);
  };

  return (
    <div className="mt-28 md:mt-44 lg:mt-56 xl:mt-72 flex items-center justify-center overflow-hidden">
      <div className="container w-full px-4 lg:px-8 ">
        <div className="flex flex-col lg:flex-row gap-8 justify-center items-center">
          {/* Create Tournament Card */}
          <div className="relative w-[calc(100%-2rem)] md:min-h-[371px] sm:w-[500px] lg:w-[600px] p-4 sm:p-6 lg:p-8 rounded-2xl bg-whitetrspnt backdrop-blur-lg border border-white/10 shadow-xl">
            <div className='absolute top-0 left-0 right-0 bottom-0 z-0 brightness-80 rounded-2xl'
              style={{
                backgroundImage: `url(${"1.jpeg"})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                zIndex: '-1',
              }}></div>
            <div>
              <h2 className="flex flex-row text-[26px] lg:text-[40px] font-ibm font-semibold mb-6 text-center lg:text-left">
                <FaNetworkWired className='mr-3' />
                Create tournament
              </h2>

              <p className="hidden lg:block text-[16px] lg:text-[25px] font-balsamiq mb-4 lg:ml-10">
                give it a name:
              </p>

              <input
                type="text"
                value={tournament_name}
                name='tournament_name'
                autoComplete='off'
                onChange={handleInputChange}
                placeholder="1337_Pong"
                className='custom-input w-full '
              />

              <ul className="list-disc list-inside my-6 lg:ml-10 max-w-[269px] lg:max-w-[399px]">
                {inputError.alreadyInTournament && (
                  <li className="text-[14px] lg:text-[16px] text-red-500 py-1">
                    You are already in a tournament
                  </li>
                )}
                {inputError.alreadyInGame && (
                  <li className="text-[14px] lg:text-[16px] text-red-500 py-1">
                    You are already started a game
                  </li>
                )}
                {inputError.tournamentName && (
                  <li className="text-[14px] lg:text-[16px] text-red-500 py-1">
                    Tournament name is not less than 12 characters
                  </li>
                )}
              </ul>

              <button
                onClick={handleCreateTournament}
                className='custom-button w-full md:mt-8'
              >
                CREATE
              </button>
            </div>
          </div>

          {/* Join Tournament Card */}
          <div className="relative w-[calc(100%-2rem)] z-1 md:min-h-[371px] sm:w-[500px] lg:w-[600px] p-4 sm:p-6 lg:p-8 rounded-2xl bg-whitetrspnt backdrop-blur-lg border border-white/10 shadow-xl"
         
          >
            <div className='absolute top-0 left-0 right-0 bottom-0 z-0 brightness-80 rounded-2xl'    style={{
              backgroundImage: `url(${"ping.png"})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              zIndex: '-1'
            }}>

            </div>
            <div>
              <h2 className="flex flex-row text-[26px] lg:text-[40px] z-10 font-ibm font-semibold mb-6 text-center lg:text-left">
                <PiShareNetworkFill className='mr-4' />
                Join tournament
              </h2>

              <p className="text-[16px] lg:text-[25px] font-balsamiq mb-4">
                pending tournaments:
              </p>

              <div className="flex flex-col items-center overflow-y-auto max-h-32 lg:max-h-44 custom-scrollbar">
                {tab.length > 0 ? (
                  tab.map((tournament, index) => {
                    const player = players[tournament.organizer];
                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedTournamentId(tournament.id)}
                        className={`flex items-center gap-3 m-2 px-4 py-5 w-[160px] lg:w-[210px] h-[30px] lg:h-[40px] rounded-xl text-[14px] lg:text-[16px] font-mono font-bold
                      ${tournament.id === selectedTournamentId
                            ? 'bg-btnColor text-white'
                            : 'bg-[#D6D6D6] text-black'}`}
                      >
                        {player?.avatar && (
                          <img
                            src={player.avatar}
                            alt={`${player.name}'s avatar`}
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                        {tournament.name}
                      </button>
                    );
                  })
                ) : (
                  <p className="my-9">no tournaments</p>
                )}
              </div>

              {inputError.alreadyInTournamentJoin && (
                <p className="text-[14px] lg:text-[16px] text-red-500 py-1">
                  You are already in a tournament
                </p>
              )}
              {inputError.tournamentFull && (
                <p className="text-[14px] lg:text-[16px] text-red-500 py-1">
                  This tournament is full
                </p>
              )}

              <button
                onClick={handleJoinTournament}
                className='custom-button w-[120px] lg:w-[210px] md:mt-12'
              >
                JOIN
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
