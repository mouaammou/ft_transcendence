"use client";
import { useEffect, useRef } from "react";
import MyGrid from "./MyGrid";
import styles from '@/styles/game/connect_four/connect_four.module.css';
import PlayerCard from './PlayerCard'
import { useAuth } from '@/components/auth/loginContext.jsx';


const ConnectFour = () => {
    const imgRef = useRef(null);
    const { profileData: user_data } = useAuth();

    return (
        <div className={styles.container}>
            <div className={styles.playersContainer}>
                <PlayerCard
                    avatar={user_data?.avatar || 'avatar3.jpeg'}
                    name={user_data?.username || 'USER_1'}
                    cardStyle={styles.player1Card}
                />
                <div className={styles.gridContainer}>
                    <MyGrid username={user_data?.username}/>
                </div>
                <PlayerCard
                    avatar="defaultAvatar.svg"
                    name="MyFriend"
                    cardStyle={styles.player2Card}
                />
            </div>

        </div>
    );
}

export default ConnectFour;