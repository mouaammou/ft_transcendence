// pages/tournament/page.jsx
'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const TournamentList = () => {
  const [tournaments, setTournaments] = useState([]);

  // Fetch all tournaments
  const fetchTournaments = async () => {
    try {
      const response = await fetch('http://localhost:8000/game/local-tournaments/', {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        setTournaments(data); // Assuming data is an array of tournaments
      } else {
        console.log('Error fetching tournaments');
      }
    } catch (error) {
      console.log('Error:', error);
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
