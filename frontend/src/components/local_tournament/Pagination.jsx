
const Pagination = ({ currentPage, onPageChange, prevPage, nextPage, totalPages }) => {
    const handleNext = () => {
        if (nextPage !== null) {
            onPageChange(currentPage + 1);
        }
    };

    const handlePrevious = () => {
        if (prevPage !== null) {
            onPageChange(currentPage - 1);
        }
    };

    return (
        <nav className="flex justify-center items-center gap-x-1" aria-label="Pagination">
            <button className="min-h-[38px] min-w-[38px] py-2 px-2.5 inline-flex justify-center items-center gap-x-2  text-sm rounded-lg text-white/80 hover:bg-white/30 focus:outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:hover:bg-white/10 dark:focus:bg-white/10" aria-label="Previous"
                onClick={handlePrevious} disabled={prevPage === null}
            >
                <svg className="shrink-0 size-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6"></path>
                </svg>
                <span className="sr-only">Previous</span>
            </button>
            <div className="flex items-center gap-x-1">
                <span className="min-h-[38px] min-w-[38px] flex justify-center items-center bg-white/10 text-white py-2 px-3 text-sm rounded-full focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none">{currentPage}</span>
                <span className="min-h-[38px] flex justify-center items-center text-white/50 py-2 px-1.5 text-sm">of</span>
                <span className="min-h-[38px] flex justify-center items-center text-white/50 py-2 px-1.5 text-sm">{totalPages}</span>
            </div>
            <button className="min-h-[38px] min-w-[38px] py-2 px-2.5 inline-flex justify-center items-center gap-x-2 text-sm rounded-lg text-white/80 hover:bg-white/30 focus:outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none " aria-label="Next"
                onClick={handleNext} disabled={nextPage === null}
            >
                <span className="sr-only">Next</span>
                <svg className="shrink-0 size-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6"></path>
                </svg>
            </button>
        </nav>
    );
};

export default Pagination;
