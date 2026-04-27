'use client';
import { useState } from 'react';
import Link from 'next/link';
import styles from './TicTacToe.module.css';

export default function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const winner = calculateWinner(board);
  const isDraw = !winner && board.every((square) => square !== null);
  
  const handleClick = (i) => {
    if (board[i] || winner) return;
    
    const newBoard = [...board];
    newBoard[i] = xIsNext ? 'X' : 'O';
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
  };

  const renderSquare = (i) => {
    return (
      <button 
        className={`${styles.square} ${board[i] === 'X' ? styles.x : board[i] === 'O' ? styles.o : ''}`}
        onClick={() => handleClick(i)}
      >
        {board[i]}
      </button>
    );
  };

  let status;
  if (winner) {
    status = `Winner: ${winner}`;
  } else if (isDraw) {
    status = 'Draw!';
  } else {
    status = `Next player: ${xIsNext ? 'X' : 'O'}`;
  }

  return (
    <div className={styles.container}>
      <Link href="/games" className={styles.backBtn}>&larr; Back to Arcade</Link>
      
      <div className={styles.gameArea}>
        <h1 className={styles.title}>Tic Tac Toe</h1>
        
        <div className={styles.statusBox}>
          <h2 className={`${styles.status} ${winner ? styles.winnerText : isDraw ? styles.drawText : ''}`}>
            {status}
          </h2>
        </div>
        
        <div className={styles.board}>
          <div className={styles.boardRow}>
            {renderSquare(0)}
            {renderSquare(1)}
            {renderSquare(2)}
          </div>
          <div className={styles.boardRow}>
            {renderSquare(3)}
            {renderSquare(4)}
            {renderSquare(5)}
          </div>
          <div className={styles.boardRow}>
            {renderSquare(6)}
            {renderSquare(7)}
            {renderSquare(8)}
          </div>
        </div>
        
        <button className={styles.resetBtn} onClick={resetGame}>
          Restart Game
        </button>
      </div>
    </div>
  );
}
