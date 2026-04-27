'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import styles from './Snake.module.css';

const GRID_SIZE = 20;
const CANVAS_SIZE = 400;

export default function SnakeGame() {
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  // Game state refs (to avoid closure issues in loops)
  const snakeRef = useRef([{ x: 10, y: 10 }]);
  const foodRef = useRef({ x: 15, y: 15 });
  const dirRef = useRef({ x: 1, y: 0 }); // Moving right
  const nextDirRef = useRef({ x: 1, y: 0 });

  useEffect(() => {
    const saved = localStorage.getItem('snakeHighScore');
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  const spawnFood = useCallback(() => {
    let newFood;
    let isOccupied = true;
    while (isOccupied) {
      newFood = {
        x: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)),
        y: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE))
      };
      
      // eslint-disable-next-line no-loop-func
      isOccupied = snakeRef.current.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    }
    foodRef.current = newFood;
  }, []);

  const resetGame = useCallback(() => {
    snakeRef.current = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    dirRef.current = { x: 1, y: 0 };
    nextDirRef.current = { x: 1, y: 0 };
    setScore(0);
    setGameOver(false);
    spawnFood();
  }, [spawnFood]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }

      const { x: dx, y: dy } = dirRef.current;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          if (dy !== 1) nextDirRef.current = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
        case 's':
          if (dy !== -1) nextDirRef.current = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
        case 'a':
          if (dx !== 1) nextDirRef.current = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
        case 'd':
          if (dx !== -1) nextDirRef.current = { x: 1, y: 0 };
          break;
        case 'Enter':
        case ' ':
          if (!isPlaying && !gameOver) setIsPlaying(true);
          if (gameOver) {
            resetGame();
            setIsPlaying(true);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, gameOver, resetGame]);

  useEffect(() => {
    if (!isPlaying) return;
    
    let intervalId;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const gameLoop = () => {
      if (gameOver) return;

      // Update direction
      dirRef.current = nextDirRef.current;
      const head = { ...snakeRef.current[0] };
      head.x += dirRef.current.x;
      head.y += dirRef.current.y;

      // Wall collision
      if (
        head.x < 0 || 
        head.x >= CANVAS_SIZE / GRID_SIZE || 
        head.y < 0 || 
        head.y >= CANVAS_SIZE / GRID_SIZE
      ) {
        handleGameOver();
        return;
      }

      // Self collision
      if (snakeRef.current.some(segment => segment.x === head.x && segment.y === head.y)) {
        handleGameOver();
        return;
      }

      snakeRef.current.unshift(head);

      // Food collision
      if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
        const newScore = score + 10;
        setScore(newScore);
        spawnFood();
      } else {
        snakeRef.current.pop();
      }

      draw(ctx);
    };

    const handleGameOver = () => {
      setGameOver(true);
      setIsPlaying(false);
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('snakeHighScore', score.toString());
      }
    };

    const draw = (ctx) => {
      // Clear canvas
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // Draw grid (optional)
      ctx.strokeStyle = '#1f2937';
      for (let i = 0; i <= CANVAS_SIZE; i += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, CANVAS_SIZE);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(CANVAS_SIZE, i);
        ctx.stroke();
      }

      // Draw food
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(
        foodRef.current.x * GRID_SIZE + GRID_SIZE / 2, 
        foodRef.current.y * GRID_SIZE + GRID_SIZE / 2, 
        GRID_SIZE / 2.5, 
        0, 
        2 * Math.PI
      );
      ctx.fill();

      // Draw snake
      snakeRef.current.forEach((segment, index) => {
        // Gradient from head to tail
        const ratio = index / snakeRef.current.length;
        const colorValue = Math.floor(255 - (ratio * 150));
        ctx.fillStyle = index === 0 ? '#f472b6' : `rgb(${colorValue}, 114, 182)`;
        
        // Draw segment slightly smaller than grid size for gaps
        ctx.fillRect(
          segment.x * GRID_SIZE + 1, 
          segment.y * GRID_SIZE + 1, 
          GRID_SIZE - 2, 
          GRID_SIZE - 2
        );
      });
    };

    // Initial draw
    if (snakeRef.current.length === 1) {
      resetGame();
    }
    draw(ctx);

    // Speed increases slightly as snake grows
    const speed = Math.max(70, 150 - (snakeRef.current.length * 2));
    intervalId = setInterval(gameLoop, speed);

    return () => clearInterval(intervalId);
  }, [isPlaying, gameOver, score, highScore, spawnFood, resetGame]);

  // Make sure to draw the initial state even when not playing yet
  useEffect(() => {
    if (isPlaying || gameOver) return;
    
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      
      // Initial state drawing logic mirrored
      ctx.fillStyle = '#f472b6';
      ctx.fillRect(10 * GRID_SIZE + 1, 10 * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2);
      ctx.fillRect(9 * GRID_SIZE + 1, 10 * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2);
      ctx.fillRect(8 * GRID_SIZE + 1, 10 * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2);
    }
  }, [isPlaying, gameOver]);

  return (
    <div className={styles.container}>
      <Link href="/games" className={styles.backBtn}>&larr; Back to Arcade</Link>
      
      <div className={styles.gameArea}>
        <div className={styles.header}>
          <h1 className={styles.title}>Snake</h1>
          <div className={styles.scores}>
            <span className={styles.score}>Score: {score}</span>
            <span className={styles.highScore}>HI: {highScore}</span>
          </div>
        </div>

        <div className={styles.canvasContainer}>
          <canvas 
            ref={canvasRef} 
            width={CANVAS_SIZE} 
            height={CANVAS_SIZE} 
            className={styles.canvas}
          />
          
          {!isPlaying && !gameOver && (
            <div className={styles.overlay}>
              <button 
                className={styles.startBtn}
                onClick={() => setIsPlaying(true)}
              >
                Start Game
              </button>
              <p>Use Arrow Keys or WASD to move.</p>
            </div>
          )}
          
          {gameOver && (
            <div className={styles.overlay}>
              <h2>Game Over</h2>
              <p>Score: {score}</p>
              <button 
                className={styles.startBtn}
                onClick={() => {
                  resetGame();
                  setIsPlaying(true);
                }}
              >
                Play Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
