import { useClient } from 'next/client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import LocalGameWinner from '@/components/modals/LocalGameWinner';



export default function PongGame({ setScore1, setScore2, setMaxScore, title, setTitle, setLeftNickname, playStart, setRightNickname, leftNickname, rightNickname, tournament_id=-1}) {
	const canvasRef = useRef(null);
	const websocketRef = useRef(null);
	const router = useRouter();
	const [winner, setWinner] = useState('');
  const allowedKeys = ['ArrowUp', 'ArrowDown', 'w', 's', 'p', 'W', 'S', 'P'];
	// const [leftNickname, setleftNickname] = useState("default");
	// const [rightNickname, setrightNickname] = useState("default");
	// const [socket, setSocket] = useRef(null);

  const websocketSend = (data_obj) => {
    if (!websocketRef.current)
        return ;
    if (websocketRef.current.readyState !== WebSocket.OPEN)
        return ;
    websocketRef.current.send(JSON.stringify(data_obj));
  }

  const connectWebsocket = () => {
    if (!websocketRef.current ||
      !websocketRef.current.readyState  != WebSocket.OPEN ||
      websocketRef.current.readyState != WebSocket.CONNECTING)
    {
      websocketRef.current = new WebSocket('ws://localhost:8000/ws/local/');
    }
  }

  


	useEffect(() => {
    connectWebsocket();

    // console.log('nnnnnnaaames:', leftNickname, rightNickname)
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
    // const drawNet = () => {
    //   for (let y = 0; y < canvas.height; y += 45) {
    //     drawRect(net.x, y, net.width, net.height, net.color);
    //   }
    // };
    const drawNet = () => {
      const netWidth = 4;
      const netHeight = 20;
      const netColor = "#00ffcc";
      for (let y = 0; y < canvas.height; y += 30) {
        drawRect(canvas.width / 2 - netWidth / 2, y, netWidth, netHeight, netColor);
      }
    };

    // const drawEllipse = () => {
    // }
    // const drawRect = (x, y, width, height, color) => {
    //   context.fillStyle = color;
    //   context.fillRect(x, y, width, height);
    // };
    const drawRect = (x, y, width, height, color) => {
      context.shadowBlur = 20;
      context.shadowColor = color;
      context.fillStyle = color;
      context.fillRect(x, y, width, height);
      context.shadowBlur = 0; // Reset shadow
    };

    // const resetBall = () => {
    // 	ball.x = canvas.width / 2;
    // 	ball.y = canvas.height / 2;
    // 	ball.speed = 8;
    // 	ball.velocityX = 5;
    // 	ball.velocityY = 5;
    // 	ball.velocityX = -ball.velocityX;
    // }

    // const drawCircle = (x, y, radius, color) => {
    //   context.fillStyle = color;
    //   context.beginPath();
    //   context.arc(x, y, radius, 0, Math.PI * 2, false);
    //   context.closePath();
    //   context.fill();
    // };
    const drawCircle = (x, y, radius, color) => {
      context.shadowBlur = 20;
      context.shadowColor = color;
      context.fillStyle = color;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
      context.shadowBlur = 0; // Reset shadow
    };

    // Draw game elements
    const drawGame = () => {
      // Clear the canvas
      context.clearRect(0, 0, canvas.width, canvas.height);
      // draw net
      drawNet();

      // Draw paddles
      drawRect(user.x, user.y, user.width, user.height, user.color);
      drawRect(computer.x, computer.y, computer.width, computer.height, computer.color);
      // drawRect(rectBall.x, rectBall.y, rectBall.width, rectBall.height, rectBall.color);

      // Draw the ball
      drawCircle(ball.x, ball.y, ball.radius, ball.color);
      context.closePath();
    };

    let gameConfig = {};

		const handleIncomingMessages = function (message) {
			const data = JSON.parse(message.data);
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
				ball.radius = gameConfig.ball_size[0] / 2;
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
				}
				drawGame();

			}
			else if (data.config)
			{
				console.log('config: ', data.config);
				gameConfig = data.config;
				canvas.width = gameConfig.window_size[0];
				canvas.height = gameConfig.window_size[1];
				net.x = canvas.width / 2 - 2;
				computer.width = gameConfig.paddles_size[0];
				computer.height = gameConfig.paddles_size[1];
				user.width = gameConfig.paddles_size[0];
				user.height = gameConfig.paddles_size[1];
				user.x = gameConfig.left_paddle_pos[0];
				user.y = gameConfig.left_paddle_pos[1];
				computer.x = gameConfig.right_paddle_pos[0];
				computer.y = gameConfig.right_paddle_pos[1];
				ball.radius = gameConfig.ball_size[0] / 2;
				ball.x = gameConfig.ball_pos[0] + ball.radius;
				ball.y = gameConfig.ball_pos[1] + ball.radius;
				ball.radius = gameConfig.ball_size[0] / 2;
				user.score = gameConfig.left_player_score;
				setScore2(score2 => gameConfig.left_player_score);
				computer.score = gameConfig.right_player_score;
				setScore1(score1 => gameConfig.right_player_score);
        if (data.config.max_score)
        {
          setMaxScore(data.config.max_score);
        }
        if (data.config.local_game_type === 'tournament')
        {
          console.log('=======================troun================>>>>>>>>>');
          console.log(`/l_game/${data.config.tournament_id}`);
          router.push(`/l_game/${data.config.tournament_id}`);
        } else if (data.config.local_game_type === 'regular')
          {
          console.log('========================regular===============>>>>>>>>>')
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
        console.log('local game type: ', data.config.local_game_type)
				drawGame();
			}
		}

    const handleKeyDown = event => {
      if (!allowedKeys.includes(event.key)) {
        return;
      }
      event.preventDefault();
      // socket.send(JSON.stringify({ onPress: event.key.trim() }));
      websocketSend({ onPress: event.key.trim() });
    };

    // set the key to false when the key is released
    const handleKeyUp = (event) => {
      if (!allowedKeys.includes(event.key)) {
        return;
      }
      event.preventDefault();
      // socket.send(JSON.stringify({ onRelease: event.key.trim() }));
      websocketSend({ onRelease: event.key.trim() });
    };

    const handleWebsocketOpen  = (event) => {
      websocketRef.current.onmessage = handleIncomingMessages;
      drawGame();
    }

    function sendVisibilityStatus() {
      // console.log('Visibility: ');
      // if (conectionOn === true) {
      // console.log('visibility->: ', document.visibilityState);
      let isTabFocused = canvasRef.current.visibilityState === 'visible';
      // socket.send(JSON.stringify({ tabFocused: isTabFocused }));
      websocketSend({ tabFocused: isTabFocused });
      // }
    }

    // Event listeners
    websocketRef.current.addEventListener('open', handleWebsocketOpen);
		document.addEventListener('keydown', handleKeyDown);
		document.addEventListener('keyup', handleKeyUp);
		document.addEventListener('visibilitychange', sendVisibilityStatus);

		// Cleanup event listeners
		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('keyup', handleKeyUp);
			document.removeEventListener('visibilitychange', sendVisibilityStatus);
      websocketRef.current?.close();
		};
	}, [winner, leftNickname, rightNickname, playStart]); // to reset to default
	return (
    <>
      {winner && <LocalGameWinner reset={() => setWinner('')} winner={winner} tournament_id={tournament_id} />}
      <canvas className="bg-[#264653] rounded-md border min-w-[150px] w-[90%] mx-auto" ref={canvasRef} >
      </canvas>
    </>
	);
}
