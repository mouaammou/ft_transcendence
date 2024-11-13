// pages/tournament/page.jsx
'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchTournamentDetail } from '@/services/apiCalls';

const TournamentList = () => {
  const router = useRouter();
  const { id } = router.query;

  const [tournaments, setTournaments] = useState([]);

  // Fetch all tournaments
  const fetchTournaments = async () => {
    try {
      const response = await fetchTournamentDetail(id);

      if (response.ok) {
        const data = await response.json();
        setTournaments(data);
      } else {
        console.error('Error fetching tournament details');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, [id]);

  return (
    <div className="tournament-container">
      <h1>Tournament List</h1>
      <ul>
        {tournaments.map((tournament) => (
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

