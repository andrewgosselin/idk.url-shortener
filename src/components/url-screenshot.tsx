import { useEffect, useState, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Link2 } from 'lucide-react';
import Image from 'next/image';

interface UrlScreenshotProps {
  url: string;
  className?: string;
}

export function UrlScreenshot({ url, className = '' }: UrlScreenshotProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const imageUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!url) {
      setImageUrl(null);
      imageUrlRef.current = null;
      return;
    }

    const fetchScreenshot = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/screenshot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch screenshot');
        }

        const blob = await response.blob();
        const newImageUrl = URL.createObjectURL(blob);
        
        // Clean up old URL if it exists
        if (imageUrlRef.current) {
          URL.revokeObjectURL(imageUrlRef.current);
        }
        
        imageUrlRef.current = newImageUrl;
        setImageUrl(newImageUrl);
      } catch (err) {
        setError('Failed to load screenshot');
        console.error('Screenshot error:', err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchScreenshot, 500);
    return () => {
      clearTimeout(debounceTimer);
      if (imageUrlRef.current) {
        URL.revokeObjectURL(imageUrlRef.current);
        imageUrlRef.current = null;
      }
    };
  }, [url]); // Only depend on url changes

  if (loading) {
    return <Skeleton className={`w-full h-full ${className}`} />;
  }

  if (error || !url) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-muted rounded-lg ${className}`}>
        <Link2 className="h-8 w-8 text-muted-foreground" />
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-muted rounded-lg ${className}`}>
        <span className="text-sm text-muted-foreground">No preview</span>
      </div>
    );
  }

  return (
    <Image
      src={imageUrl}
      alt="URL preview"
      className={`w-full h-full object-cover rounded-lg ${className}`}
      width={320}
      height={240}
    />
  );
} 