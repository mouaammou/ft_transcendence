"use client";
import { useClient } from 'next/client';
import { useEffect, useRef, useState} from 'react';

export default function PongGame({ score1, score2, setScore1, setScore2 }) {
	const canvasRef = useRef(null);
	const [socketState, setSocketState] = useState(false);

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
			color: 'white'
		}

		// paddle object
		const user = {
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
		const computer = {
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

		let num = 0;
		let number = 1;
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

		const socket = new WebSocket('ws://localhost:8000/ws/global/');
		let conectionOn = false;
		function sendVisibilityStatus() {
			console.log("Visibility: ")
			// if (conectionOn === true) {
				console.log(document.visibilityState)
				let isTabFocused = document.visibilityState === 'visible';
				socket.send(JSON.stringify({ tabFocused: isTabFocused }));
			// }
		}

		if (socket.readyState === WebSocket.OPEN) {
			console.log('WebSocket connection is open');
			conectionOn = true;
			// create new game EVENT
		} else {
			console.log('WebSocket connection is not open');
			conectionOn = false;
		  }
		socket.addEventListener('open', (event) => {
			// console.log(socketState);
			console.log('Connected to WS Server');
		});
		// function resizeCanvas() {
		// 	canvas.width = window.innerWidth/2;
		// 	canvas.height = window.innerHeight/3;
		//   }
		  
		//   window.addEventListener('resize', resizeCanvas);
		//   resizeCanvas();
		let gameConfig = {};

		socket.onmessage = function (message) {
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
				// rectBall.x = data.update.ball_pos[0];
				// rectBall.y = data.update.ball_pos[1];
				// console.log(rectBall.x);
				// console.log(rectBall.y);
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
					drawGame();
				}
				else if (data.config)
			{
				// setScore1(score1 => data.config.right_player_score);
				// setScore2(score2 => data.config.left_player_score);
				gameConfig = data.config;
				canvas.width = gameConfig.window_size[0];
				canvas.height = gameConfig.window_size[1];
				// console.log(canvas.height);
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
				// rectBall.x = gameConfig.ball_pos[0];
				// rectBall.y = gameConfig.ball_pos[1];
				// rectBall.width = gameConfig.ball_size[0];
				// rectBall.height = gameConfig.ball_size[1];
				user.score = gameConfig.left_player_score;
				setScore2(score2 => gameConfig.left_player_score);
				computer.score = gameConfig.right_player_score;
				setScore1(score1 => gameConfig.right_player_score);
				drawGame();
			}
		}
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
			drawRect(user.x, user.y, user.width, user.height, user.color);
			drawRect(computer.x, computer.y, computer.width, computer.height, computer.color);
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
			socket.send(JSON.stringify({"onPress" : event.key.trim()}));
			keys[event.key] = true;
			if (event.key === ' ')
			{
				// create new game if space key is created
				socket.send(JSON.stringify(
					{
						"create":
						{
							mode:'remote'
						}
					}
				));
			}
		};

		// set the key to false when the key is released
		const handleKeyUp = (event) => {
			socket.send(JSON.stringify({"onRelease" : event.key.trim()}));
			keys[event.key] = false;
		};

		// Mouse event handlers
		// const handleMouseMove = (event) => {
		// 	const rect = canvas.getBoundingClientRect();
		// 	// if event.clentX is less than half of the canvas within the left half of the canvas, move paddle1
		// 	// how to get the window width and height
		// 	if (event.clientX >= rect.left && event.clientX < rect.left + canvas.width / 2) {
		// 		user.y = event.clientY - rect.top - user.height / 2;
		// 		if (user.y <= 0)
		// 			user.y = 0
		// 		else if (user.y + user.height >= canvas.height)
		// 			user.y = canvas.height - user.height;
		// 	}
		// 	else if (event.clientX >= rect.left + canvas.width / 2 && event.clientX < rect.right) {
		// 		computer.y = event.clientY - rect.top - computer.height / 2;
		// 		if (computer.y <= 0)
		// 			computer.y = 0
		// 		else if (computer.y + computer.height >= canvas.height)
		// 			computer.y = canvas.height - computer.height;
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
		// 	drawGame();

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
	return (
		<canvas className="play-ground" ref={canvasRef} >
			
		</canvas>
	);
}
