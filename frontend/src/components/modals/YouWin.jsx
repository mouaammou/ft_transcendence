import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
// import Confetti from 'react-confetti'
import { useRouter } from 'next/navigation';




const YouWin = ({ onClose }) => {
  const intervalRef = useRef(null);
  const animationPlayed = useRef(false);

  // Function to generate random values
  const randomInRange = (min, max) => {
    return Math.random() * (max - min) + min;
  };

  // Function for the confetti celebration
  const winnerCelebration = () => {
    if (animationPlayed.current) return;
    animationPlayed.current = true;

    const duration = 6000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60 };

    intervalRef.current = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(intervalRef.current);
        confetti.reset();
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
  };

  useEffect(() => {
    winnerCelebration();
    
    const timer = setTimeout(() => {
      handleClose();
    }, 12000);

    return () => {
      clearTimeout(timer);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        confetti.reset();
      }
    };
  }, []);

  const handleClose = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      confetti.reset();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center">
      <div className="text-center">
      {/* <Confetti
      width={2000}
      height={2000}
    /> */}
        <h1 className="text-white font-semibold font-balsamiq text-4xl md:text-5xl">
          <span className='pr-2 text-green-400'></span>Congratulations You Win 🎉
        </h1>
        <p className="text-white font-normal font-open text-lg mt-4">
          Great job! You've earned this victory!
        </p>
        <button
          onClick={handleClose}
          className="cursor-pointer bg-white text-black font-semibold font-open px-4 py-2 mt-4 rounded-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default YouWin;