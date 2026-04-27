'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './VideoCard.module.css';

export default function VideoCard({ video }) {
  const router = useRouter();

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent navigating to the video page

    if (confirm(`Are you sure you want to delete "${video.title}"?`)) {
      try {
        const res = await fetch(`/api/videos/${video.id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          router.refresh();
        } else {
          console.error('Failed to delete video');
        }
      } catch (error) {
        console.error('Error deleting video:', error);
      }
    }
  };

  return (
    <Link href={`/video/${video.id}`} className={styles.card}>
      <button 
        className={styles.deleteBtn} 
        onClick={handleDelete}
        title="Delete Video"
      >
        ✕
      </button>
      <div className={styles.imageWrapper}>
        <img src={video.thumbnailUrl} alt={video.title} className={styles.thumbnail} />
      </div>
      <div className={styles.info}>
        <h3 className={styles.title}>{video.title}</h3>
      </div>
    </Link>
  );
}
