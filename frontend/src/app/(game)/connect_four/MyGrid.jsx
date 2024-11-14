import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from './MyGrid.module.css'

const MyGrid = () => {
    const [circleColor, setCircleColor] = useState(Array(42).fill('#1C4E8E'));
    const [yourTurn, setYourTurn] = useState(true);
    const [winner, setWinner] = useState(null);
    const [isWin, setIsWin] = useState(false);

    function celebration(color) {
        // setCircleColor(Array(42).fill('#1C4E8E'));
        if (color !== 'draw')
            setTimeout(() => alert(`Congratulations ${color} player wins`), 2000)
        else
            setTimeout(() => alert(`drawwwwwwwww`), 2000)
        setCircleColor(circleColor);
        setWinner(null);
    }

    useEffect(() => {
        if (winner) {
            celebration(winner);
        }
    }, [isWin]);


    useEffect(() => {
        checkForWinner();

    }, [circleColor]);

    function checkForWinner() {
        for (let j = 0; j < 42; j += 7) {
            for (let i = j; i <= j + 3; i++) {
                if (circleColor[i] !== '#1C4E8E' 
                && circleColor[i] === circleColor[i + 1] 
                && circleColor[i] === circleColor[i + 2] 
                && circleColor[i] === circleColor[i + 3]) {
                    circleColor[i] = 'green';
                    circleColor[i + 1] = 'green';
                    circleColor[i + 2] = 'green';
                    circleColor[i + 3] = 'green';
                    // setCircleColor(circleColor);
                    setWinner(circleColor[i]);
                    setIsWin(true);
                    console.log("win in 1")
                    return;
                }
            }
        }
        for (let j = 0; j < 21; j++) {
            if (j + 21 < 42 && circleColor[j] !== '#1C4E8E' && circleColor[j] === circleColor[j + 7] && circleColor[j] === circleColor[j + 14] && circleColor[j] === circleColor[j + 21]) {
                setWinner(circleColor[j]);
                setIsWin(true);
                circleColor[j] = 'green';
                circleColor[j + 7] = 'green';
                circleColor[j + 14] = 'green';
                circleColor[j + 21] = 'green';
                setCircleColor(circleColor);

                console.log("win in 2")
                return;
            }
        }
        for (let j = 0; j < 18; j++) {
            if (j % 7 <= 3 && circleColor[j] !== '#1C4E8E' 
            && circleColor[j] === circleColor[j + 8] 
            && circleColor[j] === circleColor[j + 16] 
            && circleColor[j] === circleColor[j + 24]) {
                const newCircleColor = [...circleColor];
                newCircleColor[j] = 'green';
                newCircleColor[j + 8] = 'green';
                newCircleColor[j + 16] = 'green';
                newCircleColor[j + 24] = 'green';
                setCircleColor(newCircleColor);
                setWinner(circleColor[j]);
                setIsWin(true);
                console.log("win in 3");
                return;
            }
        }
        for (let j = 3; j <= 20; j++) {
            if (j % 7 >= 3 && circleColor[j] !== '#1C4E8E' &&
                circleColor[j] === circleColor[j + 6] &&
                circleColor[j] === circleColor[j + 12] && 
                circleColor[j] === circleColor[j + 18]) {

                    setWinner(circleColor[j]);
                    setIsWin(true);
                    circleColor[j] = 'green';
                    circleColor[j + 6] = 'green';
                    circleColor[j + 12] = 'green';
                    circleColor[j + 18] = 'green';
                    setCircleColor(circleColor);

                    console.log("win in 4")
                    return;
            }
        }
        if (circleColor.every(color => color !== '#1C4E8E')) {
            setWinner('draw');
        }
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
                // bounce: 10, // Add bounce effect
            },
        },
    };

    return (
    <div className={styles.mohamed}>
        <div className={styles.gridWrapper}>
            <div className={styles.gridImage}>
                <img src="Exclude.svg" alt="walo" />
            </div>
            <div className={styles.gridMobileImage}>
                <img src="asdf.svg"  alt="wdsf"/>
            </div>         
            <div className={styles.gridMediumImage}>
                <img src="medium.svg"  alt="wdsf"/>
            </div>         
            {/* <div className={styles.locator}>
                maybe add a locator tracking the mouse later
            </div> */}
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
            <p className={styles.timer}>30 s</p>
        </div>
    </div>
    );
}

export default MyGrid;
