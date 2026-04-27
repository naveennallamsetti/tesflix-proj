import Link from 'next/link';
import styles from './Games.module.css';

export const metadata = {
  title: 'Games | Tesflix',
  description: 'Play some fun games on Tesflix!',
};

export default function GamesPage() {
  const games = [
    {
      id: 'dino',
      name: 'Dino Runner',
      description: 'The classic offline dinosaur game. Jump over cacti and survive as long as you can!',
      path: '/games/dino',
      image: '🦖',
      color: '#4ade80'
    },
    {
      id: 'tictactoe',
      name: 'Tic Tac Toe',
      description: 'Classic 3x3 game. Play against a friend locally.',
      path: '/games/tictactoe',
      image: '❌⭕',
      color: '#60a5fa'
    },
    {
      id: 'snake',
      name: 'Snake',
      description: 'Eat food to grow your snake, but do not bite yourself!',
      path: '/games/snake',
      image: '🐍',
      color: '#f472b6'
    }
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Tesflix Arcade</h1>
      <p className={styles.subtitle}>Take a break and play some games!</p>
      
      <div className={styles.grid}>
        {games.map((game) => (
          <Link href={game.path} key={game.id} className={styles.card}>
            <div 
              className={styles.cardHeader}
              style={{ backgroundColor: game.color + '20', borderColor: game.color }}
            >
              <span className={styles.icon}>{game.image}</span>
            </div>
            <div className={styles.cardBody}>
              <h2 className={styles.gameName}>{game.name}</h2>
              <p className={styles.gameDesc}>{game.description}</p>
              <span className={styles.playBtn} style={{ color: game.color }}>
                Play Now &rarr;
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
