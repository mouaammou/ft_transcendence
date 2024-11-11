"use client";

import { useState, useEffect } from 'react';
import { fetchTournaments } from '@/services/apiCalls';
import Pagination from './Pagination';

const TournamentList = () => {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [prevPage, setPrevPage] = useState(null);
    const [nextPage, setnextPage] = useState(null);
    const [totalPages, setTotalPages] = useState(1);

    // Fetch data when the page loads or when the currentPage changes
    useEffect(() => {
        const getTournaments = async () => {
            setLoading(true);
            const data = await fetchTournaments(currentPage);
            setTournaments(data.results);
            setPrevPage(data.previous);
            setnextPage(data.next);
            // console.log(data.results);
            setTotalPages(Math.ceil(data.count / 21)); // Assuming page size of 10
            setLoading(false);
        };

        getTournaments();
    }, [currentPage]);

    if (loading) {
        return <div>Loading tournaments...</div>;
    }

    return (
        <div className="flex flex-col w-full max-w-screen-lg bg-white/5 justify-between mx-auto">
            <div className="-m-1.5 overflow-x-auto">
                <div className="p-1.5 min-w-full inline-block align-middle">
                    <div className="overflow-hidden">
                        <table className="min-w-full divide-y divide-white/20">
                        <thead>
                            <tr>
                            <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-white/70 uppercase">title</th>
                            <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-white/70 uppercase">id</th>
                            <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-white/70 uppercase">status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {tournaments.map((tournament) => (
                                <tr key={tournament.id} className="hover:bg-white/10">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-50">{tournament.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-50">{tournament.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-50">{tournament.finished?'True':'False'}</td>
                                </tr>
                            ))}
                            
                        </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div colSpan="4"  className="h-full px-6 py-4 whitespace-nowrap mx-auto">
                <Pagination
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    prevPage={prevPage}
                    nextPage={nextPage}
                    totalPages={totalPages}
                />
            </div>
        </div>
    );
};

export default TournamentList;
