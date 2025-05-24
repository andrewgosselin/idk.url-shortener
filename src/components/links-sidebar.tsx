'use client';

import { useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLinksStore } from '@/store/use-links-store';
import { ExternalLink, Trash2, QrCode } from 'lucide-react';
import { QRCodeModal } from '@/components/qr-code-modal';
import { useState } from 'react';
import { Favicon } from '@/components/favicon';
import { DeleteModal } from '@/components/delete-modal';

export function LinksSidebar() {
  const { links, removeLink, updateClickCounts } = useLinksStore();
  const [selectedQRUrl, setSelectedQRUrl] = useState<string | null>(null);
  const [selectedDeleteUrl, setSelectedDeleteUrl] = useState<string | null>(null);

  const fetchClickCounts = useCallback(async () => {
    if (links.length === 0) return;

    try {
      const slugs = links.map(link => link.slug).join(',');
      const response = await fetch(`/api/stats?slugs=${slugs}`);
      const data = await response.json();

      if (response.ok) {
        updateClickCounts(data);
      }
    } catch (error) {
      console.error('Failed to fetch click counts:', error);
    }
  }, [links, updateClickCounts]);

  useEffect(() => {
    fetchClickCounts();
    const interval = setInterval(fetchClickCounts, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [fetchClickCounts]);

  const handleDelete = async (slug: string) => {
    try {
      const response = await fetch(`/api/links/${slug}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        removeLink(slug);
        setSelectedDeleteUrl(null);
      }
    } catch (error) {
      console.error('Failed to delete link:', error);
    }
  };

  const handleDeleteAll = async () => {
    try {
      const response = await fetch('/api/links', {
        method: 'DELETE',
      });

      if (response.ok) {
        links.forEach(link => removeLink(link.slug));
        setSelectedDeleteUrl(null);
      }
    } catch (error) {
      console.error('Failed to delete all links:', error);
    }
  };

  if (links.length === 0) {
    return (
      <Card className="p-4 h-full">
        <div className="text-center text-muted-foreground">
          <p>No links yet</p>
          <p className="text-sm">Create your first short link above</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 h-full overflow-y-auto">
      <div className="space-y-4">
        {links.map((link) => (
          <div
            key={link.slug}
            className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-start gap-2">
              <Favicon url={link.url} className="w-4 h-4 mt-1" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <a
                    href={link.shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium hover:underline truncate"
                  >
                    {link.shortUrl}
                  </a>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => window.open(link.url, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {link.url}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {link.clicks} clicks
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setSelectedQRUrl(link.shortUrl)}
                  >
                    <QrCode className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setSelectedDeleteUrl(link.slug)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {links.length > 1 && (
        <div className="mt-4">
          <Button
            variant="destructive"
            size="sm"
            className="w-full"
            onClick={() => setSelectedDeleteUrl('all')}
          >
            Delete All Links
          </Button>
        </div>
      )}

      {selectedQRUrl && (
        <QRCodeModal
          url={selectedQRUrl}
          onClose={() => setSelectedQRUrl(null)}
        />
      )}

      {selectedDeleteUrl && (
        <DeleteModal
          onClose={() => setSelectedDeleteUrl(null)}
          onConfirm={() => {
            if (selectedDeleteUrl === 'all') {
              handleDeleteAll();
            } else {
              handleDelete(selectedDeleteUrl);
            }
          }}
          title={selectedDeleteUrl === 'all' ? 'Delete All Links' : 'Delete Link'}
          description={
            selectedDeleteUrl === 'all'
              ? 'Are you sure you want to delete all links? This action cannot be undone.'
              : 'Are you sure you want to delete this link? This action cannot be undone.'
          }
        />
      )}
    </Card>
  );
} 