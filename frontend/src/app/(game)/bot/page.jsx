'use client';
import { useState } from 'react';
import CountdownTimer from '@/components/countDown/CountDown.jsx';
import Image from 'next/image';
import style from '@/Styles/game/game.module.css';
import { useAuth } from '@/components/auth/loginContext.jsx';
import PongBot from './BotGame';

const GamePage = () => {
  const { profileData: user_data } = useAuth();
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);


  return (
    <div className={style.game}>
      <div className={style.up_section}>
        <div className={style.left_score}>{score2}</div>
        <div className={style.vs_section}>
          <div className={style.vs_image}>
            <Image src="/vs.svg" alt="vs" priority className={style.vs_image} width={70} height={70} />
          </div>
          <CountdownTimer />
        </div>
        <div className={style.right_score}>{score1}</div>
      </div>
      <div className={style.down_section}>
          <div className={style.left_user}>
            <img // i have to resolve the issue with <Image/>
              className={style.left_user_img}
              src={user_data.avatar}
              alt="user1"
              width={100}
              height={100}
            />
            <div className={style.left_user_name}>{user_data.username}</div>
          </div>
        <div className={style.self_game}>
          <PongBot score1={score1} score2={score2} setScore1={setScore1} setScore2={setScore2} />
        </div>
        <div className={style.right_user}>
          <Image className={style.right_user_img} src="/bot.png" alt="user1" width={100} height={100} />
          <div className={style.right_user_name}>Bot</div>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
