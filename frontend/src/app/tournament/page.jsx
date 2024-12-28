// pages/tournament/page.jsx
'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const TournamentList = () => {
  const [tournaments, setTournaments] = useState([]);

  // Fetch all tournaments
  const fetchTournaments = async () => {
    try {
      // const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://localhost';
      const response = await fetch(`https://localhost/backend/game/local-tournaments/`, {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        setTournaments(data);
      } else {

      }
    } catch (error) {

    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  return (
    <div className="tournament-container">
      <h1>Tournament List</h1>
      <ul>
        {tournaments.map(tournament => (
          <li key={tournament.id}>
            <Link href={`/tournament/details?id=${tournament.id}`}>
              <div className="match">
                <span>{tournament.title}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TournamentList;
