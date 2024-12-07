import React from 'react';
// import { Meteors } from "../ui/meteors";

export function Modal({ isOpen, title, description, action }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 " style={{ zIndex: '100'}}>
      <div className=" w-full relative max-w-xs">
        {/* <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-blue-500 to-teal-500 transform scale-[0.80] bg-red-500 rounded-full blur-3xl" /> */}
        <div className="relative shadow-xl bg-gray-900 border border-gray-800  px-4 py-8 w-fit h-full overflow-hidden rounded-2xl flex flex-col justify-end items-start">
          <h1 className="font-bold text-xl text-white mb-4 relative z-50">{title}</h1>

          <p className="font-normal text-base break-words text-slate-500 mb-4 relative z-50">{description}</p>

          <button
            onClick={action}
            className="border px-4 py-1 rounded-lg  border-gray-500 hover:bg-gray-800 text-gray-300 transform transition-all duration-300 hover:scale-105 "
          >
            Close
          </button>

          {/* Meaty part - Meteor effect */}
          {/* <Meteors number={20} /> */}
        </div>
      </div>
    </div>
  );
}

export default Modal;
