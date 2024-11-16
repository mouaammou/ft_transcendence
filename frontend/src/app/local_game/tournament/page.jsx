'use client';
import TournamentList from '@/components/local_tournament/TournamentList';
import DropDown from '@/components/local_tournament/DropDown';
import { useState } from 'react';

const HomePage = () => {
    const [filterKeyword, setFilterKeyword] = useState('All');
   const keywords = ['All','Recently-played', 'Pending', 'Started'];

    

    return (
        <div className="container">
            <div className="flex flex-col justify-center items-center gap-y-4 mx-auto w-full max-w-96 py-4">
                
                <DropDown
                    filterKeyword={filterKeyword}
                    filterKeywords={keywords}
                    setFilterKeyword={setFilterKeyword}
                />
                {/* Search Input */}
                <input
                    type="text"
                    className="max-w-96 px-4 py-2 w-full rounded-full bg-white/30 border-none outline-none focus:ring focus:ring-white/10"
                    placeholder="Search"
                />
            </div>

            {/* Tournament List */}
            <div className="flex bg-white/50"></div>
            <TournamentList filter={filterKeyword} />
        </div>
    );
};

export default HomePage;
