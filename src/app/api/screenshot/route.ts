import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 720 });
      
      // Set a timeout for page load
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 5000 });
      
      // Take screenshot
      const screenshot = await page.screenshot({
        type: 'jpeg',
        quality: 80,
        clip: {
          x: 0,
          y: 0,
          width: 1280,
          height: 720,
        },
      });

      return new NextResponse(screenshot, {
        headers: {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public, max-age=31536000',
        },
      });
    } finally {
      await browser.close();
    }
  } catch (error) {
    console.error('Screenshot error:', error);
    return NextResponse.json(
      { error: 'Failed to take screenshot' },
      { status: 500 }
    );
  }
} 