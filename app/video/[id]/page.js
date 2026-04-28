import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import styles from './video.module.css';

export const dynamic = 'force-dynamic';

export default async function VideoPage({ params }) {
  const { id } = await params;
  
  const video = await prisma.video.findUnique({
    where: { id }
  });

  if (!video) {
    notFound();
  }

  return (
    <div className={styles.container}>
      <div className={styles.playerWrapper}>
        <video 
          controls 
          autoPlay 
          className={styles.player}
          poster={video.thumbnailUrl}
        >
          <source src={video.videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <div className={styles.info}>
        <h1 className={styles.title}>{video.title}</h1>
        <p className={styles.date}>Added {new Date(video.createdAt).toLocaleDateString()}</p>
        <p className={styles.description}>{video.description}</p>
      </div>
    </div>
  );
}
