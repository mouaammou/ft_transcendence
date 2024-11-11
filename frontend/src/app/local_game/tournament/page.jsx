'use client';
import TournamentList from '@/components/local_tournament/TournamentList';
// import { fetchTournaments } from '@/services/apiCalls';

const HomePage = () => {
    // const handleClick = async (e) => {
    //     // e.preventDefault();
    //     // setLoading(true);
    //     const data = await fetchTournaments(1);
    //     // setTournaments(data.results);
    //     console.log(data.results);
    //     // setTotalPages(Math.ceil(data.count / 10)); // Assuming page size of 10
    //     // setLoading(false);
    // };
    return (
        <div className="container">
            <TournamentList />
        </div>
    );
};

export default HomePage;
