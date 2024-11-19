import React from 'react';
import styles from '@/Styles/game/connect_four/player_card.module.css';

const PlayerCard = ({ avatar, name, cardStyle }) => {
    return (
        <div className={styles.player}>
            <div className={cardStyle}>
                <img src={avatar} className={styles.playerAvatar} alt={`${name}'s avatar`} />
                <p className={styles.playerName}>{name}</p>
            </div>
        </div>
    );
};

export default PlayerCard;