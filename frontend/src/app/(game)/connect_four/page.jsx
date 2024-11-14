"use client";
import { useEffect, useRef } from "react";
import MyGrid from "./MyGrid";
import styles from './connect_four.module.css';
import PlayerCard from './PlayerCard'



const ConnectFour = () => {

    const imgRef = useRef(null);

    useEffect(() => {
        const updateImage = () => {
            if (window.innerWidth >= 1560) {
                imgRef.current.src = 'BigGrid.svg'
            } else {
                imgRef.current.src = 'Subtract.svg'
            }
        }

        // window.addEventListener('resize', updateImage);
        // updateImage();

        return () => {
            // window.removeEventListener('resize', updateImage);
        }
    }, [])


    return (
        <div className={styles.container}>
            <div className={styles.playersContainer}>
                <PlayerCard
                    avatar="avatar3.jpeg"
                    name="USER_1"
                    cardStyle={styles.player1Card}
                />
                <div className={styles.gridContainer}>
                    <MyGrid />
                </div>
                <PlayerCard
                    avatar="avatar4.jpeg"
                    name="USER_2"
                    cardStyle={styles.player2Card}
                />
            </div>
            {/* <div className="flex bg-red-800 m-auto">Player's Turn</div> */}
        </div>
    );
}

export default ConnectFour;