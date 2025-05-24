import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export async function GET(
  request: Request,
  { params }: {
    params: Promise<{
      slug: string;
    }>;
  }
) {
  try {
    const { slug } = await params;
    const cookieStore = await cookies();

    const shortUrl = await prisma.shortUrl.findUnique({
      where: { slug },
    });

    if (!shortUrl) {
      return NextResponse.json({ error: 'URL not found' }, { status: 404 });
    }

    // Check if URL has expired
    if (shortUrl.expiresAt && new Date(shortUrl.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'URL has expired' }, { status: 410 });
    }

    // Check if URL is password protected
    if (shortUrl.password) {
      const storedPassword = cookieStore.get('password_' + slug)?.value;

      if (!storedPassword) {
        return NextResponse.json({ error: 'Password required' }, { status: 401 });
      }

      // Verify the stored password
      const isValid = await bcrypt.compare(storedPassword, shortUrl.password);
      if (!isValid) {
        // Clear the invalid cookie
        const response = NextResponse.json({ error: 'Invalid password' }, { status: 401 });
        response.cookies.delete('password_' + slug);
        return response;
      }
    }

    // Increment click count
    try {
      const updated = await prisma.shortUrl.update({
        where: { slug },
        data: { clicks: { increment: 1 } },
      });
      console.log('Updated click count:', updated.clicks);
    } catch (error) {
      console.error('Failed to update click count:', error);
    }

    // Set cache control headers
    const headers = new Headers();
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');

    return NextResponse.redirect(shortUrl.url, {
      headers,
    });
  } catch (error) {
    console.error('Redirect error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { password } = await request.json();

    const shortUrl = await prisma.shortUrl.findUnique({
      where: { slug },
    });

    if (!shortUrl) {
      return NextResponse.json({ error: 'URL not found' }, { status: 404 });
    }

    if (!shortUrl.password) {
      return NextResponse.json({ error: 'URL is not password protected' }, { status: 400 });
    }

    const isValid = await bcrypt.compare(password, shortUrl.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    // Set the password cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set('password_' + slug, password, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    return response;
  } catch (error) {
    console.error('Password verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 