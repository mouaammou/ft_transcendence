// app/tournament/create/page.jsx
'use client';
import { useState } from 'react';

const CreateTournament = () => {
  const [tournament, setTournament] = useState({
    title: '',
    start_at: null,
    match1_nickname1: '',
    match1_nickname2: '',
    match2_nickname1: '',
    match2_nickname2: '',
    match3_nickname1: '',
    match3_nickname2: '',
    match4_nickname1: '',
    match4_nickname2: '',
    user: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTournament((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const cookie = localStorage.getItem('cookie');
      const response = await fetch('http://localhost:8000/game/local-tournaments/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // "Cookie": `access_token=${access_token?.value}; refresh_token=${refresh_token?.value}`,
          'Cookie': cookie.toString(),
        },
        body: JSON.stringify(tournament),
      });
      console.log('Tournament:', tournament);

      if (response.ok) {
        const data = await response.json();
        console.log('Tournament created:', data);
        // Optionally, redirect to the tournament details page or show a success message
      } else {
        console.error('Error creating tournament');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="create-tournament-container">
      <h1>Create Tournament</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Tournament Title"
          value={tournament.title}
          onChange={handleChange}
          required
        />
        <input
          type="datetime-local"
          name="start_at"
          value={tournament.start_at}
          onChange={(e) => setTournament({ ...tournament, start_at: e.target.value })}
        />
        {/* Match Nicknames */}
        {[1, 2, 3, 4].map((match) => (
          <div key={match}>
            <input
              type="text"
              name={`match${match}_nickname1`}
              placeholder={`Match ${match} Player 1`}
              value={tournament[`match${match}_nickname1`]}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name={`match${match}_nickname2`}
              placeholder={`Match ${match} Player 2`}
              value={tournament[`match${match}_nickname2`]}
              onChange={handleChange}
              required
            />
          </div>
        ))}
        <button type="submit">Create Tournament</button>
      </form>
    </div>
  );
};

export default CreateTournament;
