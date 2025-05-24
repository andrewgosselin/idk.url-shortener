import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { UrlScreenshot } from '@/components/url-screenshot';

interface LinkPreviewProps {
  url: string;
}

interface PreviewData {
  title: string;
  description: string;
}

export function LinkPreview({ url }: LinkPreviewProps) {
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!url) {
      setPreviewData(null);
      return;
    }

    const fetchPreview = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch preview');
        }

        const data = await response.json();
        setPreviewData(data);
      } catch (err) {
        console.error('Preview error:', err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchPreview, 500);
    return () => clearTimeout(debounceTimer);
  }, [url]);

  return (
    <Card className={`p-4 transition-all duration-200 ${!url ? 'opacity-50' : ''}`}>
      <div className="flex gap-4">
        <div className="relative h-24 w-32 rounded-lg overflow-hidden bg-muted">
          <UrlScreenshot url={url} />
        </div>
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : previewData ? (
            <>
              <h3 className="font-medium text-sm line-clamp-2">
                {previewData.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {previewData.description}
              </p>
            </>
          ) : (
            <div className="h-full flex flex-col justify-center">
              <p className="text-sm text-muted-foreground">
                {url ? 'No preview available' : 'Enter a URL to see preview'}
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
} 