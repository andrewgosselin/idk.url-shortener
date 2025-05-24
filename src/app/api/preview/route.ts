import { NextResponse } from 'next/server';
import { parse } from 'node-html-parser';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; IDK-URL-Shortener/1.0; +https://idk.url)',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch URL');
    }

    const html = await response.text();
    const root = parse(html);

    // Extract title
    const title = root.querySelector('title')?.text || 
                 root.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
                 root.querySelector('meta[name="twitter:title"]')?.getAttribute('content') ||
                 '';

    // Extract description with multiple fallbacks
    const description = root.querySelector('meta[name="description"]')?.getAttribute('content') ||
                       root.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
                       root.querySelector('meta[name="twitter:description"]')?.getAttribute('content') ||
                       root.querySelector('meta[name="summary"]')?.getAttribute('content') ||
                       '';

    // Try to find the best image
    let image = root.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
               root.querySelector('meta[name="twitter:image"]')?.getAttribute('content') ||
               root.querySelector('link[rel="image_src"]')?.getAttribute('href') ||
               '';

    // If image is relative, make it absolute
    if (image && !image.startsWith('http')) {
      const urlObj = new URL(url);
      image = new URL(image, urlObj.origin).toString();
    }

    return NextResponse.json({
      title: title.trim(),
      description: description.trim(),
      image,
    });
  } catch (error) {
    console.error('Preview error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preview' },
      { status: 500 }
    );
  }
} 