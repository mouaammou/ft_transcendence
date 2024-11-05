// pages/tournament/details.jsx
'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const TournamentDetails = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');// Get tournament ID from query params
  const [tournament, setTournament] = useState({
    title: 'Local Tournament',
    match1_nickname1: 'Player 1',
    match1_nickname2: 'Player 2',
    match2_nickname1: 'Player 3',
    match2_nickname2: 'Player 4',
    match3_nickname1: 'Player 5',
    match3_nickname2: 'Player 6',
    match4_nickname1: 'Player 7',
    match4_nickname2: 'Player 8',
    match1_winner: null,
    match2_winner: null,
    match3_winner: null,
    match4_winner: null,
    match5_winner: null,
    match6_winner: null,
    match7_winner: null,
  });

  const fetchTournamentDetails = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/game/local-tournaments/${id}/`, {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        setTournament(data);
      } else {
        console.error('Error fetching tournament details');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    console.log('Tournament ID:', id); // Add this line to check the ID
    if (id) {
      fetchTournamentDetails(id);
    }
  }, [id]);
  return (
    <div className="tournament-container">
      <h1>{tournament.title}</h1>

      {/* Round 1 */}
      <div className="round round-1">
        <div className="match">
          <span>{tournament.match1_nickname1}</span> vs <span>{tournament.match1_nickname2}</span>
        </div>
        <div className="match">
          <span>{tournament.match2_nickname1}</span> vs <span>{tournament.match2_nickname2}</span>
        </div>
        <div className="match">
          <span>{tournament.match3_nickname1}</span> vs <span>{tournament.match3_nickname2}</span>
        </div>
        <div className="match">
          <span>{tournament.match4_nickname1}</span> vs <span>{tournament.match4_nickname2}</span>
        </div>
      </div>

      {/* Round 2 */}
      <div className="round round-2">
        <div className="match">
          <span>{tournament.match1_winner || 'Waiting...'}</span> vs{' '}
          <span>{tournament.match2_winner || 'Waiting...'}</span>
        </div>
        <div className="match">
          <span>{tournament.match3_winner || 'Waiting...'}</span> vs{' '}
          <span>{tournament.match4_winner || 'Waiting...'}</span>
        </div>
      </div>

      {/* Final Round */}
      <div className="round final-round">
        <div className="match">
          <span>{tournament.match5_winner || 'Waiting...'}</span> vs{' '}
          <span>{tournament.match6_winner || 'Waiting...'}</span>
        </div>
      </div>

      {/* Champion */}
      <div className="champion">
        {tournament.match7_winner ? (
          <h2>Champion: {tournament.match7_winner}</h2>
        ) : (
          <h2>Waiting...</h2>
        )}
      </div>
    </div>
  );
};

export default TournamentDetails;
