'use client';
import TournamentList from '@/components/local_tournament/TournamentList';
import DropDown from '@/components/local_tournament/DropDown';
import { searchTournaments } from '@/services/apiCalls';
import { useState } from 'react';
import { useEffect } from 'react';

const HomePage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterKeyword, setFilterKeyword] = useState('All');
    const keywords = ['All','Recently-played', 'Pending', 'Started', 'Oldest-to-newest', 'Newest-to-oldest', 'finished'];

    return (
        <div className="container">
            <div className="flex flex-col justify-center items-center gap-y-4 mx-auto w-full max-w-96 py-4">
                
                <DropDown
                    filterKeyword={filterKeyword}
                    filterKeywords={keywords}
                    setFilterKeyword={setFilterKeyword}
                />
                
                <input
                    type="text"
                    className="max-w-96 px-4 py-2 w-full rounded-full bg-white/30 border-none outline-none focus:ring focus:ring-white/10"
                    placeholder="Search"
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Tournament List */}
            <div className="flex bg-white/50"></div>
            <TournamentList filter={filterKeyword} searchQuery={searchQuery}/>
        </div>
    );
};

export default HomePage;
