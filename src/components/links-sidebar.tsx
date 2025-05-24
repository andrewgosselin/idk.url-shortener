'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useLinksStore } from '@/store/use-links-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Copy, Trash2, ExternalLink, BarChart2, Clock, QrCode, Link2, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { QRCodeModal } from '@/components/qr-code-modal';
import { Favicon } from '@/components/favicon';
import { DeleteModal } from '@/components/delete-modal';

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  const handleDeleteAll = async () => {
    try {
      // Delete all links from the server
      const response = await fetch('/api/delete-all', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete all URLs');
      }

      // Remove all links from local store
      links.forEach((link) => removeLink(link.slug));

      toast({
        title: 'Success',
        description: 'All URLs have been deleted.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete all URLs',
      });
    }
  };

  return (
    <div className="w-full h-full">
      <Card className="w-full h-full border bg-background/50 backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">Recent Links</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDeleteModal(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Your recently shortened URLs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {links.map((link) => (
              <motion.div
                key={link.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-primary/60 rounded-lg blur opacity-0 group-hover:opacity-25 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative p-3 rounded-lg border bg-background/50 backdrop-blur-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Favicon url={link.url} className="w-4 h-4 shrink-0" />
                        <p className="text-sm font-medium truncate">
                          {link.url}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Link2 className="h-3 w-3" />
                        <a
                          href={`/${link.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline truncate"
                        >
                          {link.slug}
                        </a>
                        {link.hasPassword && (
                          <Lock className="h-3 w-3" />
                        )}
                        {link.expiresAt && (
                          <Clock className="h-3 w-3" />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          setSelectedQRUrl(`/${link.slug}`);
                        }}
                      >
                        <QrCode className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          navigator.clipboard.writeText(`/${link.slug}`);
                          toast({
                            title: "Copied to clipboard",
                            description: "The short URL has been copied to your clipboard.",
                          });
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {showDeleteModal && (
          <DeleteModal
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleDeleteAll}
          />
        )}
        {selectedQRUrl && (
          <QRCodeModal
            url={selectedQRUrl}
            onClose={() => setSelectedQRUrl(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
} 