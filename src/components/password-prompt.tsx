'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface PasswordPromptProps {
  slug: string;
}

export function PasswordPrompt({ slug }: PasswordPromptProps) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Set the password cookie
      document.cookie = `password_${slug}=${password}; path=/; max-age=31536000`; // 1 year

      // Refresh the page to trigger the server-side redirect
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to access link',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Password Protected</CardTitle>
          <CardDescription>
            This link is password protected. Please enter the password to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={4}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Verifying...' : 'Continue'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
} 