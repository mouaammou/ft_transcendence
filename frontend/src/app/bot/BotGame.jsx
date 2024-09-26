"use client";
import { useEffect, playeref, useState, useRef} from 'react';

export default function PongBot({ score1, score2, setScore1, setScore2 }) {
	const canvasRef = useRef(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		const context = canvas.getContext('2d');

		// ball object
		const ball = {
			x: canvas.width / 2,
			y: canvas.height / 2,
			radius: 10,
			speed: 4,
			velocityX: 1,
			velocityY: 1,
			color: 'white'
		}

		// paddle object
		const player = {
			x: 0,
			y: canvas.height / 2 - 100 / 2,
			width: 10,
			height: 500,
			color: 'white',
			score: 0,
			speed: 15
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
			score: 0,
			speed: 2,
			level: 0.5
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

		const resetBall = () => {
			ball.x = canvas.width / 2;
			ball.y = canvas.height / 2;
			ball.speed = 4;
			ball.velocityX = 2;
			ball.velocityY = 2;
			ball.velocityX = -ball.velocityX;
		}
		
		const drawCircle = (x, y, radius, color) => {
			context.fillStyle = color;
			context.beginPath();
			context.arc(x, y, radius, 0, Math.PI * 2, false);
			context.closePath();
			context.fill();
		}
		// handle the page visibility for later:
		let gameOn = true;

		// function resizeCanvas() {
		// 	canvas.width = window.innerWidth/2;
		// 	canvas.height = window.innerHeight/3;
		//   }
		  
		//   window.addEventListener('resize', resizeCanvas);
		//   resizeCanvas();
		// Game state
		// Keyboard state
		const keys = {};
		// Update game logic
		let lastY = ball.y;
		const updateGame = () => {
			ball.x += ball.velocityX * ball.speed;
			ball.y += ball.velocityY * ball.speed;
			console.log("ball.velocityX * ball.speed --> ",ball.velocityX * ball.speed);
			console.log("ball.velocityX * ball.speed --> ",ball.velocityY * ball.speed);
			computer.y = ball.y - computer.height / 2
		    // Check for collision with the top edge of the table
			if (ball.y - ball.radius <= 0) {
				// Only reverse if the ball was moving up
				if (lastY > ball.y) 
					ball.velocityY = -ball.velocityY; // Reverse direction
				ball.y = ball.radius; // Prevent sticking to the edge
			}
		
			// Check for collision with the bottom edge of the table
			if (ball.y + ball.radius >= canvas.height) {
				// Only reverse if the ball was moving down
				if (lastY < ball.y) 
					ball.velocityY = -ball.velocityY; // Reverse direction
				ball.y = canvas.height - ball.radius; // Prevent sticking to the edge
			}
		
			// Update last position
			lastY = ball.y;
			if (ball.x <= 0) {
				player.score += 1;
				setScore1(prevScore1 => prevScore1 + 1); // Increment player score
				resetBall();
			}
			
			if (ball.x >= canvas.width) {
				computer.score += 1;
				setScore2(prevScore2 => prevScore2 + 1); // Increment computer score
				resetBall();
			}


			if (keys['ArrowUp'] && player.y > 0 )
				player.y -= player.speed
			else if (keys['ArrowDown'] && (player.y + player.height <= canvas.height))
				player.y += player.speed;
			if (computer.y <= 0)
				computer.y = 0;
			else if (computer.y + computer.height > canvas.height)
				computer.y  = canvas.height - computer.height; 
			
			if (isBallCollidingWithPaddle(ball, player)) {
				ball.velocityX = -ball.velocityX; // Reverse direction
				// Optional: Adjust ball's vertical direction based on where it hits the paddle
				const collisionPoint = ball.y - (player.y + player.height / 2);
				ball.velocityY += collisionPoint / (player.height / 2); // Adjust bounce angle
				console.log("here -->");
				console.log(ball.velocityY);
				if (ball.speed <= 10)
					ball.speed += 0.5; // Increase speed slightly on collision
			}
			
			if (isBallCollidingWithPaddle(ball, computer)) {
				ball.velocityX = -ball.velocityX; // Reverse direction
				const collisionPoint = ball.y - (computer.y + computer.height / 2);
				ball.velocityY += collisionPoint / (computer.height / 2); // Adjust bounce angle
				console.log("here -->");
				console.log(ball.velocityY);
				if (ball.speed <= 10)
					ball.speed += 0.5; // Increase speed slightly on collision
			}

			if (player.score >= 7 || computer.score >= 7) {
				resetBall()
				gameOn = false;
			}
		}

		const isBallCollidingWithPaddle = (ball, paddle) => {
			return ball.x + ball.radius > paddle.x &&
				   ball.x - ball.radius < paddle.x + paddle.width &&
				   ball.y + ball.radius > paddle.y &&
				   ball.y - ball.radius < paddle.y + paddle.height;
		};

		// Draw game elements
		const drawGame = () => {
			// Clear the canvas
			context.clearRect(0, 0, canvas.width, canvas.height);
			// draw net
			drawNet();

			// Draw paddles
			drawRect(player.x, player.y, player.width, player.height, player.color);
			drawRect(computer.x, computer.y, computer.width, computer.height, computer.color);
			// drawRect(rectBall.x, rectBall.y, rectBall.width, rectBall.height, rectBall.color);

			// Draw the ball
			drawCircle(ball.x, ball.y, ball.radius, ball.color);
			context.closePath();
		console.log(ball.speed);

		};
		
		// Keyboard event handlers  // ArrowUp ArrowDown q s
		// add the key to the keys object when a key is pressed, if it's not already there, to keep track of multiple key presses
		const handleKeyDown = (event) => {
            console.log(event.key);
			keys[event.key] = true;

		};

		// set the key to false when the key is released
		const handleKeyUp = (event) => {
			console.log(event.key);
			keys[event.key] = false;
		};

		// Mouse event handlers
		const handleMouseMove = (event) => {
			const rect = canvas.getBoundingClientRect();
			// if event.clentX is less than half of the canvas within the left half of the canvas, move paddle1
			// how to get the window width and height
			if (event.clientX >= rect.left && event.clientX < rect.left + canvas.width / 2) {
				player.y = event.clientY - rect.top - player.height / 2;
				if (player.y <= 0)
					player.y = 0
				else if (player.y + player.height >= canvas.height)
					player.y = canvas.height - player.height;
			}
			else if (event.clientX >= rect.left + canvas.width / 2 && event.clientX < rect.right) {
				computer.y = event.clientY - rect.top - computer.height / 2;
				if (computer.y <= 0)
					computer.y = 0
				else if (computer.y + computer.height >= canvas.height)
					computer.y = canvas.height - computer.height;
			}
			// handle the paddle going out of the canvas
		}

		// Move the paddle2 with the mouse too
		// Attach event listeners
		// document.addEventListener('mousemove', handleMouseMove);// add event listener to the document object when the mouse is moved
		document.addEventListener('keydown', handleKeyDown);// add event listener to the document object when a key is pressed
		document.addEventListener('keyup', handleKeyUp);

		// Animation loop
		const animate = () => {
			if (gameOn) {
				updateGame();
				drawGame();	
			}

			requestAnimationFrame(animate);
		};

		animate();
		// setInterval(animate, 1000 / 60);

		// Cleanup event listeners
		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('keyup', handleKeyUp);
			// document.removeEventListener('visibilitychange', sendVisibilityStatus);
		};
	}, []);
	return (
		<canvas className="play-ground" ref={canvasRef}  width={900} height={400}>
			
			
		</canvas>
	);
}

