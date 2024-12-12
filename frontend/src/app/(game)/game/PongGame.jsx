"use client";
import { useEffect, useState, useRef } from 'react';
import { useGlobalWebSocket } from '@/utils/WebSocketManager';
import YouLose from '@/components/modals/YouLose';
import YouWin from '@/components/modals/YouWin';
import { useRouter, usePathname } from 'next/navigation';
import { set } from 'date-fns';
import style from '@/Styles/game/game.module.css';


const INITIAL_CONFIG = {
	window_width: 900,
	window_height: 400,
	paddle_width: 15,
	paddle_height: 400 / 3.5,
	ball_width: 25,
	ball_height: 25,
	window_center_x: 900 / 2,
	window_center_y: 400 / 2,
	left_paddle_start_x: 0,
	left_paddle_start_y: (400 / 2) - (400 / 3.5 / 2),
	right_paddle_start_x: 900 - 15,
	right_paddle_start_y: (400 / 2) - (400 / 3.5 / 2),
	ball_start_x: (900 / 2) - (25 / 2),
	ball_start_y: (400 / 2) - (25 / 2)
};

const createInitialGameState = () => ({
	ball: {
		radius: INITIAL_CONFIG.ball_width / 2,
		speed: 8,
		velocityX: 5,
		velocityY: 5,
		color: 'white',
		x: INITIAL_CONFIG.ball_start_x + INITIAL_CONFIG.ball_width / 2,
		y: INITIAL_CONFIG.ball_start_y + INITIAL_CONFIG.ball_height / 2
	},
	player1: {
		x: INITIAL_CONFIG.left_paddle_start_x,
		y: INITIAL_CONFIG.left_paddle_start_y,
		width: INITIAL_CONFIG.paddle_width,
		height: INITIAL_CONFIG.paddle_height,
		color: 'white',
		score: 0
	},
	player2: {
		x: INITIAL_CONFIG.right_paddle_start_x,
		y: INITIAL_CONFIG.right_paddle_start_y,
		width: INITIAL_CONFIG.paddle_width,
		height: INITIAL_CONFIG.paddle_height,
		color: '#E9C46A',
		score: 0
	},
	net: {
		x: INITIAL_CONFIG.window_width / 2 - 2,
		y: 0,
		width: 4,
		height: 30,
		color: 'gray'
	},
	gameConfig: {}
});

// Helper functions
const createPaddle = (x, y, width, height, color) => ({
	x,
	y,
	width,
	height,
	color,
	score: 0
});

const drawRect = (context, x, y, width, height, color) => {
	context.fillStyle = color;
	context.fillRect(x, y, width, height);
};

const drawCircle = (context, x, y, radius, color) => {
	context.fillStyle = color;
	context.beginPath();
	context.arc(x, y, radius, 0, Math.PI * 2, false);
	context.closePath();
	context.fill();
};

export default function PongGame({ score1, score2, setScore1, setScore2, gameType }) {
	const canvasRef = useRef(null);
	const [showWinModal, setShowWinModal] = useState(false);
	const [showLoseModal, setShowLoseModal] = useState(false);
	const router = useRouter();
	const pathname = usePathname();
	const { sendMessage, isConnected, lastMessage } = useGlobalWebSocket();
	const gameStateRef = useRef(createInitialGameState());
	const handleVisibilityChange = () => {
		const isTabFocused = document.visibilityState === 'visible';
		if (isConnected) {
			sendMessage(JSON.stringify({ tabFocused: isTabFocused }));
		}
	};

	const drawNet = (context, canvas, net) => {
		for (let y = 0; y < canvas.height; y += 45) {
			drawRect(context, net.x, y, net.width, net.height, net.color);
		}
	};

	const drawGame = () => {
		const canvas = canvasRef.current;// get the canvas, i use a ref to access  the component <canvas className="play-ground" ref={canvasRef} width={900} height={400} />
		const context = canvas.getContext('2d');// get the canvas context, the context is used to draw on the canvas
		const { ball, player1, player2, net } = gameStateRef.current;

		if (!context || !player1 || !player2) return;

		context.clearRect(0, 0, canvas.width, canvas.height);// clear the canvas before drawing the second frame
		drawNet(context, canvas, net);
		drawRect(context, player1.x, player1.y, player1.width, player1.height, player1.color);// draw the first player's paddle
		drawRect(context, player2.x, player2.y, player2.width, player2.height, player2.color);// draw the second player's paddle
		drawCircle(context, ball.x, ball.y, ball.radius, ball.color);// draw the ball
	};

	const handleKeyboardEvents = (event, type) => {
		if (isConnected) {
			const action = type === 'keydown' ? 'onPress' : 'onRelease';
			sendMessage(JSON.stringify({ [action]: event.key.trim() }));
		}
	};


	useEffect(() => {
		drawGame();
		document.addEventListener('keydown', e => handleKeyboardEvents(e, 'keydown'));
		document.addEventListener('keyup', e => handleKeyboardEvents(e, 'keyup'));
		document.addEventListener('visibilitychange', handleVisibilityChange);


		if (isConnected) {
			sendMessage(JSON.stringify({ tabFocused: true }));
		}

		return () => {
			if (isConnected) {
				sendMessage(JSON.stringify({ tabFocused: false }));
			}
			document.removeEventListener('keydown', e => handleKeyboardEvents(e, 'keydown'));
			document.removeEventListener('keyup', e => handleKeyboardEvents(e, 'keyup'));
			document.removeEventListener('visibilitychange', handleVisibilityChange);
			setShowWinModal(false);
			setShowLoseModal(false);
		};
	}, []);

	useEffect(() => {
		if (!lastMessage) return;

		try {
			const data = JSON.parse(lastMessage.data);
			const state = gameStateRef.current;
			if (data.status === 'win') {
				setShowWinModal(true);
			} else if (data.status === 'lose') {
				setShowLoseModal(true);
			}
			else if (data.status == 'GAME_DATA') {
				setShowWinModal(false);
				setShowLoseModal(false);
			}
			else if (data.update) {
				const { update } = data;
				if (update.left_paddle_pos) {
					state.player1.x = update.left_paddle_pos[0];
					state.player1.y = update.left_paddle_pos[1];
				}
				if (update.right_paddle_pos) {
					state.player2.x = update.right_paddle_pos[0];
					state.player2.y = update.right_paddle_pos[1];
				}
				if (update.ball_pos) {
					state.ball.x = update.ball_pos[0] + state.ball.radius;
					state.ball.y = update.ball_pos[1] + state.ball.radius;
				}
				if (update.left_player_score) {
					state.player1.score = update.left_player_score;
					setScore2(update.left_player_score);
				}
				if (update.right_player_score) {
					state.player2.score = update.right_player_score;
					setScore1(update.right_player_score);
				}
				drawGame();
			} else if (data.config) {
				const { config } = data;
				const canvas = canvasRef.current;

				canvas.width = config.window_size[0];
				canvas.height = config.window_size[1];

				state.gameConfig = config;
				state.net.x = canvas.width / 2 - 2;

				Object.assign(state.player1, {
					width: config.paddles_size[0],
					height: config.paddles_size[1],
					x: config.left_paddle_pos[0],
					y: config.left_paddle_pos[1],
					score: config.left_player_score
				});

				Object.assign(state.player2, {
					width: config.paddles_size[0],
					height: config.paddles_size[1],
					x: config.right_paddle_pos[0],
					y: config.right_paddle_pos[1],
					score: config.right_player_score
				});

				state.ball.radius = config.ball_size[0] / 2;
				state.ball.x = config.ball_pos[0] + state.ball.radius;
				state.ball.y = config.ball_pos[1] + state.ball.radius;

				setScore2(config.left_player_score);
				setScore1(config.right_player_score);

				drawGame();
			}
		} catch (error) {
			console.error('Error processing message:', error);
		}
	}, [lastMessage]);



	const handleModalClose = (isWin) => {
		if (isWin) {
			setShowWinModal(false);
			if (gameType === 'tournament') {
				router.push('/tournament_board');
			} else {
				router.push('/play');
			}
		} else {
			setShowLoseModal(false);
			router.push('/play');
		}
	};

	return (
		<>
			<canvas className={style.play_ground} ref={canvasRef} width={900} height={400} />
			{showWinModal && (
				<YouWin
					gameType={gameType}
					onClose={() => handleModalClose(true)}
				/>
			)}
			{showLoseModal && (
				<YouLose
					onClose={() => handleModalClose(false)}
				/>
			)}
		</>
	);
}