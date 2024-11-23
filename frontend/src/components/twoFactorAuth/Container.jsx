import Link from 'next/link';
import { useState } from 'react';


const Container = ({onClick, className, children}) => {
    return (
        <div onClick={onClick} className="group relative w-fit h-fit p-[1px] cursor-pointer">
            <div className="absolute top-0 left-0 border-white border-t border-l w-2 h-2 pointer-events-none "></div>
            <div className="absolute top-0 right-0 border-white border-t border-r w-2 h-2 pointer-events-none "></div>
            <div className="absolute bottom-0 left-0 border-white border-b border-l w-2 h-2 pointer-events-none "></div>
            <div className="absolute bottom-0 right-0 border-white border-b border-r w-2 h-2 pointer-events-none "></div>
            <div className={`relative px-4 py-2 ${className}`}>{children}</div>
        </div>
    );
}

export default Container;