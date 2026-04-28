import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';

// The S3Client will automatically use the EC2 Instance Profile credentials!
const s3Client = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });

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

    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    if (!bucketName) {
      return NextResponse.json({ error: 'S3 Bucket Name is not configured on server' }, { status: 500 });
    }

    const uploadToS3 = async (file, prefix) => {
      const ext = path.extname(file.name);
      const fileName = `${prefix}-${Date.now()}${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: `uploads/${fileName}`,
        Body: buffer,
        ContentType: file.type,
      });

      await s3Client.send(command);
      
      // Return the public S3 URL
      return `https://${bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/uploads/${fileName}`;
    };

    const [videoUrl, thumbnailUrl] = await Promise.all([
      uploadToS3(videoFile, 'video'),
      uploadToS3(thumbnailFile, 'thumb')
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

