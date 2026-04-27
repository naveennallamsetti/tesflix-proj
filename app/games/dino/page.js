'use client';
import { useEffect, useRef, useState } from 'react';
import styles from './Dino.module.css';
import Link from 'next/link';

export default function DinoGame() {
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    // Load high score
    const saved = localStorage.getItem('dinoHighScore');
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Game state variables
    let animationFrameId;
    let frames = 0;
    let currentScore = 0;
    
    const dino = {
      x: 50,
      y: canvas.height - 40,
      width: 40,
      height: 40,
      dy: 0,
      jumpForce: 13,
      gravity: 0.6,
      grounded: true,
      draw() {
        ctx.fillStyle = '#4ade80'; // Green dino
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Eye
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 25, this.y + 5, 5, 5);
      },
      jump() {
        if (this.grounded) {
          this.dy = -this.jumpForce;
          this.grounded = false;
        }
      },
      update() {
        // Apply gravity
        this.y += this.dy;
        
        if (this.y + this.height < canvas.height) {
          this.dy += this.gravity;
          this.grounded = false;
        } else {
          this.dy = 0;
          this.grounded = true;
          this.y = canvas.height - this.height;
        }
        
        this.draw();
      }
    };

    const obstacles = [];
    let obstacleSpeed = 6;
    
    class Obstacle {
      constructor() {
        this.width = 20 + Math.random() * 20;
        this.height = 30 + Math.random() * 40;
        this.x = canvas.width;
        this.y = canvas.height - this.height;
      }
      
      draw() {
        ctx.fillStyle = '#ef4444'; // Red cactus/obstacle
        ctx.fillRect(this.x, this.y, this.width, this.height);
      }
      
      update() {
        this.x -= obstacleSpeed;
        this.draw();
      }
    }

    const drawGround = () => {
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      ctx.lineTo(canvas.width, canvas.height);
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 4;
      ctx.stroke();
    };

    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault(); // Prevent scrolling
        if (!isPlaying && !gameOver) {
          setIsPlaying(true);
        } else if (gameOver) {
          setGameOver(false);
          setScore(0);
          setIsPlaying(true);
        } else {
          dino.jump();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    const endGame = () => {
      setGameOver(true);
      setIsPlaying(false);
      
      if (currentScore > highScore) {
        setHighScore(currentScore);
        localStorage.setItem('dinoHighScore', currentScore);
      }
    };

    const loop = () => {
      if (!isPlaying || gameOver) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      drawGround();
      dino.update();

      // Spawn obstacles
      if (frames % Math.floor(Math.random() * 60 + 60) === 0) {
        obstacles.push(new Obstacle());
      }

      for (let i = 0; i < obstacles.length; i++) {
        let obs = obstacles[i];
        obs.update();

        // Collision detection
        if (
          dino.x < obs.x + obs.width &&
          dino.x + dino.width > obs.x &&
          dino.y < obs.y + obs.height &&
          dino.y + dino.height > obs.y
        ) {
          endGame();
          return; // Stop the loop
        }

        // Remove off-screen obstacles
        if (obs.x + obs.width < 0) {
          obstacles.splice(i, 1);
          i--;
          currentScore += 10;
          setScore(currentScore);
          
          if (currentScore % 100 === 0) {
            obstacleSpeed += 1;
          }
        }
      }

      frames++;
      animationFrameId = requestAnimationFrame(loop);
    };

    if (isPlaying && !gameOver) {
      loop();
    } else if (!isPlaying && !gameOver) {
      // Draw initial state
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGround();
      dino.draw();
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlaying, gameOver, highScore]);

  return (
    <div className={styles.container}>
      <Link href="/games" className={styles.backBtn}>&larr; Back to Arcade</Link>
      
      <div className={styles.gameArea}>
        <div className={styles.header}>
          <h1 className={styles.title}>Dino Runner</h1>
          <div className={styles.scores}>
            <span className={styles.score}>Score: {score}</span>
            <span className={styles.highScore}>HI: {highScore}</span>
          </div>
        </div>

        <div className={styles.canvasContainer}>
          <canvas 
            ref={canvasRef} 
            width={800} 
            height={300} 
            className={styles.canvas}
            onClick={() => {
              if (!isPlaying && !gameOver) setIsPlaying(true);
              if (gameOver) {
                setGameOver(false);
                setScore(0);
                setIsPlaying(true);
              }
            }}
          />
          
          {!isPlaying && !gameOver && (
            <div className={styles.overlay}>
              <p>Press <kbd>Space</kbd> or Click to Start</p>
            </div>
          )}
          
          {gameOver && (
            <div className={styles.overlay}>
              <h2>Game Over</h2>
              <p>Score: {score}</p>
              <button 
                className={styles.restartBtn}
                onClick={() => {
                  setGameOver(false);
                  setScore(0);
                  setIsPlaying(true);
                }}
              >
                Play Again
              </button>
            </div>
          )}
        </div>
        
        <p className={styles.instructions}>
          Use <strong>Space</strong> or <strong>Up Arrow</strong> to jump. Dodge the red obstacles!
        </p>
      </div>
    </div>
  );
}
