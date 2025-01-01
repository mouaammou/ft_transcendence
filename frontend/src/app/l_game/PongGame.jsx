// import { useClient } from 'next/client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import LocalGameWinner from '@/components/modals/LocalGameWinner';
import useWebSocket from 'react-use-websocket';
// import { set } from 'date-fns';



export default function PongGame({ setScore1, setScore2, setMaxScore, title, setTitle, setLeftNickname, playStart, setRightNickname, leftNickname, rightNickname, tournament_id=-1, setDisabled}) {
	const canvasRef = useRef(null);
	const onMessageCallback = useRef(null);
	const router = useRouter();
	const [winner, setWinner] = useState('');
  const [reloadGame, setReloadGame] = useState(false);
  const allowedKeys = ['ArrowUp', 'ArrowDown', 'w', 's', 'p', 'W', 'S', 'P'];
  const { sendMessage, lastMessage, lastJsonMessage, readyState } = useWebSocket(`${process.env.NEXT_PUBLIC_WEBSOCKET_URL}/ws/local/`, {
		shouldReconnect: () => true, // Automatically reconnect on disconnection
    onOpen: () => {
      setDisabled(false);
    }
	});

  const websocketSend = (data_obj) => {
    sendMessage(JSON.stringify(data_obj), false);
  }

  useEffect(() => {
    if (lastJsonMessage && Object.keys(lastJsonMessage).length !== 0 && onMessageCallback.current)
    {
      try {
        onMessageCallback.current(lastJsonMessage);
      } catch (error) {
        setReloadGame(!reloadGame);
      }
    }
  }, [lastJsonMessage]);

  


	useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // ball object
    const ball = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      radius: 10,
      speed: 8,
      velocityX: 5,
      velocityY: 5,
      color: 'white',
    };

    // paddle object
    const user = {
      x: 0,
      y: canvas.height / 2 - 100 / 2,
      width: 10,
      height: 100,
      color: 'white',
      score: 0,
    };

    const rectBall = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      color: 'white',
      score: 0,
    };
    // paddle object
    const computer = {
      x: canvas.width - 10,
      y: canvas.height / 2 - 100 / 2,
      width: 10,
      height: 100,
      color: '#E9C46A',
      score: 0,
    };

    const net = {
      x: canvas.width / 2 - 2,
      y: 0,
      width: 4,
      height: 30,
      color: 'gray',
    };

    let num = 0;
    let number = 1;
    const drawNet = () => {
      const netWidth = 4;
      const netHeight = 20;
      const netColor = "#00ffcc";
      for (let y = 0; y < canvas.height; y += 30) {
        drawRect(canvas.width / 2 - netWidth / 2, y, netWidth, netHeight, netColor);
      }
    };

    const drawRect = (x, y, width, height, color) => {
      context.shadowBlur = 20;
      context.shadowColor = color;
      context.fillStyle = color;
      context.fillRect(x, y, width, height);
      context.shadowBlur = 0; // Reset shadow
    };

    const drawCircle = (x, y, radius, color) => {
      context.shadowBlur = 20;
      context.shadowColor = color;
      context.fillStyle = color;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
      context.shadowBlur = 0; // Reset shadow
    };

    const drawGame = () => {
      // Clear the canvas
      context.clearRect(0, 0, canvas.width, canvas.height);
      // draw net
      drawNet();

      // Draw paddles
      drawRect(user.x, user.y, user.width, user.height, user.color);
      drawRect(computer.x, computer.y, computer.width, computer.height, computer.color);

      // Draw the ball
      drawCircle(ball.x, ball.y, ball.radius, ball.color);
      context.closePath();
    };
    let defaultConfig = {
      "window_size": [1350.0, 600.0],
      "paddles_size": [15, 171.42857142857142],
      "left_paddle_pos": [0, 214.28571428571428],
      "right_paddle_pos": [1335.0, 214.28571428571428],
      "ball_size": [25, 25],
      "ball_pos": [662.5, 287.5],
      "left_player_score": 0,
      "right_player_score": 0,
      "max_score": 3,
      "left_nickname": null,
      "right_nickname": null,
      "title": null,
      "local_game_type": null,
      "tournament_id": null
    };
    // let defaultConfig = {};

		const handleIncomingMessages = function (data) {
			if (data.update)
			{
				if (data.update.left_paddle_pos)
				{
					user.x = data.update.left_paddle_pos[0];
					user.y = data.update.left_paddle_pos[1];
				}
				if (data.update.right_paddle_pos)
				{
					computer.x = data.update.right_paddle_pos[0];
					computer.y = data.update.right_paddle_pos[1];
				}
				ball.radius = defaultConfig.ball_size[0] / 2;
				ball.x = data.update.ball_pos[0] + ball.radius;
				ball.y = data.update.ball_pos[1] + ball.radius;
				if (data.update.left_player_score)
				{
					user.score = data.update.left_player_score;
					setScore2(score2 => data.update.left_player_score);
				}
				if (data.update.right_player_score)
				{
					computer.score = data.update.right_player_score;
					setScore1(score1 => data.update.right_player_score);
				}
				if (data.update.max_score)
				{
					setMaxScore(data.update.max_score);
				}
				if (data.update.finished)
				{
					if (data.update.finished === 'left_player')
						setWinner(leftNickname);
          else if (data.update.finished === 'right_player')
						setWinner(rightNickname);
          setDisabled(false);
				}
				drawGame();
			}
			else if (data.config)
			{
				defaultConfig = data.config;
				canvas.width = defaultConfig.window_size[0];
				canvas.height = defaultConfig.window_size[1];
				net.x = canvas.width / 2 - 2;
				computer.width = defaultConfig.paddles_size[0];
				computer.height = defaultConfig.paddles_size[1];
				user.width = defaultConfig.paddles_size[0];
				user.height = defaultConfig.paddles_size[1];
				user.x = defaultConfig.left_paddle_pos[0];
				user.y = defaultConfig.left_paddle_pos[1];
				computer.x = defaultConfig.right_paddle_pos[0];
				computer.y = defaultConfig.right_paddle_pos[1];
				ball.radius = defaultConfig.ball_size[0] / 2;
				ball.x = defaultConfig.ball_pos[0] + ball.radius;
				ball.y = defaultConfig.ball_pos[1] + ball.radius;
				ball.radius = defaultConfig.ball_size[0] / 2;
				user.score = defaultConfig.left_player_score;
				setScore2(score2 => defaultConfig.left_player_score);
				computer.score = defaultConfig.right_player_score;
				setScore1(score1 => defaultConfig.right_player_score);
        if (data.config.max_score)
        {
          setMaxScore(data.config.max_score);
        }
        if (data.config.local_game_type === 'tournament')
        {
          router.push(`/l_game/${data.config.tournament_id}`);
        } 
        else if (data.config.local_game_type === 'regular')
        {
          router.push(`/l_game`);
        }
				if (data.config.left_nickname)
				{
          setLeftNickname(data.config.left_nickname);
				}
				if (data.config.right_nickname)
				{
          setRightNickname(data.config.right_nickname);
				}
				if (data.config.title)
				{
          setTitle(data.config.title);
				}

				drawGame();
			}
		}

    const handleKeyDown = event => {
      if (!allowedKeys.includes(event.key)) {
        return;
      }
      event.preventDefault();
      websocketSend({ onPress: event.key.trim() });
    };

    // set the key to false when the key is released
    const handleKeyUp = (event) => {
      if (!allowedKeys.includes(event.key)) {
        return;
      }
      event.preventDefault();
      websocketSend({ onRelease: event.key.trim() });
    };
    onMessageCallback.current = handleIncomingMessages;

    function sendVisibilityStatus() {
      let isTabFocused = canvasRef.current.visibilityState === 'visible';
      sendMessage(JSON.stringify({ tabFocused: isTabFocused }));
    }

    // Event listeners
		document.addEventListener('keydown', handleKeyDown);
		document.addEventListener('keyup', handleKeyUp);
		document.addEventListener('visibilitychange', sendVisibilityStatus);

		// Cleanup event listeners
		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('keyup', handleKeyUp);
			document.removeEventListener('visibilitychange', sendVisibilityStatus);
		};
	}, [winner, leftNickname, rightNickname, playStart, reloadGame]); // to reset to default
	return (
    <>
      {winner && <LocalGameWinner reset={() => setWinner('')} winner={winner} tournament_id={tournament_id} />}
      <canvas className="bg-[#264653] rounded-md border min-w-[150px] w-[90%] mx-auto max-w-[1480px]" ref={canvasRef} >
      </canvas>
    </>
	);
}
