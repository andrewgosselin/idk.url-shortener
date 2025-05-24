import { NextResponse } from 'next/server';
import { z } from 'zod';

const healthCheckSchema = z.object({
  url: z.string().url(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = healthCheckSchema.parse(body);

    // Add a timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'URL Shortener Health Check',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return NextResponse.json({
          isHealthy: false,
          error: `Server returned ${response.status} ${response.statusText}`,
        });
      }

      return NextResponse.json({ isHealthy: true });
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return NextResponse.json({
            isHealthy: false,
            error: 'Request timed out',
          });
        }

        return NextResponse.json({
          isHealthy: false,
          error: error.message,
        });
      }

      return NextResponse.json({
        isHealthy: false,
        error: 'Failed to check URL health',
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 