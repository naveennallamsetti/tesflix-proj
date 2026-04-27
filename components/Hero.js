import styles from './Hero.module.css';
import Link from 'next/link';

export default function Hero({ video }) {
  if (!video) return <div className={styles.heroFallback}></div>;

  return (
    <div className={styles.hero}>
      <div className={styles.imageContainer}>
        <video 
          src={video.videoUrl} 
          autoPlay 
          loop 
          muted 
          playsInline
          className={styles.image}
        />
        <div className={styles.overlay}></div>
      </div>
      <div className={styles.content}>
        <h1 className={styles.title}>{video.title}</h1>
        <p className={styles.description}>{video.description}</p>
        <div className={styles.actions}>
          <Link href={`/video/${video.id}`} className={styles.playBtn}>
            <span className={styles.playIcon}>▶</span> Play
          </Link>
        </div>
      </div>
    </div>
  );
}
