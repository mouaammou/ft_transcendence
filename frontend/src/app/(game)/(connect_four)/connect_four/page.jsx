'use client';

import { useState, useEffect, useRef } from "react";
import MyGrid from "./MyGrid";
import styles from '@/Styles/game/connect_four/connect_four.module.css';
import PlayerCard from './PlayerCard';
import { getData } from '@/services/apiCalls'; // Assuming this exists
import { useConnectFourWebSocket } from '@/utils/FourGameWebSocketManager';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/modals/Modal';


const ConnectFour = () => {
    const imgRef = useRef(null);
    const { sendMessage, isConnected, lastMessage } = useConnectFourWebSocket();

    const [player1, setPlayer1] = useState(null);
    const [player2, setPlayer2] = useState(null);
    const [dataFetched, setDataFetched] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [msgDescription, setMsgDescription] = useState('');
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
              console.log("data from waiting page ", data);

            if (data.status === 'GAME_DATA' && !dataFetched) {
                // Fetch player details
                fetchPlayerData(data.player_1, setPlayer1);
                fetchPlayerData(data.player_2, setPlayer2);
                setDataFetched(true); // Set dataFetched to true to prevent further fetching
            }
            else if (data.status === 'NO_GAME_FOUND') {
                // Redirect to play page
                router.push('/play');
            } else if (data.status === 'WINNER_BY_DISCONNECTION') {
                setModalOpen(true);
                setModalMessage('Game over!');
                setMsgDescription('Because your opponent disconnect from the game, you considered the winner, congrats  🎉🎉🎉');
            } else if (data.status === 'DISCONNECTED') {
                setModalOpen(true);
                setModalMessage('Game over!');
                setMsgDescription('if you refresh the page or change you location, the game ends and you lose!!');
            } else if (data.status === 'DRAW') {
                // inform the player that the game is a draw
                setModalOpen(true);
                setModalMessage('Game over!');
                setMsgDescription("The game has ended in a draw, which means both players showed incredible skill and\
                 strategy! It's a testament to your abilities, but don't be discouraged. Better luck next time! Keep practicing, and you'll come back even stronger!");

            } else if (data.status === 'NOT_YOUR_TURN') {
                // inform the player that it is not his turn

            } else if (data.status === 'GAME_OVER') {
                // inform the player that the game is over
                let winner = data.winner;
                // setShowWinModal(true);
                if (winner == player1.id) {
                    setMsgDescription(`🎉 Congratulations to ${player1.username} 🎉 Thanks for playing!
                    Looking forward to the next game!`);
                    setModalMessage(`Game over!, ${player1.username} wins!`);
                } else {
                    setMsgDescription(`🎉 Congratulations to ${player2.username} 🎉 Thanks for playing!
                    Looking forward to the next game!`);
                    setModalMessage(`Game over!, ${player2.username} wins!`);
                }
                setTimeout(() => {
                    setModalOpen(true);//🍀
                },3000)
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
            
            <Modal
                isOpen={modalOpen}
                title={modalMessage}
                description={msgDescription}
                action={() => {
                    setModalOpen(false);
                    router.push('/connect_four_mode');
                }}
            />
        </div>
    );
};

export default ConnectFour;
