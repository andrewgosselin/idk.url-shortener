'use client';

import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';

interface QRCodeModalProps {
  url: string;
  onClose: () => void;
}

export function QRCodeModal({ url, onClose }: QRCodeModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!qrRef.current) return;

    setIsDownloading(true);
    try {
      const svg = qrRef.current.querySelector('svg');
      if (!svg) return;

      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = 'qrcode.png';
        downloadLink.href = pngFile;
        downloadLink.click();
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    } catch (error) {
      console.error('Failed to download QR code:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50"
      onClick={onClose}
    >
      <Card 
        className="w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader>
          <CardTitle>QR Code</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div 
            ref={qrRef}
            className="flex justify-center p-4 bg-white rounded-lg"
          >
            <QRCodeSVG
              value={url}
              size={200}
              level="H"
              includeMargin
            />
          </div>
          <Button
            className="w-full"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            <Download className="w-4 h-4 mr-2" />
            {isDownloading ? 'Downloading...' : 'Download QR Code'}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
} 