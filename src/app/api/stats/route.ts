import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { slugs } = await request.json();
    console.log('Fetching stats for slugs:', slugs);

    if (!Array.isArray(slugs)) {
      console.log('Invalid request: slugs is not an array');
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const stats = await prisma.shortUrl.findMany({
      where: {
        slug: {
          in: slugs,
        },
      },
      select: {
        slug: true,
        clicks: true,
      },
    });

    console.log('Stats fetched:', stats);
    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 