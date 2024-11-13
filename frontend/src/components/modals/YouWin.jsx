import React from 'react';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

const YouWin = ({ onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 9000);

    function winner_celebration() {
      let duration = 5 * 1000;
      let animationEnd = Date.now() + duration;
      let defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
      }

      let interval = setInterval(function () {
        let timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        let particleCount = 80 * (timeLeft / duration);
        // since particles fall down, start a bit higher than random
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
    winner_celebration();

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center">
      <div className="text-center">
        <h1 className="text-white font-semibold font-balsamiq text-4xl md:text-5xl">
          Congratulations You Win 🎉
        </h1>
        <p className="text-white font-normal font-open text-lg mt-4">
          Great job! You’ve earned this victory!
        </p>
        <button
          onClick={onClose}
          className=" cursor-pointer bg-white text-black font-semibold font-open px-4 py-2 mt-4 rounded-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default YouWin;
