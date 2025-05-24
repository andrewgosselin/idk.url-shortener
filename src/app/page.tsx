'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { LinkPreview } from '@/components/link-preview';

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
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to shorten URL",
        variant: "destructive",
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
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to copy URL.',
      });
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 h-[calc(100vh-2rem)]">
        <div className="flex flex-col lg:flex-row gap-8 h-full">
          {/* Main Content */}
          <div className="flex-1 flex flex-col h-full">
            <div className="text-center mb-8 relative">
              <div className="absolute right-0 top-0">
                <ThemeToggle />
              </div>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  idk. url shortener
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  Shortening URL's since... well, never, until now!
                </p>
              </motion.div>
            </div>

            <motion.form 
              onSubmit={handleSubmit} 
              className="space-y-6 max-w-2xl mx-auto w-full flex-1 flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex-1 flex flex-col">
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
                      className="w-full p-6 rounded-lg border bg-background/50 backdrop-blur-sm text-lg"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <UrlHealthCheck url={url} onStatusChange={setUrlStatus} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  <motion.div 
                    className="flex items-center space-x-4 p-4 rounded-lg border bg-background/50 backdrop-blur-sm hover:bg-accent/50 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="p-2 rounded-full bg-primary/10">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="expiry" className="text-base font-medium">Set expiry date</Label>
                      <Switch
                        id="expiry"
                        checked={hasExpiry}
                        onCheckedChange={setHasExpiry}
                        className="ml-2"
                      />
                    </div>
                  </motion.div>

                  <motion.div 
                    className="flex items-center space-x-4 p-4 rounded-lg border bg-background/50 backdrop-blur-sm hover:bg-accent/50 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="p-2 rounded-full bg-primary/10">
                      <Lock className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="password" className="text-base font-medium">Password protect</Label>
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
                      className="space-y-4 p-4 rounded-lg border bg-background/50 backdrop-blur-sm mt-4"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate" className="text-base font-medium">Date</Label>
                          <Input
                            id="expiryDate"
                            type="date"
                            required={hasExpiry}
                            value={expiryDate}
                            onChange={(e) => setExpiryDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="expiryTime" className="text-base font-medium">Time</Label>
                          <Input
                            id="expiryTime"
                            type="time"
                            required={hasExpiry}
                            value={expiryTime}
                            onChange={(e) => setExpiryTime(e.target.value)}
                            className="mt-2"
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
                      className="space-y-4 p-4 rounded-lg border bg-background/50 backdrop-blur-sm mt-4"
                    >
                      <div>
                        <Label htmlFor="passwordInput" className="text-base font-medium">Password</Label>
                        <Input
                          id="passwordInput"
                          type="password"
                          required={hasPassword}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter password"
                          minLength={4}
                          className="mt-2"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-auto"
              >
                <Button
                  type="submit"
                  disabled={loading || urlStatus !== 'healthy' || (hasPassword && !password)}
                  className="w-full h-14 text-lg font-medium bg-gradient-to-r from-primary to-primary/60 hover:from-primary/90 hover:to-primary/50 transition-all duration-300"
                >
                  {loading ? 'Shortening...' : urlStatus === 'checking' ? 'Checking URL...' : urlStatus === 'unhealthy' ? 'URL is not accessible' : 'Shorten URL'}
                </Button>
              </motion.div>

              <div className="mt-6">
                <LinkPreview url={url} />
              </div>
            </motion.form>

            <AnimatePresence>
              {shortUrl && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-6 space-y-4 p-6 rounded-lg border bg-background/50 backdrop-blur-sm max-w-2xl mx-auto w-full"
                >
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Link2 className="h-5 w-5" />
                    <p className="text-base font-medium">Your shortened URL:</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Input
                      readOnly
                      value={shortUrl}
                      className="flex-1 font-mono text-base p-6"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyToClipboard}
                      title="Copy to clipboard"
                      className="shrink-0 h-12 w-12"
                    >
                      <Copy className="h-5 w-5" />
                    </Button>
                  </div>
                  {hasPassword && (
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Lock className="h-5 w-5" />
                      <p>This link is password protected. Users will need to enter the password to access it.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-96 h-full">
            <LinksSidebar />
          </div>
        </div>
      </div>
      <Toaster />
    </main>
  );
}
