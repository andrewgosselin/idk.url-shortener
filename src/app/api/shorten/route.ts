import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';

const urlSchema = z.object({
  url: z.string().url(),
  expiresAt: z.string().optional(),
  password: z.string().min(4).optional(),
});

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, expiresAt, password } = urlSchema.parse(body);

    // Generate a unique slug
    const slug = nanoid(6);

    // Hash the password if provided
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    // Create the short URL
    const shortUrl = await prisma.shortUrl.create({
      data: {
        slug,
        url,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        password: hashedPassword,
      },
    });

    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';

    return NextResponse.json({
      slug: shortUrl.slug,
      shortUrl: `${protocol}://${host}/${shortUrl.slug}`,
    });
  } catch (error) {
    console.error('Shorten error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 