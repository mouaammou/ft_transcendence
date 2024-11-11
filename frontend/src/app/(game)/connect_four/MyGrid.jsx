import { useEffect, useState } from "react";

const MyGrid = () => {
    const [circleColor, setCircleColor] = useState(Array(42).fill('#1C4E8E'));
    const [yourTurn, setYourTurn] = useState(true);
    const [winner, setWinner] = useState(null);

    function celebration(color) {
        setCircleColor(Array(42).fill('#1C4E8E'));
        alert(`Congratulations ${color} player wins`);
    }

    useEffect(() => {
        if (winner) {
            celebration(winner);
        }
    }, [winner]);

    function checkForWinner() {
        for (let j = 0; j < 42; j += 7) {
            for (let i = j; i <= j + 3; i++) {
                if (circleColor[i] !== '#1C4E8E' 
                && circleColor[i] === circleColor[i + 1] 
                && circleColor[i] === circleColor[i + 2] 
                && circleColor[i] === circleColor[i + 3]) {
                    setWinner(circleColor[i]);
                    return;
                }
            }
        }
        for (let j = 0; j < 21; j++) {
            if (j + 21 < 42 && circleColor[j] !== '#1C4E8E' && circleColor[j] === circleColor[j + 7] && circleColor[j] === circleColor[j + 14] && circleColor[j] === circleColor[j + 21]) {
                setWinner(circleColor[j]);
                return;
            }
        }
        for (let j = 0; j < 18; j++) {
            if (j + 24 < 42 && circleColor[j] !== '#1C4E8E' && circleColor[j] === circleColor[j + 8] && circleColor[j] === circleColor[j + 16] && circleColor[j] === circleColor[j + 24]) {
                setWinner(circleColor[j]);
                return;
            }
        }
        for (let j = 3; j <= 20; j++) {
            if (j + 18 < 42 && circleColor[j] !== '#1C4E8E' && circleColor[j] === circleColor[j + 6] && circleColor[j] === circleColor[j + 12] && circleColor[j] === circleColor[j + 18]) {
                setWinner(circleColor[j]);
                return;
            }
        }
    }

    const handleClick = (index) => {
        let column = index % 7;
        let row = 5;

        while (row >= 0) {
            index = row * 7 + column;
            if (circleColor[index] === '#1C4E8E') {
                const newColors = [...circleColor];
                newColors[index] = yourTurn ? 'red' : 'yellow';
                setCircleColor(newColors);
                setYourTurn(!yourTurn);
                break;
            }
            row--;
        }
    }

    useEffect(() => {
        checkForWinner();
    }, [circleColor]);

    return (
        <>
            <div className="grid grid-cols-7 grid-rows-6 gap-3 max-w-[1000px] bg-[#E6E6E6] p-5 rounded-lg mx-24 ">
                {Array.from({ length: 42 }).map((_, index) => (
                    <div onClick={() => handleClick(index)}
                        key={index}
                        className="w-16 h-[60px] bg-transparent border-2 border-black bg-[#1C4E8E] cursor-pointer rounded-full"
                        style={{ backgroundColor: circleColor[index] }}
                    ></div>
                ))}
            </div>
            <div className={`w-fit m-auto mt-4 ${yourTurn ? `bg-red-500` : 'bg-yellow-500'} `}> 
            {
                 yourTurn?
                    <span>Red</span>
                :
                    <span>Yellow</span>
            }
            Turn</div>
        </>
    );
}

export default MyGrid;