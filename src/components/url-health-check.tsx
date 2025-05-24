import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UrlHealthCheckProps {
  url: string;
  className?: string;
  onStatusChange?: (status: 'checking' | 'healthy' | 'unhealthy' | null) => void;
}

export function UrlHealthCheck({ url, className, onStatusChange }: UrlHealthCheckProps) {
  const [status, setStatus] = useState<'checking' | 'healthy' | 'unhealthy' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = useCallback(async (urlToCheck: string) => {
    if (!urlToCheck) {
      setStatus(null);
      onStatusChange?.(null);
      return;
    }

    setStatus('checking');
    onStatusChange?.('checking');
    setError(null);

    try {
      // Add a small delay to prevent rapid checks
      await new Promise(resolve => setTimeout(resolve, 500));

      const response = await fetch('/api/health-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToCheck }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check URL health');
      }

      const newStatus = data.isHealthy ? 'healthy' : 'unhealthy';
      setStatus(newStatus);
      onStatusChange?.(newStatus);
      
      if (!data.isHealthy) {
        setError(data.error || 'URL is not accessible');
      }
    } catch (err) {
      setStatus('unhealthy');
      onStatusChange?.('unhealthy');
      setError(err instanceof Error ? err.message : 'Failed to check URL health');
    }
  }, [onStatusChange]);

  // Debounced health check
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (url) {
        checkHealth(url);
      } else {
        setStatus(null);
        onStatusChange?.(null);
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [url, checkHealth, onStatusChange]);

  if (!url) return null;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {status === 'checking' && (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      )}
      {status === 'healthy' && (
        <CheckCircle2 className="h-4 w-4 text-green-500" />
      )}
      {status === 'unhealthy' && (
        <div className="group relative">
          <XCircle className="h-4 w-4 text-red-500" />
          {error && (
            <div className="absolute bottom-full right-0 mb-2 hidden w-48 rounded-md bg-popover p-2 text-xs text-popover-foreground shadow-md group-hover:block">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 