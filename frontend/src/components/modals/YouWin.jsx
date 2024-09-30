import React from "react";

const YouWin = ({onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center" onClick={onClose}>
            <div className="text-center">
                <h1 className="text-white font-semibold font-balsamiq text-4xl md:text-5xl">
                    Congratulations You Win 🎉
                </h1>
                <p className="text-white font-normal font-open text-lg mt-4">
                    Great job! You’ve earned this victory!
                </p>
            </div>
        </div>
    );
};

export default YouWin;