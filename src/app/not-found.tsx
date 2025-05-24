import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">404</h1>
        <h2 className="text-2xl font-semibold">Short URL Not Found</h2>
        <p className="text-muted-foreground">
          The short URL you're looking for doesn't exist.
        </p>
        <Button asChild>
          <Link href="/">Create a new short URL</Link>
        </Button>
      </div>
    </main>
  );
} 