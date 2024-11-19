'use client';
import YouLose from '@/components/modals/YouLose';
import YouWin from '@/components/modals/YouWin';
import { useState, useEffect, useRef } from "react";
import MyGrid from "./MyGrid";
import styles from './connect_four.module.css';
import PlayerCard from './PlayerCard';
import { getData } from '@/services/apiCalls'; // Assuming this exists
import { useConnectFourWebSocket } from '@/utils/FourGameWebSocketManager';
import { useRouter } from 'next/navigation';


const ConnectFour = () => {
    const imgRef = useRef(null);
    const { sendMessage, isConnected, lastMessage } = useConnectFourWebSocket();
    const [showWinModal, setShowWinModal] = useState(false);
    const [showLoseModal, setShowLoseModal] = useState(false);

    const [player1, setPlayer1] = useState(null);
    const [player2, setPlayer2] = useState(null);
    const [dataFetched, setDataFetched] = useState(false);

    const router = useRouter();


    const fetchPlayerData = async (playerId, setPlayer) => {
        try {
            const response = await getData(`/userById/${playerId}`);
            if (response.status === 200) {
                setPlayer(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch player data:', error);
        }
    };


    useEffect(() => {
        if (lastMessage !== null) {
            const data = JSON.parse(lastMessage.data);
            //   console.log("data from waiting page ", data);

            if (data.status === 'GAME_DATA' && !dataFetched) {
                // Fetch player details
                fetchPlayerData(data.player_1, setPlayer1);
                fetchPlayerData(data.player_2, setPlayer2);
                setDataFetched(true); // Set dataFetched to true to prevent further fetching
            }
            else if (data.status === 'NO_GAME_FOUND') {
                // Redirect to play page
                router.push('/play');
            } else if (data.status === 'WIN') {
                setShowWinModal(true);
            } else if (data.status === 'WINNER_BY_DISCONNECTION') {
                // inform the player that the opponent disconnected
                console.log('Opponent disconnected');
                router.push('/play');
                // setShowWinModal(true);
            } else if (data.status === 'LOSE') {
                setShowLoseModal(true);
            } else if (data.status === 'DISCONNECTED') {
                // inform the player that if he disconnects he will lose
                // router.push('/play');
                setShowLoseModal(true);
            } else if (data.status === 'DRAW') {
                // inform the player that the game is a draw
                
            } else if (data.status === 'NOT_YOUR_TURN') {
                // inform the player that it is not his turn
                 
            } else if (data.status === 'GAME_OVER') {
                // inform the player that the game is over
                let winner = data.winner;
                if (winner === data.player_1) {
                    setShowWinModal(true);
                } else {
                    setShowLoseModal(true);
                }
                // router.push('/play');
            }
        }
    }, [lastMessage]);

    useEffect(() => {
        sendMessage(JSON.stringify({ type: 'GET_CONNECT_FOUR_DATA' }));
    }, []);

    // useEffect(() => {
    //     const updateImage = () => {
    //         if (window.innerWidth >= 1560) {
    //             imgRef.current.src = 'BigGrid.svg';
    //         } else {
    //             imgRef.current.src = 'Subtract.svg';
    //         }
    //     };

    //     updateImage(); // Call on mount
    //     window.addEventListener('resize', updateImage);

    //     return () => window.removeEventListener('resize', updateImage); // Cleanup on unmount
    // }, []);

    return (
        <div className={styles.container}>
            <div className={styles.playersContainer}>
                {/* Player 1 */}
                <PlayerCard
                    avatar={player1?.avatar || "avatar3.jpeg"} // Fallback avatar
                    name={player1?.username || "Player 1"} // Fallback name
                    cardStyle={styles.player1Card}
                />

                {/* Game Grid */}
                <div className={styles.gridContainer}>
                    <MyGrid />
                </div>

                {/* Player 2 */}
                <PlayerCard
                    avatar={player2?.avatar || "avatar4.jpeg"} // Fallback avatar
                    name={player2?.username || "Player 2"} // Fallback name
                    cardStyle={styles.player2Card}
                />
            </div>
            {showWinModal && (
                <YouWin
                    onClose={() => {
                        setShowWinModal(false);
                        router.push('/play');
                    }
                    }
                // stats={{ score1, score2 }} // Pass stats as needed
                />
            )}

            {showLoseModal && (
                <YouLose
                    onClose={() => {
                        setShowLoseModal(false);
                        router.push('/play');
                    }
                    }
                // stats={{ score1, score2 }} // Pass stats as needed
                />
            )}
        </div>
    );
};

export default ConnectFour;
