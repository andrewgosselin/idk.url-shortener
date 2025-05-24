import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Delete the short URL from the database
    await prisma.shortUrl.delete({
      where: { slug },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete URL' }, { status: 500 });
  }
} 