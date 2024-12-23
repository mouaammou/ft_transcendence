import { useState } from 'react';

const DropDown = ({filterKeyword, filterKeywords, setFilterKeyword, setCurrentPage}) => {
    const [dropdown, setDropdown] = useState(false);
    const toggleDropdown = () => {
        setDropdown(!dropdown); // Toggle the dropdown visibility
    };
    const closeDropdown = () => {
        setDropdown(false);
    };

    const handleFilter = (keyword) => {
        setFilterKeyword(keyword);
        setCurrentPage(1); // Reset pagination
        setDropdown(false);
    }

    return (
        <div 
            className={`max-w-96 w-full relative z-50 inline-flex`}
            onMouseLeave={closeDropdown}>
            <button
                onClick={toggleDropdown} // Toggle visibility
                type="button"
                // className="justify-center w-full py-2 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-full border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                className="justify-center w-full min-w-[150px] inline-flex items-center gap-x-2 custom-button truncate"
                aria-haspopup="menu"
                aria-expanded={dropdown ? 'true' : 'false'}
                // onBlur={closeDropdown}
            >
                {filterKeyword}
                <svg
                    className={`transition-transform duration-200 ${dropdown ? 'rotate-180' : ''}`}
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </button>

            {/* Dropdown Menu */}
            <div
                className={`absolute right-0 mt-3 w-full bg-white shadow-md rounded-lg z-10 transition-opacity duration-300 ${
                    dropdown ? 'opacity-100' : 'opacity-0 pointer-events-none'

                }`}
                role="menu"
                aria-orientation="vertical"
            >
                <div className="p-1 space-y-0.5">

                    {filterKeywords.map((keyword) => (
                        <button
                            key={keyword}
                            onClick={() => handleFilter(keyword)}
                            className="flex items-center gap-x-3.5 py-2 px-3 w-full text-start truncate rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:outline-none"
                        >
                            {keyword}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
};

export default DropDown;