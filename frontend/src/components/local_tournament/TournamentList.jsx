"use client";

import { useState, useEffect } from 'react';
import { fetchTournaments, searchTournaments } from '@/services/apiCalls';
import Pagination from './Pagination';
import Card from './Card';


const TournamentList = ({filter, searchQuery, currentPage, setCurrentPage}) => {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [prevPage, setPrevPage] = useState(null);
    const [nextPage, setnextPage] = useState(null);
    const [totalPages, setTotalPages] = useState(1);

    const getTournaments = async () => {
        setLoading(true);
        const data = await fetchTournaments(currentPage, filter);
        setTournaments(data.results);
        setPrevPage(data.previous);
        setnextPage(data.next);
        setTotalPages(Math.ceil(data.count / 21));
        setLoading(false);
    };

    const handleSearch = async (query) => {
        setLoading(true);
        try {
            const data = await searchTournaments(query); // API call
            console.log('Search data:', data);
            setTournaments(data.results);
            setPrevPage(data.previous);
            setnextPage(data.next);
            setTotalPages(Math.ceil(data.count / 21));
        } catch (error) {
            console.error('Error fetching search results:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (searchQuery.trim()) {
            const delayDebounceFn = setTimeout(() => {
                if (searchQuery.trim()) {
                    handleSearch(searchQuery);
                } else {
                    setTournaments([]); // Clear results if query is empty
                }
            }, 500); // Debounce time: 500ms
    
            return () => clearTimeout(delayDebounceFn); // Cleanup timeout
        }
        getTournaments();
    }, [currentPage, filter, searchQuery]);

    if (loading) {
        return <div>Loading tournaments...</div>;
    }

    // const formatDate = (date) => {
    //     const options = { 
    //     //   weekday: 'short', // e.g., "Mon"
    //       year: 'numeric', // e.g., "2024"
    //       month: 'short', // e.g., "Nov"
    //     //   day: 'numeric', // e.g., "15"
    //     //   hour: '2-digit', // e.g., "12"
    //     //   minute: '2-digit', // e.g., "30"
    //     };
        
    //     return new Date(date).toLocaleDateString('en-US', options);
    //   };

    return (
        <div className="flex-1 h-full flex flex-col max-w-screen-lg bg-transparent justify-between mx-auto">
            <div className="-m-1.5 overflow-x-auto flex-1">
                <div className="p-1.5 min-w-full inline-block align-middle">
                    <div className="overflow-hidden">
                        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4  grid-auto-rows-min">
                            {tournaments && tournaments.map((tournament) => (
                                <Card
                                    key={tournament.id}
                                    tournament={tournament}
                                />
                            ))}
                        </div>
                            
                        {/* </tbody>
                        </table> */}
                    </div>
                </div>
            </div>

            <div className="h-fit w-full px-6 py-4 whitespace-nowrap mx-auto">
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
