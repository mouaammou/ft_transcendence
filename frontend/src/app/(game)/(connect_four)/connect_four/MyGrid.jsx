import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from '@/styles/game/connect_four/MyGrid.module.css'
import { useConnectFourWebSocket } from '@/utils/FourGameWebSocketManager';
import './mypage.css'


const MyGrid = () => {
    const { sendMessage, isConnected, lastMessage } = useConnectFourWebSocket();
    const [circleColor, setCircleColor] = useState(Array(42).fill('#1C4E8E'));
    const [yourTurn, setYourTurn] = useState(null);
    const [winner, setWinner] = useState(null);
    const [locator, setLocator] = useState(350);
    const gridRef = useRef(null);
    const [timer, setTimer] = useState(20);

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

        return () => {
            if (gridElement) {
                gridElement.removeEventListener('mousemove', handleMouseMove);
            }
            if (isConnected)
                sendMessage(JSON.stringify({ type: 'LEAVE_GAME' }));
        };
    }, []);


    // Handle incoming WebSocket messages
    useEffect(() => {
        if (lastMessage) {
            try {
                const data = JSON.parse(lastMessage.data);

                switch (data.status) {
                    case 'GAME_DATA':
                        // setPlayerId(data.your_id);
                        setYourTurn(data.your_turn);
                        setTimer(data.timer);
                        break;
                    case 'MOVE_MADE':
                        const newCircleColor = [...circleColor];
                        newCircleColor[data.position] = data.player_id === data.player1_id ? '#BD3B57' : '#FFCE67';
                        setCircleColor(newCircleColor);
                        setYourTurn(data.your_turn);
                        // setTimer(30);
                        break;
                    case 'TIMER_UPDATE':

                        setTimer(data.time);
                        break;
                    case 'WINNER':
                        celebration(data.winner_color);
                        break;
                    case 'TURN_CHANGE':

                        setYourTurn(data.current_turn);
                        break;
                }
            } catch (error) {

            }
        }
    }, [lastMessage]);

    // Request game data when connected
    useEffect(() => {
        if (isConnected) {
            sendMessage(JSON.stringify({ type: 'GET_CONNECT_FOUR_DATA' }));
        }
    }, [isConnected]);

    function celebration(color) {
        if (color !== 'draw') {
            if (color === '#BD3B57') {
                if (isConnected)
                    sendMessage(JSON.stringify({ type: 'WIN', player: 'player1' }));
            }
            else {
                if (isConnected)
                    sendMessage(JSON.stringify({ type: 'WIN', player: 'player2' }));
            }
        }
        else {
            if (isConnected)
                sendMessage(JSON.stringify({ type: 'DRAW' }));
        }
    }


    const handleClick = (index) => {
        let column = index % 7;
        if (isConnected) {
            sendMessage(JSON.stringify({
                type: 'MAKE_MOVE',
                column: column
            }));
        }
    };

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
                setTimeout(() => {
                    markWinningDiscs([index, index + 1, index + 2, index + 3]);
                }, 500);
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
                setTimeout(() => {
                    markWinningDiscs([index, index + 7, index + 14, index + 21]);
                }, 500);
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
                setTimeout(() => {
                    markWinningDiscs([index, index + 8, index + 16, index + 24]);
                }, 500);
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
                setTimeout(() => {
                    markWinningDiscs([index, index + 6, index + 12, index + 18]);
                }, 500);
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
        const winningColor = circleColor[indices[0]];

        indices.forEach((index) => {
            // Apply winning styles
            newCircleColor[index] = winningColor;

            // Find the disc element
            const discElement = document.querySelector(`.${styles.cell}:nth-child(${index + 1}) .${styles.disc}`);

            if (discElement) {
                // Add flash animation class
                discElement.style.animation = 'flash 1s infinite';

                // Create inner white circle
                const innerCircle = document.createElement('div');
                innerCircle.style.cssText = `
                    position: absolute;
                    top: 45%;
                    left: 45%;
                    width: 70%;
                    height: 70%;
                    background-color: #EAE6E6;
                    border-radius: 50%;
                    z-index: 99;
                    animation: innerCircleFadeIn 0.5s forwards;
                `;

                // Remove any existing inner circle before adding new one
                const existingInnerCircle = discElement.querySelector('.inner-circle');
                if (existingInnerCircle) {
                    existingInnerCircle.remove();
                }
                innerCircle.classList.add('inner-circle');
                discElement.appendChild(innerCircle);
            }
        });

        setCircleColor(newCircleColor);
    }

    const discVariants = {
        hidden: (custom) => {
            const isMobileView = window.innerWidth < 768;
            const isTabletView = window.innerWidth < 1024;
            const rowHeight = isTabletView ? (isMobileView ? 42 : 62) : 72;
            return {
                y: -custom * rowHeight,
                x: 0,
                opacity: 1,
            };
        },
        visible: {
            y: -1,
            x: -2,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 50,
            },
        },
    };

    return (
        <div className="relative flex flex-col gap-[20px] md:gap-[30px] items-center">
            <div style={{ left: locator }}
                className={`absolute  lg:w-7 lg:h-8 w-3 h-4 hidden custom-lg-block md:w-5 md:h-6 rounded-sm rounded-bl-3xl
                 rounded-br-3xl border-black animate-bounce ${yourTurn == 'red' ? 'bg-[#BD3B57]' : 'bg-[#FFCE67]'}`}>
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
                        </div>
                    ))}
                </div>
            </div>
            <div className={styles.turnIndicator} style={{ backgroundColor: yourTurn === 'red' ? '#BD3B57' : '#FFCE67' }}>
                <p>{yourTurn === 'red' ? <span>Red</span> : <span>Yellow</span>} Turn</p>
                <p className={styles.timer}>{timer} s</p>
            </div>
        </div>
    );
}

export default MyGrid;


