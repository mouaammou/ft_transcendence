"use client";

import { useState, useEffect } from 'react';

//tournament list
import TournamentList from '@/components/local_tournament/TournamentList';
import DropDown from '@/components/local_tournament/DropDown';
import { searchTournaments } from '@/services/apiCalls';


const tabs = [
    { label: "Play game", content: "This is the content of Tab 1" },
    { label: "paly Tournament", content: "This is the content of Tab 2" },
    { label: "create Tournament", content: "This is the content of Tab 3" },
  ];

const Tabs = () => {
    const [activeTab, setActiveTab] = useState(0);

    return (
       <div className="flex-1 flex flex-col justify-center items-center">
            <div className="flex justify-center w-full h-fit gap-x-4 bg-white/95 text-black border-t">
            {
                tabs.map((tab, index) => {
                    return (
                        <div
                            key={index}
                            onClick={() => setActiveTab(index)}
                            className="flex justify-center items-center w-fit h-fit rounded-lg my-2 px-4 py-2 cursor-pointer"
                        >
                            {tab.label}
                        </div>
                    );
                })
            }
            </div>
            {activeTab === 0 && <div className='w-full h-full'>play tab</div>}
            {activeTab === 1 && <Tournaments />}
            {activeTab === 2 && <div className='w-full h-full'>create tab</div>}
       </div>
    );
}


const Tournaments = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterKeyword, setFilterKeyword] = useState('All');
    const keywords = ['All','Recently-played', 'Pending', 'Started', 'Oldest-to-newest', 'Newest-to-oldest', 'finished'];
    const [currentPage, setCurrentPage] = useState(1);

    return (
        <div className="flex flex-col w-full h-full">
            <div className="flex flex-col justify-center items-center gap-y-4 mx-auto w-full h-fit max-w-96 py-4">
                
                <DropDown
                    filterKeyword={filterKeyword}
                    filterKeywords={keywords}
                    setFilterKeyword={setFilterKeyword}
                    setCurrentPage={setCurrentPage}
                />
                
                <input
                    type="text"
                    className="max-w-96 px-4 py-2 w-full rounded-full bg-white/30 border-none outline-none focus:ring focus:ring-white/10"
                    placeholder="Search"
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <TournamentList currentPage={currentPage} setCurrentPage={setCurrentPage} filter={filterKeyword} searchQuery={searchQuery}/>
        </div>
    );
};

export default Tabs;