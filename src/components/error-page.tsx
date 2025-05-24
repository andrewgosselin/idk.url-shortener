'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface ErrorPageProps {
  title: string;
  message: string;
}

export function ErrorPage({ title, message }: ErrorPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/">Create a new short URL</Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
} 