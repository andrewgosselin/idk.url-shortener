'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

interface PageProps {
  params: {
    slug: string;
  };
}

export default function SlugPage({ params }: PageProps) {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const checkUrl = async () => {
      try {
        const response = await fetch(`/api/check/${params.slug}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'URL not found');
        }

        if (!data.hasPassword) {
          // If no password is required, redirect immediately
          window.location.href = data.url;
        }
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "URL not found",
          variant: "destructive",
        });
        router.push('/');
      } finally {
        setIsChecking(false);
      }
    };

    checkUrl();
  }, [params.slug, router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/check/${params.slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid password');
      }

      // Redirect to the original URL
      window.location.href = data.url;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Invalid password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Checking URL...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"
          >
            <Lock className="h-6 w-6 text-primary" />
          </motion.div>
          <h2 className="mt-6 text-2xl font-bold tracking-tight">
            Password Protected
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This link is password protected. Please enter the password to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <Input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Verifying...' : 'Continue'}
          </Button>
        </form>
      </motion.div>
      <Toaster />
    </main>
  );
} 