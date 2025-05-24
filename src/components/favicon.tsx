'use client';

import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FaviconProps {
  url: string;
  className?: string;
}

export function Favicon({ url, className }: FaviconProps) {
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchFavicon = async () => {
      try {
        // Try to get favicon from Google's favicon service
        const domain = new URL(url).hostname;
        const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
        
        // Check if the favicon exists
        const response = await fetch(googleFaviconUrl);
        if (response.ok) {
          setFaviconUrl(googleFaviconUrl);
        } else {
          setError(true);
        }
      } catch (err) {
        setError(true);
      }
    };

    fetchFavicon();
  }, [url]);

  if (error || !faviconUrl) {
    return (
      <div className={cn("flex items-center justify-center bg-muted rounded-md", className)}>
        <Globe className="w-4 h-4 text-muted-foreground" />
      </div>
    );
  }

  return (
    <img
      src={faviconUrl}
      alt="Website favicon"
      className={cn("rounded-md", className)}
      onError={() => setError(true)}
    />
  );
} 