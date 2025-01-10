import React from 'react';

const Moijlkm = ({ isOpen, message, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-gray-100 p-4 rounded shadow-lg flex justify-center items-center flex-col">
        <p className="text-black">{message}</p>
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded ">
          Close
        </button>
      </div>
    </div>
  );
};

export default Moijlkm;
