import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from './MyGrid.module.css'

const MyGrid = () => {
    const [circleColor, setCircleColor] = useState(Array(42).fill('#1C4E8E'));
    const [yourTurn, setYourTurn] = useState(true);
    const [winner, setWinner] = useState(null);
    const [isWin, setIsWin] = useState(false);
    const [locator, setLocator] = useState(0);
    const gridRef = useRef(null);
    const [timer, setTimer] = useState(30);

    useEffect(() => {
        const handleMouseMove = (event) => {
            if (gridRef.current) {
                const imageElement = gridRef.current.querySelector('img');
                if (imageElement) {
                    const imageRect = imageElement.getBoundingClientRect();
                    const x = event.clientX - imageRect.left + 70;
                    if (x >= 90 && x <= imageRect.width + 30) {
                        setLocator(x);
                    }
                }
            }
        };

        const gridElement = gridRef.current;
        if (gridElement) {
            gridElement.addEventListener('mousemove', handleMouseMove);
        }

        const interval = setInterval(() => {
            setTimer((prevTimer) => {
                if (prevTimer === 1) {
                    setYourTurn(!yourTurn);
                    return 30;
                }
                return prevTimer - 1;
            });
        }, 1000);

        return () => {
            if (gridElement) {
                gridElement.removeEventListener('mousemove', handleMouseMove);
            }
            clearInterval(interval);
        };
    }, [yourTurn]);

    function celebration(color) {
        if (color !== 'draw')
            setTimeout(() => alert(`Congratulations ${color} player wins`), 1000)
        else
            setTimeout(() => alert(`drawwwwwwwww`), 1000)
        setCircleColor(circleColor);
    }

    useEffect(() => {
        checkForWinner();
        if (winner) {
            celebration(winner);
        }
    }, [yourTurn, winner]);

    function checkForWinner() {
        let winFound = false;
    
        for (let index = 0; index < 42; index++) {
            // Horizontal win
            if (
                index % 7 < 4 &&
                circleColor[index] !== '#1C4E8E' &&
                circleColor[index] === circleColor[index + 1] &&
                circleColor[index] === circleColor[index + 2] &&
                circleColor[index] === circleColor[index + 3]
            ) {
                setWinner(circleColor[index]);
                markWinningDiscs([index, index + 1, index + 2, index + 3]);
                winFound = true;
                break;
            }
    
            // Vertical win
            if (
                index < 21 &&
                circleColor[index] !== '#1C4E8E' &&
                circleColor[index] === circleColor[index + 7] &&
                circleColor[index] === circleColor[index + 14] &&
                circleColor[index] === circleColor[index + 21]
            ) {
                setWinner(circleColor[index]);
                markWinningDiscs([index, index + 7, index + 14, index + 21]);
                winFound = true;
                break;
            }
    
            // Diagonal win (bottom-right)
            if (
                index % 7 < 4 &&
                index < 18 &&
                circleColor[index] !== '#1C4E8E' &&
                circleColor[index] === circleColor[index + 8] &&
                circleColor[index] === circleColor[index + 16] &&
                circleColor[index] === circleColor[index + 24]
            ) {
                setWinner(circleColor[index]);
                markWinningDiscs([index, index + 8, index + 16, index + 24]);
                winFound = true;
                break;
            }
    
            // Diagonal win (bottom-left)
            if (
                index % 7 >= 3 &&
                index < 21 &&
                circleColor[index] !== '#1C4E8E' &&
                circleColor[index] === circleColor[index + 6] &&
                circleColor[index] === circleColor[index + 12] &&
                circleColor[index] === circleColor[index + 18]
            ) {
                setWinner(circleColor[index]);
                markWinningDiscs([index, index + 6, index + 12, index + 18]);
                winFound = true;
                break;
            }
        }
    
        // Check for draw
        if (!winFound && circleColor.every((color) => color !== '#1C4E8E')) {
            setWinner('draw');
        }
    }
    
    function markWinningDiscs(indices) {
        const newCircleColor = [...circleColor];
        indices.forEach((index) => {
            newCircleColor[index] = 'green';
        });
        setCircleColor(newCircleColor);
    }

    const handleClick = (index) => {
        let column = index % 7;
        let row = 5;

        while (row >= 0) {
            index = row * 7 + column;
            if (circleColor[index] === '#1C4E8E') {
                const newCircleColor = [...circleColor];
                newCircleColor[index] = yourTurn ? '#BD3B57' : '#FFCE67';
                setCircleColor(newCircleColor);
                setYourTurn(!yourTurn);
                setTimer(30); // Reset the timer when a move is made
                return;
            }
            row--;
        }
    };

    const discVariants = {
        hidden: (custom) => ({
            y: -custom * 72,
            x: 0,
            opacity: 1,
        }),
        visible: {
            y: -1,
            x: -2,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 50,
                damping: 13,
            },
        },
    };

    return (
        <div className="relative flex flex-col gap-[20px] md:gap-[30px] items-center">
            <div style={{left: locator}} 
                className={`absolute  lg:w-7 lg:h-8 w-3 h-4 hidden lg:block md:w-5 md:h-6 rounded-sm rounded-bl-3xl rounded-br-3xl border-black animate-bounce ${yourTurn? 'bg-[#BD3B57]':'bg-[#FFCE67]'}`}>
            </div>
            <div ref={gridRef} className={styles.gridWrapper} >
                <div className={styles.gridImage}>
                    <img src="Exclude.svg" alt="walo" />
                </div>
                <div className={styles.gridMobileImage}>
                    <img src="asdf.svg" alt="wdsf" />
                </div>
                <div className={styles.gridMediumImage}>
                    <img src="medium.svg" alt="wdsf" />
                </div>
                <div className={styles.grid}>
                    {Array.from({ length: 42 }).map((_, index) => (
                        <div
                            onClick={() => handleClick(index)}
                            key={index}
                            className={styles.cell}
                        >
                            <AnimatePresence>
                                {circleColor[index] !== '#1C4E8E' && (
                                    <motion.div
                                        key={index}
                                        custom={Math.floor(index / 7)}
                                        initial="hidden"
                                        animate="visible"
                                        variants={discVariants}
                                        style={{
                                            backgroundColor: circleColor[index],
                                            zIndex: -1,
                                        }}
                                        className={styles.disc}
                                    />
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
            <div className={styles.turnIndicator} style={{ backgroundColor: yourTurn ? '#BD3B57' : '#FFCE67' }}>
                <p>{yourTurn ? <span>Red</span> : <span>Yellow</span>} Turn</p>
                <p className={styles.timer}>{timer} s</p>
            </div>
        </div>
    );
}

export default MyGrid;