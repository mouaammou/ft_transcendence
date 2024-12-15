'use client';
import TournamentList from '@/components/local_tournament/TournamentList';
import DropDown from '@/components/local_tournament/DropDown';
import { searchTournaments } from '@/services/apiCalls';
import { useState } from 'react';
import { useEffect } from 'react';
import TopBar from'@/components/local_tournament/TopBar';
import Link from 'next/link';
import { IoMdAddCircleOutline } from "react-icons/io";


const HomePage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterKeyword, setFilterKeyword] = useState('All');
    const keywords = ['All','Recently-played', 'Pending', 'Started', 'Oldest-to-newest', 'Newest-to-oldest', 'finished'];
    const [currentPage, setCurrentPage] = useState(1);

    return (
        <>
            <TopBar activeIndex={1} />
        <div className="container">
            <div className="flex max-lg:flex-col justify-center items-center max-lg:gap-y-4 gap-x-4 mx-auto w-full max-w-96 py-4">
                <input
                    type="text"
                    // className="max-w-96 px-4 py-2 w-full rounded-full bg-white/30 border-none outline-none focus:ring focus:ring-white/10"
                    className="max-w-96 w-full min-w-[150px] custom-input"
                    placeholder="Search"
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                 <DropDown
                    filterKeyword={filterKeyword}
                    filterKeywords={keywords}
                    setFilterKeyword={setFilterKeyword}
                    setCurrentPage={setCurrentPage}
                />
                <Link
                    href={"/tournament/create"}
                    className={`max-w-96 w-full custom-input flex `}
                >
                    <IoMdAddCircleOutline className='h-6 w-auto pr-1' />
                    Tournament
                </Link>
            </div>

            {/* Tournament List */}
            <div className="flex bg-white/50"></div>
            <TournamentList currentPage={currentPage} setCurrentPage={setCurrentPage} filter={filterKeyword} searchQuery={searchQuery}/>
        </div>
        </>
    );
};

export default HomePage;
