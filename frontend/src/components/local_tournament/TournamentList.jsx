"use client";

import { useState, useEffect } from 'react';
import { fetchTournaments, searchTournaments } from '@/services/apiCalls';
import Pagination from './Pagination';
import { BsTypeH1 } from 'react-icons/bs';
import { useRouter } from 'next/navigation';
import Card from './Card';


const TournamentList = ({filter, searchQuery, currentPage, setCurrentPage}) => {
    const router = useRouter();
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    // const [currentPage, setCurrentPage] = useState(pageNumber);
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

    const handleTournamentDetail = (id) => (
        router.push(`/tournament/${id}/`)
    );

    const formatDate = (date) => {
        const options = { 
        //   weekday: 'short', // e.g., "Mon"
          year: 'numeric', // e.g., "2024"
          month: 'short', // e.g., "Nov"
        //   day: 'numeric', // e.g., "15"
        //   hour: '2-digit', // e.g., "12"
        //   minute: '2-digit', // e.g., "30"
        };
        
        return new Date(date).toLocaleDateString('en-US', options);
      };

    return (
        <div className="flex flex-col w-full max-w-screen-lg bg-transparent justify-between mx-auto">
            <div className="-m-1.5 overflow-x-auto">
                <div className="p-1.5 min-w-full inline-block align-middle">
                    <div className="overflow-hidden">
                        {/* <table className="min-w-full divide-y divide-white/20">

                        <thead>
                            <tr>
                            <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-white/70 uppercase">title</th>
                            <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-white/70 uppercase">status</th>
                            </tr>
                        </thead> */}
                        {/* <tbody className="divide-y divide-white/10"> */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                            {tournaments.map((tournament) => (
                                <Card
                                    key={tournament.id}
                                    tournament={tournament}
                                    // handleTournamentDetail={handleTournamentDetail}
                                    // formatDate={formatDate}
                                />
                                // <tr
                                // key={tournament.id}
                                // onClick={()=>handleTournamentDetail(tournament.id)}
                                // className="hover:bg-white/10 cursor-pointer"
                                // >
                                //     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-50">{tournament.title}</td>
                                //     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-50">
                                //         {tournament.finished === false && <div className="flex w-full h-1.5 bg-white/20 rounded-full overflow-hidden" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="8">
                                //         <div className="flex flex-col justify-center rounded-full overflow-hidden bg-white/80 text-xs text-white text-center whitespace-nowrap transition duration-500" style={{width: ((tournament.match_index-1)*100/7) + '%'}}></div>
                                //         </div>}
                                //         {
                                //             tournament.finished === true && <div className="flex flex-1">&#10004; {formatDate(tournament.updated_at)}</div>
                                //         }
                                //     </td>
                                // </tr>
                            ))}
                        </div>
                            
                        {/* </tbody>
                        </table> */}
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
