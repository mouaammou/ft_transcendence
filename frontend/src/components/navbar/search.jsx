"use client";

import { getData } from '@/services/apiCalls';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useDebounce } from 'use-debounce';

const SearchedItem = ({ result }) => {
	return (
		<Link href={`/${result.username}`}>
			<div className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-100 transition-colors duration-200 rounded-lg shadow-sm bg-white w-96">
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
};

const SearchProfileComponent = () => {
	const [searchTerm, setSearchTerm] = useState('');
	const [loading, setLoading] = useState(false);
	const [results, setResults] = useState({});
	const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

	const searchQuery = async() => {
		
		if (searchTerm.trim() == '') {
			setLoading(false);
			return;
		}

		try {
			const response = await getData(`/searchItems/${searchTerm}`);
			if (response.status === 200) {
				setLoading(true);
				setResults(response.data);

				setTimeout(() => {
					setResults({});
				}, 5000);

			} else {
				throw new Error('Profile not found');
			}
		} catch (err) {
			setLoading(false);
		}
	}

	useEffect(() => {
		if (searchTerm.trim() == '') {
			setResults({});
		}
		if (debouncedSearchTerm) {
			searchQuery();
		}
	}, [debouncedSearchTerm, searchTerm]);

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
						onChange={(e) => setSearchTerm(e.target.value)}
					/>

					{/* Results of Search */}
					<div className="absolute top-14 bg-white z-40">
						{/* {loading && <SearchedItem results={results} />} */}
						{loading && results.length > 0 && results.map((result, index) => (
							<SearchedItem key={index} result={result} />
						))}
					</div>

				</div>
			</div>
		</div>
	);
};

export default SearchProfileComponent;

