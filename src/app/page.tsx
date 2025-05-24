'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { Copy, Link2, Clock, Lock } from 'lucide-react';
import { LinksSidebar } from '@/components/links-sidebar';
import { useLinksStore } from '@/store/use-links-store';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { UrlHealthCheck } from '@/components/url-health-check';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Home() {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasExpiry, setHasExpiry] = useState(false);
  const [expiryDate, setExpiryDate] = useState('');
  const [expiryTime, setExpiryTime] = useState('');
  const [urlStatus, setUrlStatus] = useState<'checking' | 'healthy' | 'unhealthy' | null>(null);
  const [hasPassword, setHasPassword] = useState(false);
  const [password, setPassword] = useState('');
  const { toast } = useToast();
  const addLink = useLinksStore((state) => state.addLink);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let expiresAt = undefined;
      if (hasExpiry && expiryDate && expiryTime) {
        expiresAt = new Date(`${expiryDate}T${expiryTime}`).toISOString();
      }

      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url, 
          expiresAt,
          password: hasPassword ? password : undefined 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setShortUrl(data.shortUrl);
      
      // Add to store
      addLink({
        slug: data.slug,
        url,
        shortUrl: data.shortUrl,
        createdAt: new Date().toISOString(),
        clicks: 0,
        expiresAt,
        hasPassword: hasPassword,
      });

      toast({
        title: 'Success!',
        description: 'Your URL has been shortened.',
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err instanceof Error ? err.message : 'Something went wrong',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
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

  return (
    <main className="min-h-screen flex flex-col lg:flex-row items-start justify-center p-4 bg-background">
      <div className="flex flex-col lg:flex-row gap-8 max-w-5xl w-full">
        <div className="flex-1 w-full">
          <div className="w-full">
            <div className="text-center mb-8 lg:mb-12 relative">
              <div className="absolute right-0 top-0">
                <ThemeToggle />
              </div>
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl lg:text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
              >
                IDK. URL Shortener
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-muted-foreground text-base lg:text-lg"
              >
                Create short, memorable links
              </motion.p>
            </div>

            <motion.form 
              onSubmit={handleSubmit} 
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-primary/60 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative">
                  <Input
                    id="url"
                    name="url"
                    type="url"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter URL to shorten"
                    className="w-full p-4 rounded-lg border bg-background/50 backdrop-blur-sm"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <UrlHealthCheck url={url} onStatusChange={setUrlStatus} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.div 
                  className="flex items-center space-x-2 p-4 rounded-lg border bg-background/50 backdrop-blur-sm"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Clock className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <Label htmlFor="expiry" className="text-sm font-medium">Set expiry date</Label>
                    <Switch
                      id="expiry"
                      checked={hasExpiry}
                      onCheckedChange={setHasExpiry}
                      className="ml-2"
                    />
                  </div>
                </motion.div>

                <motion.div 
                  className="flex items-center space-x-2 p-4 rounded-lg border bg-background/50 backdrop-blur-sm"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Lock className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <Label htmlFor="password" className="text-sm font-medium">Password protect</Label>
                    <Switch
                      id="password"
                      checked={hasPassword}
                      onCheckedChange={setHasPassword}
                      className="ml-2"
                    />
                  </div>
                </motion.div>
              </div>

              <AnimatePresence mode="wait">
                {hasExpiry && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      transition: {
                        duration: 0.3,
                        ease: [0.2, 0, 0, 1]
                      }
                    }}
                    exit={{ 
                      opacity: 0, 
                      y: -20,
                      transition: {
                        duration: 0.2,
                        ease: [0.2, 0, 0, 1]
                      }
                    }}
                    className="space-y-2 p-4 rounded-lg border bg-background/50 backdrop-blur-sm"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiryDate" className="text-sm font-medium">Date</Label>
                        <Input
                          id="expiryDate"
                          type="date"
                          required={hasExpiry}
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="expiryTime" className="text-sm font-medium">Time</Label>
                        <Input
                          id="expiryTime"
                          type="time"
                          required={hasExpiry}
                          value={expiryTime}
                          onChange={(e) => setExpiryTime(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {hasPassword && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      transition: {
                        duration: 0.3,
                        ease: [0.2, 0, 0, 1]
                      }
                    }}
                    exit={{ 
                      opacity: 0, 
                      y: -20,
                      transition: {
                        duration: 0.2,
                        ease: [0.2, 0, 0, 1]
                      }
                    }}
                    className="space-y-2 p-4 rounded-lg border bg-background/50 backdrop-blur-sm"
                  >
                    <div>
                      <Label htmlFor="passwordInput" className="text-sm font-medium">Password</Label>
                      <Input
                        id="passwordInput"
                        type="password"
                        required={hasPassword}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        minLength={4}
                        className="mt-1"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  disabled={loading || urlStatus !== 'healthy' || (hasPassword && !password)}
                  className="w-full h-12 text-lg font-medium bg-gradient-to-r from-primary to-primary/60 hover:from-primary/90 hover:to-primary/50 transition-all duration-300"
                >
                  {loading ? 'Shortening...' : urlStatus === 'checking' ? 'Checking URL...' : urlStatus === 'unhealthy' ? 'URL is not accessible' : 'Shorten URL'}
                </Button>
              </motion.div>
            </motion.form>

            <AnimatePresence>
              {shortUrl && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-8 space-y-4 p-4 lg:p-6 rounded-lg border bg-background/50 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Link2 className="h-4 w-4" />
                    <p className="text-sm font-medium">Your shortened URL:</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      readOnly
                      value={shortUrl}
                      className="flex-1 font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyToClipboard}
                      title="Copy to clipboard"
                      className="shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  {hasPassword && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Lock className="h-4 w-4" />
                      <p>This link is password protected. Users will need to enter the password to access it.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className="w-full lg:w-80">
          <LinksSidebar />
        </div>
      </div>
      <Toaster />
    </main>
  );
}
