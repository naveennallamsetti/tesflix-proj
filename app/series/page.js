import VideoCarousel from '@/components/VideoCarousel';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Series - Tesflix',
};

export default async function SeriesPage() {
  let series = [];
  try {
    series = await prisma.video.findMany({
      where: { type: 'series' },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error("Database connection failed, showing empty state.");
  }

  return (
    <div style={{ padding: '20px 4%' }}>
      <h1 style={{ color: 'white', marginBottom: '20px', fontSize: '2rem' }}>TV Series</h1>
      <VideoCarousel title="All Series" videos={series} />
      {series.length === 0 && (
        <p style={{ color: '#b3b3b3' }}>No series available yet.</p>
      )}
    </div>
  );
}
