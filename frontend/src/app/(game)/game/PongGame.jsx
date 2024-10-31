"use client";
import { useEffect, useState, useRef} from 'react';
import socket from '@/utils/WebSocketManager';
import YouLose from '@/components/modals/YouLose';
import YouWin from '@/components/modals/YouWin';
import { useRouter , useSearchParams, usePathname } from 'next/navigation';

export default function PongGame({ score1, score2, setScore1, setScore2, gameType }) {
	const canvasRef = useRef(null);
	const [showWinModal, setShowWinModal] = useState(false);
	const [showLoseModal, setShowLoseModal] = useState(false);
	const router = useRouter();
	const pathname = usePathname();
    const searchParams = useSearchParams();
	const previousPathnameRef = useRef(pathname);

	useEffect(() => {
		const canvas = canvasRef.current;
		const context = canvas.getContext('2d');
		var start = true;

		if (start) {
			socket.sendMessage(JSON.stringify({launch: start}));
			start = false;
		}
		// ball object
		const ball = {
			x: canvas.width / 2,
			y: canvas.height / 2,
			radius: 10,
			speed: 8,
			velocityX: 5,
			velocityY: 5,
			color: 'white'
		}

		// paddle object
		const player_1 = {
			x: 0,
			y: canvas.height / 2 - 100 / 2,
			width: 10,
			height: 100,
			color: 'white',
			score: 0
		}
		const rectBall = {
			x: 0,
			y: 0,
			width: 0,
			height: 0,
			color: 'white',
			score: 0
		}
		// paddle object
		const player_2 = {
			x: canvas.width - 10,
			y: canvas.height / 2 - 100 / 2,
			width: 10,
			height: 100,
			color: '#E9C46A',
			score: 0
		}

		const net = {
			x: canvas.width / 2 - 2,
			y: 0,
			width: 4,
			height: 30,
			color: 'gray'
		}

		const drawNet = () => {
			for (let y = 0; y < canvas.height; y += 45) {
				drawRect(net.x, y, net.width, net.height, net.color);
			}
		}

		// const drawEllipse = () => {
		// }
		const drawRect = (x, y, width, height, color) => {
			context.fillStyle = color;
			context.fillRect(x, y, width, height);
		}

		// const resetBall = () => {
		// 	ball.x = canvas.width / 2;
		// 	ball.y = canvas.height / 2;
		// 	ball.speed = 8;
		// 	ball.velocityX = 5;
		// 	ball.velocityY = 5;
		// 	ball.velocityX = -ball.velocityX;
		// }
		
		const drawCircle = (x, y, radius, color) => {
			context.fillStyle = color;
			context.beginPath();
			context.arc(x, y, radius, 0, Math.PI * 2, false);
			context.closePath();
			context.fill();
		}

		// handle the page visibility for later:
		let conectionOn = false;
		function sendVisibilityStatus() {
			// console.log("Visibility: ")
				// console.log(document.visibilityState)
				let isTabFocused = document.visibilityState === 'visible';
				socket.sendMessage(JSON.stringify({ tabFocused: isTabFocused }));
		}

		if (socket.readyState === WebSocket.OPEN) {
			console.log('WebSocket connection is open');
			conectionOn = true;
			// create new game EVENT
		} else {
			console.log('WebSocket connection is not open');
			conectionOn = false;
		  }
		// socket.addEventListener('open', (event) => {
		// 	// console.log(socketState);
		// 	console.log('Connected to WS Server');
		// });
		// function resizeCanvas() {
		// 	canvas.width = window.innerWidth/2;
		// 	canvas.height = window.innerHeight/3;
		//   }
		  
		//   window.addEventListener('resize', resizeCanvas);
		//   resizeCanvas();
		let gameConfig = {};

		const handleMessage = (message) => {
			// console.log(message);
			if (!message) {
				console.error('Received an undefined message or data:', message);
				return; // Exit early if message is invalid
			}
			const data = JSON.parse(message.data);
			if (data.update)
			{
				// console.log(data);
				if (data.update.left_paddle_pos)
				{
					player_1.x = data.update.left_paddle_pos[0];
					player_1.y = data.update.left_paddle_pos[1];
				}
				if (data.update.right_paddle_pos)
				{
					player_2.x = data.update.right_paddle_pos[0];
					player_2.y = data.update.right_paddle_pos[1];
				}
				// ball.radius = gameConfig.ball_size[0] / 2;
				if (data.update.ball_pos) 
				{
					ball.x = data.update.ball_pos[0] + ball.radius;
					ball.y = data.update.ball_pos[1] + ball.radius;
				}
				// rectBall.x = data.update.ball_pos[0];
				// rectBall.y = data.update.ball_pos[1];
				// console.log(rectBall.x);
				// console.log(rectBall.y);
				if (data.update.left_player_score)
				{
					player_1.score = data.update.left_player_score;
					setScore2(score2 => data.update.left_player_score);
				}
				if (data.update.right_player_score)
				{
					player_2.score = data.update.right_player_score;
					setScore1(score1 => data.update.right_player_score);
				}
				if (data.update.status) {
					if (data.update.status  === 'win') {
						console.log('Congratulations, you win');
						setShowWinModal(true);
					}
					else if (data.update.status  === 'lose') {
						console.log('Unfortunately, you lost');
						setShowLoseModal(true);
					}
				}
				drawGame();
			}
			else if (data.config)
			{
				// console.log(data);

					// setScore1(score1 => data.config.right_player_score);
					// setScore2(score2 => data.config.left_player_score);
					gameConfig = data.config;
					canvas.width = gameConfig.window_size[0];
					canvas.height = gameConfig.window_size[1];
					// console.log(canvas.height);
					net.x = canvas.width / 2 - 2;
					player_2.width = gameConfig.paddles_size[0];
					player_2.height = gameConfig.paddles_size[1];
					player_1.width = gameConfig.paddles_size[0];
					player_1.height = gameConfig.paddles_size[1];
					player_1.x = gameConfig.left_paddle_pos[0];
					player_1.y = gameConfig.left_paddle_pos[1];
					player_2.x = gameConfig.right_paddle_pos[0];
					player_2.y = gameConfig.right_paddle_pos[1];
					ball.radius = gameConfig.ball_size[0] / 2;
					ball.x = gameConfig.ball_pos[0] + ball.radius;
					ball.y = gameConfig.ball_pos[1] + ball.radius;
					ball.radius = gameConfig.ball_size[0] / 2;
					// rectBall.x = gameConfig.ball_pos[0];
					// rectBall.y = gameConfig.ball_pos[1];
					// rectBall.width = gameConfig.ball_size[0];
					// rectBall.height = gameConfig.ball_size[1];
					player_1.score = gameConfig.left_player_score;
					setScore2(score2 => gameConfig.left_player_score);
					player_2.score = gameConfig.right_player_score;
					setScore1(score1 => gameConfig.right_player_score);
					drawGame();
				}
		}
		socket.registerMessageHandler(handleMessage);
		// Game state
		// Keyboard state
		const keys = {};
		// Update game logic
		let setconfig = false;
		// socket.onmessage
		const updateGame = () => {
		}


		// Draw game elements
		const drawGame = () => {
			// Clear the canvas
			context.clearRect(0, 0, canvas.width, canvas.height);
			// draw net
			drawNet();

			// Draw paddles
			drawRect(player_1.x, player_1.y, player_1.width, player_1.height, player_1.color);
			drawRect(player_2.x, player_2.y, player_2.width, player_2.height, player_2.color);
			// drawRect(rectBall.x, rectBall.y, rectBall.width, rectBall.height, rectBall.color);

			// Draw the ball
			drawCircle(ball.x, ball.y, ball.radius, ball.color);
			context.closePath();
		};
		
		if (!conectionOn)
		{
			drawGame()
		}
		// Keyboard event handlers  // ArrowUp ArrowDown q s
		// add the key to the keys object when a key is pressed, if it's not already there, to keep track of multiple key presses
		const handleKeyDown = (event) => {
			socket.sendMessage(JSON.stringify({"onPress" : event.key.trim()}));
			keys[event.key] = true;
			// if (event.key === ' ')
			// {
			// 	// create new game if space key is created
			// 	socket.sendMessage(JSON.stringify(
			// 		{
			// 			"create":
			// 			{
			// 				mode:'remote'
			// 			}
			// 		}
			// 	));
			// }
		};

		// set the key to false when the key is released
		const handleKeyUp = (event) => {
			socket.sendMessage(JSON.stringify({"onRelease" : event.key.trim()}));
			keys[event.key] = false;
		};

		// Mouse event handlers
		// const handleMouseMove = (event) => {
		// 	const rect = canvas.getBoundingClientRect();
		// 	// if event.clentX is less than half of the canvas within the left half of the canvas, move paddle1
		// 	// how to get the window width and height
		// 	if (event.clientX >= rect.left && event.clientX < rect.left + canvas.width / 2) {
		// 		player_1.y = event.clientY - rect.top - player_1.height / 2;
		// 		if (player_1.y <= 0)
		// 			player_1.y = 0
		// 		else if (player_1.y + player_1.height >= canvas.height)
		// 			player_1.y = canvas.height - player_1.height;
		// 	}
		// 	else if (event.clientX >= rect.left + canvas.width / 2 && event.clientX < rect.right) {
		// 		player_2.y = event.clientY - rect.top - player_2.height / 2;
		// 		if (player_2.y <= 0)
		// 			player_2.y = 0
		// 		else if (player_2.y + player_2.height >= canvas.height)
		// 			player_2.y = canvas.height - player_2.height;
		// 	}
		// 	// handle the paddle going out of the canvas
		// }

		// Move the paddle2 with the mouse too
		// Attach event listeners
		// document.addEventListener('mousemove', handleMouseMove);// add event listener to the document object when the mouse is moved
		document.addEventListener('keydown', handleKeyDown);// add event listener to the document object when a key is pressed
		document.addEventListener('keyup', handleKeyUp);
		document.addEventListener('visibilitychange', sendVisibilityStatus);

		// Animation loop
		// const animate = () => {
		// 	updateGame();
			// drawGame();

		// 	requestAnimationFrame(animate);
		// };

		// animate();
		// setInterval(animate, 1000 / 60);

		// Cleanup event listeners
		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('keyup', handleKeyUp);
			document.removeEventListener('visibilitychange', sendVisibilityStatus);
		};
	}, []);


	useEffect(() => {
		// This code will run when the component is mounted
		// console.log('Game page entered:', pathname);
		socket.sendMessage(JSON.stringify({"inGamePage" : true}));
	
		return () => {
			// This code will run when the component is unmounted
			console.log('Game page left:', pathname);
			socket.sendMessage(JSON.stringify({"inGamePage" : false}));
		};
	}, []);

	return (
		<>
			<canvas className="play-ground" ref={canvasRef}  width={900} height={400}>

			</canvas>
				{showWinModal && (
					<YouWin 
						onClose={() => {
							setShowWinModal(false);
							if (gameType === 'tournament') {
						    router.push('/tournament_board');
							}else {
								router.push('/play');
							}
						}
						}
						// stats={{ score1, score2 }} // Pass stats as needed
					/>
				)}
				
				{showLoseModal && (
					<YouLose 
						onClose={() => {
							setShowLoseModal(false);
							// if (gameType === 'tournament') {
							// 	router.push('/tournament_board');
							// 	}else {
									router.push('/play');
								// }
						}
						}
						// stats={{ score1, score2 }} // Pass stats as needed
					/>
				)}
		</>
	);
}
