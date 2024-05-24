import { useClient } from 'next/client';
import { useEffect, useRef, useState, createContext, useContext } from 'react';

export default function PongGame({changeScore1, score2}) {
	const canvasRef = useRef(null);
	const [socketState, setSocketState] = useState(false);
	const CanvasContext = createContext();

	useEffect(() => {
		const canvas = canvasRef.current;
		const context = canvas.getContext('2d');
		CanvasContext.Provider = context;

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
		const drawNet = () =>{
			for (let y = 0; y < canvas.height; y+=45) {
				drawRect(net.x, y, net.width, net.height, net.color);
			}
		}

		const drawRect = (x, y, width, height, color) => {
			context.fillStyle = color;
			context.fillRect(x, y, width, height);
		}

		const resetBall = () => {
			ball.x = canvas.width / 2;
			ball.y = canvas.height / 2;
			ball.speed = 8;
			ball.velocityX = 5;
			ball.velocityY = 5;
			ball.velocityX = -ball.velocityX;
		}
		const drawCircle = (x, y, radius, color) => {
			context.fillStyle = color;
			context.beginPath();
			context.arc(x, y, radius, 0, Math.PI * 2, false);
			context.closePath();
			context.fill();
		}

		const checkCollision = (ball, player) => {
			ball.top = ball.y - ball.radius;
			ball.bottom = ball.y + ball.radius;
			ball.left = ball.x - ball.radius;
			ball.right = ball.x + ball.radius;

			player.top = player.y;
			player.bottom = player.y + player.height;
			player.left = player.x;
			player.right = player.x + player.width;

			return ball.right > player.left && ball.bottom > player.top && ball.left < player.right && ball.top < player.bottom;
		}
		// Constants
		//create new websocket client
		// const socket = new WebSocket('ws://'+ '10.12.8.9:5000' + '/ws/pong/new_game/');
		// // Connection opened
		// socket.addEventListener('open', (event) => {
		// 	console.log(socketState);
		// 	console.log('Connected to WS Server');
		// });

		// Game state
		// Keyboard state
		const keys = {};
		// Update game logic
		let setconfig = false;
		// socket.onmessage
		const updateGame = () => {
			// Move paddles
			if (keys.ArrowUp && computer.y > 0) {
				computer.y -= 10;
			}
			if (keys.ArrowDown && computer.y + computer.height < canvas.height) {
				computer.y += 10;
			}
			if (keys.q && user.y > 0) {
				user.y -= 10;
			}
			if (keys.s && user.y + user.height < canvas.height) {
				user.y += 10;
			}

		  // Move the ball
		  ball.x += ball.velocityX;
		  ball.y += ball.velocityY;

		  // simple AI movement
		  num++;
		  if (num % 50 == 0)
			{
				number = Math.random() * 10 + 1;
				console.log(number);
			}
		  	computer.y = ball.y - computer.height / 1 ;
		  let player;
		  if (ball.x > canvas.width / 2)
			player = computer;
		  else
			player = user;
		  if (checkCollision(ball, player)) {
			let collidPoint = ball.y - (player.y + (player.height / 2));
			collidPoint = collidPoint / (player.height / 2);
			let angle = collidPoint * (Math.PI / 4);
			let direction = (ball.x < canvas.width / 2) ? 1: -1;
			ball.speed += 0.4;
			ball.velocityX = Math.cos(angle) * ball.speed * (direction);
			ball.velocityY = Math.sin(angle) * ball.speed;
		}
		  // Check for collisions with walls
		if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= canvas.height)
			ball.velocityY = - ball.velocityY;
		  // Reset ball position if it goes beyond the paddles
		if (ball.x - ball.radius < 0) {
			computer.score++;
			// changeScore1();
			resetBall();
		}
		if (ball.x > canvas.width) {
			user.score++;
			resetBall();
		}
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

		  // Draw the ball
		  drawCircle(ball.x, ball.y, ball.radius, ball.color);
		  context.closePath();
		};

		// Keyboard event handlers  // ArrowUp ArrowDown q s
		// add the key to the keys object when a key is pressed, if it's not already there, to keep track of multiple key presses
		const handleKeyDown = (event) => {
		  keys[event.key] = true;
		};

		// set the key to false when the key is released
		const handleKeyUp = (event) => {
		  keys[event.key] = false;
		};

		// Mouse event handlers
		const handleMouseMove = (event) => {
		  const rect = canvas.getBoundingClientRect();
		  // if event.clentX is less than half of the canvas within the left half of the canvas, move paddle1
		  // how to get the window width and height
		  if (event.clientX >= rect.left && event.clientX < rect.left + canvas.width / 2)
			{
				user.y = event.clientY - rect.top - user.height / 2;
				if (user.y <= 0)
						user.y = 0
				else if (user.y + user.height >= canvas.height)
						user.y = canvas.height - user.height;
			}
		// 	else if (event.clientX >= rect.left + canvas.width /2 && event.clientX < rect.right)
		// 		{
		// 			computer.y = event.clientY - rect.top - computer.height / 2;
		// 			if (computer.y <= 0)
		// 					computer.y = 0
		// 			else if (computer.y + computer.height >= canvas.height)
		// 					computer.y = canvas.height - computer.height;
		// 		}
		//   // handle the paddle going out of the canvas
		}

		// Move the paddle2 with the mouse too
		// Attach event listeners
		document.addEventListener('mousemove', handleMouseMove);// add event listener to the document object when the mouse is moved
		document.addEventListener('keydown', handleKeyDown);// add event listener to the document object when a key is pressed
		document.addEventListener('keyup', handleKeyUp);

		// Animation loop
		const animate = () => {
		  updateGame();
		  drawGame();

		  requestAnimationFrame(animate);
		};

		animate();
		// setInterval(animate, 1000 / 60);

		// Cleanup event listeners
		return () => {
		  document.removeEventListener('keydown', handleKeyDown);
		  document.removeEventListener('keyup', handleKeyUp);
		};
	  }, []);
		return (
			<CanvasContext.Provider value={canvasRef}>
				<canvas className="play-ground" ref={canvasRef} height={400} width={900}>
					{/* height={400} width={900} */}
				</canvas>
			</CanvasContext.Provider>
	);
}





















