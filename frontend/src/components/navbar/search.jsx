import { getData } from '@/services/apiCalls';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useDebounce } from 'use-debounce';

const SearchedItem = ({ result, setResults }) => {
  return (
    <Link href={`/friend/${result.username}`} onClick={() => setResults({})}>
      <div className="flex items-center space-x-4 p-3 cursor-pointer hover:bg-gray-700/50 transition-colors duration-200 rounded-lg border border-gray-700/50 bg-gray-800 w-full my-1">
        <img
          src={result.avatar}
          alt="Profile"
          className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-700 group-hover:ring-blue-500"
        />
        <span className="font-medium text-gray-200 text-sm group-hover:text-white">{result.username}</span>
      </div>
    </Link>
  );
};

const SearchProfileComponent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({});
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  const searchQuery = async () => {
    if (searchTerm.trim() == '') {
      setLoading(false);
      return;
    }

    try {
      const response = await getData(`/searchItems/${searchTerm}`);
      if (response.status === 200) {
        setLoading(true);
        setResults(response.data);
      } else {
        throw new Error('Profile not found');
      }
    } catch (err) {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm.trim() == '') {
      setResults({});
    }
    if (debouncedSearchTerm) {
      searchQuery();
    }
  }, [debouncedSearchTerm, searchTerm]);

  return (
    <div className="w-full max-w-2xl mr-4">
      <div className="relative w-full">
        <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none">
          <svg
            className="w-5 h-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 20"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
            />
          </svg>
        </div>
        <input
          autoComplete='off'
          name='search'
          id='search-145dgrtdf'
          type="search"
          className="block w-full ps-12 py-3 text-gray-100 text-sm rounded-xl bg-gray-700/50 outline-none"
          placeholder="Search"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />

        {loading && results.length > 0 && (
          <div className="absolute top-full left-0 w-full mt-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden z-50">
            <div className="max-h-[300px] overflow-y-auto">
              {results.map((result, index) => (
                <div key={index} className="group">
                  <SearchedItem result={result} setResults={setResults} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchProfileComponent;