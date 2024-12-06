import React, { useEffect } from "react";

const YouLose = ({ onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 15000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center">
      <div className="text-center">
        <h1 className="text-white font-semibold font-balsamiq text-4xl md:text-5xl">
          Better luck next time! 👍
        </h1>
        <p className="text-white font-normal font-open text-lg mt-4">
          Remember every game is a step to improve!
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

export default YouLose;