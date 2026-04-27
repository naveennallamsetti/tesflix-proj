import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import path from 'path';
import { writeFile } from 'fs/promises';

export async function POST(request) {
  try {
    const formData = await request.formData();
    
    const title = formData.get('title');
    const description = formData.get('description');
    const type = formData.get('type') || 'movie';
    const videoFile = formData.get('videoFile');
    const thumbnailFile = formData.get('thumbnailFile');

    if (!title || !description || !videoFile || !thumbnailFile) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const uploadToLocal = async (file, prefix) => {
      const ext = path.extname(file.name);
      const fileName = `${prefix}-${Date.now()}${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      
      const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);
      await writeFile(filePath, buffer);
      
      return `/uploads/${fileName}`;
    };

    const [videoUrl, thumbnailUrl] = await Promise.all([
      uploadToLocal(videoFile, 'video'),
      uploadToLocal(thumbnailFile, 'thumb')
    ]);

    const video = await prisma.video.create({
      data: {
        title,
        description,
        type,
        videoUrl,
        thumbnailUrl,
      }
    });

    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
