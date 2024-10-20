"use client";

import { getData } from '@/services/apiCalls';
import { useState } from 'react';
import Link from 'next/link';

const listOfAllPages = [
	"/",
	"about",
	"allusers",
	"friends",
	"profile",
	"play"
]

const SearchedItem = ({ result, isSearchPage }) => {
  console.log("result:", result);
  return (
    isSearchPage ? (
      <Link 
        href={`/${result.link}`} 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-100 transition-colors duration-200 rounded-lg shadow-sm bg-white w-full max-w-md text-black"
      >
        <span className="text-blue-600 hover:underline truncate">{result.link}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </Link>
    ) : (
      <Link href={`/${result.username}`}>
        <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-100 transition-colors duration-200 rounded-lg shadow-sm bg-white w-full max-w-md">
          <div className="flex items-center space-x-4">
            <img
              src={result.avatar}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border border-gray-200"
            />
            <span className="font-medium text-gray-800 text-sm">{result.username}</span>
          </div>
          <div className="text-xs bg-blue-100 text-blue-800 py-1 px-3 rounded-full font-medium">
            In Tournament
          </div>
        </div>
      </Link>
    )
  );
};

const SearchProfileComponent = () => {
	const [searchTerm, setSearchTerm] = useState('');
	const [loading, setLoading] = useState(false);
	const [results, setResults] = useState({});
	const [isSearchPage, setIsSearchPage] = useState(false);

	const handleSearch = async (e) => {
		e.preventDefault();
		const searchedValue = e.target.value;
		setSearchTerm(searchedValue);

		if (searchedValue.trim() == '') {
			setLoading(false);
			return;
		}


		//test
		const performSearch = (searchedValue) => {
			const matchedPages = listOfAllPages.filter(page => 
				page.toLowerCase().startsWith(searchedValue.toLowerCase())
			);

			if (matchedPages.length > 0) {
				console.log("Matched pages:", matchedPages);
				setLoading(true);
				setIsSearchPage(true);
				setResults(matchedPages.map(page => ({ link: page })));
			} else {
				// Handle case when no matches are found
				// You might want to search for users or show a "no results" message
				console.log("No matching pages found");
				setIsSearchPage(false);
				// Perform your regular search logic here
			}
		};
		//test
		performSearch(searchedValue);
		//here two options: search for users or search for pages
		if (listOfAllPages.includes(searchedValue)) {
			//display link of the searched page
			console.log("searchedValue:", searchedValue);
			setLoading(true);
			setIsSearchPage(true);
			setResults([{link: searchedValue}]);
		} else {
			setIsSearchPage(false);
			try {
					const response = await getData(`/searchItems/${searchedValue}`);
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
	};

	return (
		<div>
			<div className="relative">
				<div className="relative max-w-96 w-96">
					<div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
						<svg
						className="w-4 h-4 text-gray-500 dark:text-gray-400"
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
						className="block w-full max-w-96 p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 outline-none"
						placeholder="Search for profiles, tournaments, pages..."
						value={searchTerm}
						onChange={
							(e) => {
								handleSearch(e);
							}
						}
					/>

					{/* Results of Search */}
					<div className="absolute top-14 bg-white z-40">
						{/* {loading && <SearchedItem results={results} />} */}
						{loading && results.length > 0 && results.map((result, index) => (
							<SearchedItem key={index} result={result} isSearchPage={isSearchPage} />
						))}
					</div>

				</div>
			</div>
		</div>
	);
};

export default SearchProfileComponent;

