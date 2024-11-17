'use client';
import { useState, useEffect, useRef } from "react";
import MyGrid from "./MyGrid";
import styles from './connect_four.module.css';
import PlayerCard from './PlayerCard';
import { getData } from '@/services/apiCalls'; // Assuming this exists
import { useConnectFourWebSocket } from '@/utils/FourGameWebSocketManager';


const ConnectFour = () => {
    const imgRef = useRef(null);
    const { sendMessage, isConnected, lastMessage } = useConnectFourWebSocket();

    const [player1, setPlayer1] = useState(null);
    const [player2, setPlayer2] = useState(null);
    const [dataFetched, setDataFetched] = useState(false);
  
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
        if (lastMessage !== null && !dataFetched) {
          const data = JSON.parse(lastMessage.data);
          if (data.status === 'GAME_DATA') {
            // Fetch player details
            fetchPlayerData(data.player_1, setPlayer1);
            fetchPlayerData(data.player_2, setPlayer2);
            setDataFetched(true); // Set dataFetched to true to prevent further fetching
          }
        }
      }, [lastMessage, dataFetched]);

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
        </div>
    );
};

export default ConnectFour;
