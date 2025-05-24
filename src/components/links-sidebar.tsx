'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useLinksStore } from '@/store/use-links-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Trash2, ExternalLink, BarChart2, Clock, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { QRCodeModal } from '@/components/qr-code-modal';
import { Favicon } from '@/components/favicon';

function formatTimeLeft(expiryDate: Date, now: Date): string {
  const diffInSeconds = Math.floor((expiryDate.getTime() - now.getTime()) / 1000);

  if (diffInSeconds < 0) return 'Expired';

  const days = Math.floor(diffInSeconds / (24 * 60 * 60));
  const hours = Math.floor((diffInSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((diffInSeconds % (60 * 60)) / 60);
  const seconds = diffInSeconds % 60;

  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  if (minutes > 0) return `${minutes}m ${seconds}s left`;
  return `${seconds}s left`;
}

export function LinksSidebar() {
  const { links, removeLink, updateClickCounts } = useLinksStore();
  const { toast } = useToast();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<Record<string, string>>({});
  const [selectedQRUrl, setSelectedQRUrl] = useState<string | null>(null);

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: 'Copied!',
        description: 'URL copied to clipboard.',
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to copy URL.',
      });
    }
  };

  const fetchClickCounts = useCallback(async () => {
    if (links.length === 0) return;

    try {
      const response = await fetch('/api/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slugs: links.map((link) => link.slug) }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const { stats } = await response.json();
      updateClickCounts(stats);
    } catch (error) {
      console.error('Failed to fetch click counts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [links.length, updateClickCounts]);

  // Update countdown timers
  useEffect(() => {
    const updateTimeLeft = () => {
      const now = new Date();
      const newTimeLeft: Record<string, string> = {};

      links.forEach((link) => {
        if (link.expiresAt) {
          const expiryDate = new Date(link.expiresAt);
          if (expiryDate > now) {
            newTimeLeft[link.slug] = formatTimeLeft(expiryDate, now);
          } else {
            newTimeLeft[link.slug] = 'Expired';
          }
        }
      });

      setTimeLeft(newTimeLeft);
    };

    // Update immediately and then every second
    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [links]);

  useEffect(() => {
    if (links.length === 0) {
      setIsLoading(false);
      return;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    fetchClickCounts();
    intervalRef.current = setInterval(fetchClickCounts, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [links.length, fetchClickCounts]);

  const handleDelete = async (slug: string) => {
    try {
      // Delete from the server
      const response = await fetch(`/api/delete/${slug}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete URL');
      }

      // Remove from local store
      removeLink(slug);

      toast({
        title: 'Success',
        description: 'URL has been deleted.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete URL',
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="w-80"
    >
      <Card className="h-[calc(100vh-2rem)] sticky top-4">
        <CardHeader>
          <CardTitle>Your Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 overflow-y-auto max-h-[calc(100vh-8rem)]">
          <AnimatePresence mode="popLayout">
            {links.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-muted-foreground py-8"
              >
                No links yet
              </motion.div>
            ) : (
              links.map((link, index) => (
                <motion.div
                  key={link.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className={cn(
                    "p-3 rounded-lg border bg-card text-card-foreground",
                    link.expiresAt && "border-dashed border-muted-foreground/50"
                  )}
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Favicon url={link.url} className="w-4 h-4" />
                          <p className="text-sm font-medium truncate">{link.url}</p>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {link.shortUrl}
                        </p>
                        <div className="flex flex-col gap-1 mt-2">
                          <motion.div 
                            className="flex items-center gap-1"
                            initial={false}
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 0.3 }}
                            key={link.clicks}
                          >
                            <BarChart2 className="h-3 w-3 text-muted-foreground" />
                            {isLoading ? (
                              <Skeleton className="h-3 w-12" />
                            ) : (
                              <p className="text-xs text-muted-foreground">
                                {link.clicks} clicks
                              </p>
                            )}
                          </motion.div>
                          {link.expiresAt && (
                            <motion.div 
                              className="flex items-center gap-1"
                              initial={false}
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 0.3 }}
                              key={timeLeft[link.slug]}
                            >
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">
                                {timeLeft[link.slug]}
                              </p>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-1 pt-2 border-t">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(link.shortUrl)}
                        title="Copy URL"
                        className="h-8 w-8"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedQRUrl(link.shortUrl)}
                        title="Show QR Code"
                        className="h-8 w-8"
                      >
                        <QrCode className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        title="Open URL"
                        className="h-8 w-8"
                      >
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(link.slug)}
                        title="Delete URL"
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      <AnimatePresence>
        {selectedQRUrl && (
          <QRCodeModal
            url={selectedQRUrl}
            onClose={() => setSelectedQRUrl(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
} 