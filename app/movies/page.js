import VideoCarousel from '@/components/VideoCarousel';
import { prisma } from '@/lib/prisma';

export const metadata = {
  title: 'Movies - Tesflix',
};

export default async function MoviesPage() {
  const movies = await prisma.video.findMany({
    where: { type: 'movie' },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div style={{ padding: '20px 4%' }}>
      <h1 style={{ color: 'white', marginBottom: '20px', fontSize: '2rem' }}>Movies</h1>
      <VideoCarousel title="All Movies" videos={movies} />
      {movies.length === 0 && (
        <p style={{ color: '#b3b3b3' }}>No movies available yet.</p>
      )}
    </div>
  );
}
