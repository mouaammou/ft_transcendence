// Canvas futuristic design for a ping pong game with integrated logic and WebSocket connection
"use client";

import { useEffect, useRef } from "react";

export default function FuturisticPongCanvas({
  score1,
  score2,
  setScore1,
  setScore2,
  leftNickname,
  rightNickname,
  playStart,
  websocketURL
}) {
  const canvasRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Set canvas dimensions
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Colors and gradient for a futuristic look
    const backgroundGradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    backgroundGradient.addColorStop(0, "#0f2027"); // Deep teal
    backgroundGradient.addColorStop(0.5, "#203a43"); // Darker teal
    backgroundGradient.addColorStop(1, "#2c5364"); // Dark gray-blue

    // Neon effect for paddles and ball
    const drawNeonRect = (x, y, width, height, color) => {
      context.shadowBlur = 20;
      context.shadowColor = color;
      context.fillStyle = color;
      context.fillRect(x, y, width, height);
      context.shadowBlur = 0; // Reset shadow
    };

    const drawNeonCircle = (x, y, radius, color) => {
      context.shadowBlur = 20;
      context.shadowColor = color;
      context.fillStyle = color;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
      context.shadowBlur = 0; // Reset shadow
    };

    // Draw futuristic net with glowing lines
    const drawFuturisticNet = () => {
      const netWidth = 4;
      const netHeight = 20;
      const netColor = "#00ffcc";
      for (let y = 0; y < canvas.height; y += 30) {
        drawNeonRect(canvas.width / 2 - netWidth / 2, y, netWidth, netHeight, netColor);
      }
    };

    // Paddle positions
    let leftPaddleY = canvas.height / 2 - 50;
    let rightPaddleY = canvas.height / 2 - 50;

    // Ball properties
    let ballX = canvas.width / 2;
    let ballY = canvas.height / 2;
    let ballSpeedX = 4;
    let ballSpeedY = 4;
    const ballRadius = 10;

    // WebSocket connection
    socketRef.current = new WebSocket('ws://localhost:8000/ws/local/');

    socketRef.current.onopen = () => {
      console.log("WebSocket connected");
    };

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "update") {
        // Sync game state
        ballX = data.ballX;
        ballY = data.ballY;
        leftPaddleY = data.leftPaddleY;
        rightPaddleY = data.rightPaddleY;
      }
    };

    socketRef.current.onclose = () => {
      console.log("WebSocket disconnected");
    };

    // Update game logic
    const updateGame = () => {
      if (!playStart) return;

      // Move ball
      ballX += ballSpeedX;
      ballY += ballSpeedY;

      // Ball collision with top and bottom walls
      if (ballY - ballRadius < 0 || ballY + ballRadius > canvas.height) {
        ballSpeedY *= -1;
      }

      // Ball collision with paddles
      if (
        ballX - ballRadius < 60 &&
        ballY > leftPaddleY &&
        ballY < leftPaddleY + 100
      ) {
        ballSpeedX *= -1;
      } else if (
        ballX + ballRadius > canvas.width - 60 &&
        ballY > rightPaddleY &&
        ballY < rightPaddleY + 100
      ) {
        ballSpeedX *= -1;
      }

      // Ball goes out of bounds
      if (ballX - ballRadius < 0) {
        setScore2((prev) => prev + 1);
        resetBall();
      } else if (ballX + ballRadius > canvas.width) {
        setScore1((prev) => prev + 1);
        resetBall();
      }

      // Send game state to server
      socketRef.current.send(
        JSON.stringify({
          type: "update",
          ballX,
          ballY,
          leftPaddleY,
          rightPaddleY
        })
      );
    };

    const resetBall = () => {
      ballX = canvas.width / 2;
      ballY = canvas.height / 2;
      ballSpeedX *= -1;
    };

    // Animate the game elements
    const animate = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Redraw the background
      context.fillStyle = backgroundGradient;
      context.fillRect(0, 0, canvas.width, canvas.height);

      // Draw game elements
      drawFuturisticNet();
      drawNeonRect(50, leftPaddleY, 10, 100, "#ff00ff"); // Left paddle
      drawNeonRect(canvas.width - 60, rightPaddleY, 10, 100, "#00ffff"); // Right paddle
      drawNeonCircle(ballX, ballY, ballRadius, "#ffffff"); // Ball

      updateGame();
      requestAnimationFrame(animate);
    };

    animate();

    // Resize canvas on window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Cleanup on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
      socketRef.current.close();
    };
  }, [playStart, setScore1, setScore2, websocketURL]);

  return <canvas ref={canvasRef} className="bg-black w-full h-full" />;
}
