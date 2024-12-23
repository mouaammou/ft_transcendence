'use client';

import { getData } from '@/services/apiCalls';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useDebounce } from 'use-debounce';

const SearchedItem = ({ result , setResults}) => {
  return (
  <Link href={`/friend/${result.username}`} onClick={() => setResults({})}>
    <div className="flex flex-col sm:flex-row items-center justify-between p-3 cursor-pointer hover:bg-gray-100 transition-colors duration-200 rounded-lg shadow-sm bg-white w-full sm:w-96 my-1">
      <div className="flex items-center space-x-4 mb-2 sm:mb-0">
        <img
          src={result.avatar}
          alt="Profile"
          className="w-10 h-10 rounded-full object-cover border border-gray-200"
        />
        <span className="font-medium text-gray-800 text-sm">{result.username}</span>
      </div>
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
    };
  }, [debouncedSearchTerm, searchTerm]);

  return (
    <div className="w-full">
      <div className="relative w-full">
        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
          <svg
            className="w-4 h-4 text-gray-500"
            aria-hidden="true"
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
          type="search"
          id="default-search"
          className="block w-full ps-10 py-2.5 text-gray-900 text-sm rounded-lg bg-gray-50/50 border border-gray-200 focus:border-gray-300 focus:outline-none transition-colors duration-200"
          placeholder="Search for users, friends, tournaments"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />

        {/* Results of Search */}
        <div className="absolute top-12 left-0 bg-transparent z-40">
          {loading &&
            results.length > 0 &&
            results.map((result, index) => <SearchedItem key={index} result={result} setResults={setResults}
            />)
          }
        </div>
      </div>
    </div>
  );
};

export default SearchProfileComponent;