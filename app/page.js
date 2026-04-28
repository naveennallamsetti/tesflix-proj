import Hero from '@/components/Hero';
import VideoCarousel from '@/components/VideoCarousel';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let videos = [];
  try {
    videos = await prisma.video.findMany({
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error("Database connection failed, showing empty state.");
  }

  const featuredVideo = videos.length > 0 ? videos[0] : null;

  return (
    <div>
      <Hero video={featuredVideo} />
      <div style={{ marginTop: '-10vh', position: 'relative', zIndex: 10 }}>
        <VideoCarousel title="Recently Added" videos={videos} />
      </div>
    </div>
  );
}
