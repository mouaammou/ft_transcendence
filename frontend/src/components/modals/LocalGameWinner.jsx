import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { useRouter } from 'next/navigation';

const LocalGameWinner = ({ winner, reset, tournament_id=-1 }) => {
  const router = useRouter();
  const intervalRef = useRef(null);
  const animationPlayed = useRef(false); // To prevent multiple runs

  const onClose = () => {
    // () => setShowWinModal(false); // Close the modal when the user clicks close
    if (tournament_id !== -1) {
      router.push(`/tournament/${tournament_id}`); // Navigate to the tournament board
    } else {
        reset();
        router.push('/l_game'); // Navigate to the create/join tournament page
    }
  };

  // Function to generate random values
  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  // Function for the confetti celebration
  function winner_celebration() {
    if (animationPlayed.current) return; // Guard against re-runs
    animationPlayed.current = true; // Mark as played

    const duration = 6 * 1000; // 6 seconds
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60 };

    intervalRef.current = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(intervalRef.current); // Clear the interval when the animation ends
        confetti.reset(); // Reset confetti to stop it
        return;
      }

      const particleCount = 80 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  }

  useEffect(() => {
    // Start the timer for navigation after 9 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    // Run the celebration animation once on mount
    winner_celebration();

    // Cleanup function: clear both the timer and the interval
    return () => {
      clearTimeout(timer);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center">
      <div className="text-center">
        <h1 className="text-white font-semibold font-balsamiq text-4xl md:text-5xl">
           <span className='pr-2 text-green-400'></span>Congratulations <span className='text-green-400'>{winner}</span> You Win 🎉
        </h1>
        <p className="text-white font-normal font-open text-lg mt-4">
            {tournament_id !== -1 ?"Redirecting in 5 seconds...": "Resetting in 5 seconds..."}
        </p>
        <button
          onClick={onClose}
          className="cursor-pointer bg-white text-black font-semibold font-open px-4 py-2 mt-4 rounded-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default LocalGameWinner;