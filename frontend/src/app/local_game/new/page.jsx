'use client';

import Link from 'next/link';
import { useState } from 'react';

const ChoseGame = () => {
  return (
    <div className="min-w-full min-h-full flex flex-col justify-center items-center mx-auto">
      <Link
        href={'/local_game/new'}
        className="bg-white text-black px-4 py-2 rounded-full font-bold font-mono hover:opacity-90 active:ring active:ring-white/50"
      >
        welcome
      </Link>
    </div>
  );
};

export default ChoseGame;
