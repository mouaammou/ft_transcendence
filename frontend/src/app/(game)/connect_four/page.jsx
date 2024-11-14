"use client";
import { useEffect, useRef } from "react";
import MyGrid from "./MyGrid";
import Hoome from "./animation";
import styles from './connect_four.module.css';



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
                    <div className={styles.player}>
                        <div className={styles.player1Card}>
                            <img src="avatar3.jpeg" className={styles.playerAvatar} alt="" />
                            <p className={styles.playerName}>USER_1</p>
                        </div>
                    </div>
                    <div className={styles.gridContainer}>
                        <MyGrid />
                    </div>
                    <div className={styles.player}>
                        <div className={styles.player2Card}>
                            <img src="avatar4.jpeg" className={styles.playerAvatar} alt="" />
                            <p className={styles.playerName}>USER_2</p>
                        </div>
                    </div>
                </div>
                {/* <div className="flex bg-red-800 m-auto">Player's Turn</div> */}
            </div>
        );
}

export default ConnectFour;