'use client';

import { useState } from 'react';
import { Download, Copy, Check, Feather, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Post } from '../types/post';
import { resolveImageUrl } from '../lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface QuoteCardModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuoteCardModal({ post, isOpen, onClose }: QuoteCardModalProps) {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const resolvedImg = resolveImageUrl(post.imageUrl);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      // Create off-screen canvas for export
      const canvas = document.createElement('canvas');
      const width = 1080;
      const height = 1080;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas not supported');
      }

      // Background
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#07070a');
      bgGrad.addColorStop(0.5, '#0e0e16');
      bgGrad.addColorStop(1, '#07070a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Ambient radial center glow
      const radial = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, 520);
      radial.addColorStop(0, 'rgba(49, 46, 129, 0.25)');
      radial.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = radial;
      ctx.fillRect(0, 0, width, height);

      // Border outline
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 2;
      ctx.strokeRect(50, 50, width - 100, height - 100);

      // Brand Header: UNSAID
      ctx.fillStyle = '#f4f4f5';
      ctx.font = 'bold 30px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('U N S A I D', width / 2, 140);

      // Category badge
      ctx.fillStyle = '#a1a1aa';
      ctx.font = '18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(`#${post.category.toUpperCase()}`, width / 2, 185);

      // Wrapped Quote Text
      ctx.fillStyle = '#fafafa';
      ctx.font = 'italic 44px Georgia, Cambria, "Times New Roman", serif';
      ctx.textAlign = 'center';

      const text = `“${post.content}”`;
      const maxWidth = 860;
      const lineHeight = 66;
      const words = text.split(' ');
      let currentLine = '';
      const lines: string[] = [];

      for (let n = 0; n < words.length; n++) {
        const testLine = currentLine + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          lines.push(currentLine.trim());
          currentLine = words[n] + ' ';
        } else {
          currentLine = testLine;
        }
      }
      lines.push(currentLine.trim());

      const totalTextHeight = lines.length * lineHeight;
      let startY = (height - totalTextHeight) / 2 + 20;

      for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], width / 2, startY);
        startY += lineHeight;
      }

      // Author: — Anonymous
      ctx.fillStyle = '#71717a';
      ctx.font = '22px "Courier New", Courier, monospace';
      ctx.fillText('— Anonymous', width / 2, height - 180);

      // Tagline
      ctx.fillStyle = '#52525b';
      ctx.font = 'italic 16px Georgia, serif';
      ctx.fillText('“Say what you can’t say” • unsaid.me', width / 2, height - 120);

      // Trigger download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `unsaid-${post.id.slice(0, 8)}.png`;
      link.href = dataUrl;
      link.click();

      toast.success('Quote card saved to your device', {
        description: 'Ready to share to your Instagram story or camera roll.',
      });
    } catch {
      toast.error('Could not export image directly', {
        description: 'Your browser blocked canvas export. You can copy the link below instead.',
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Link copied into your hands');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-full p-6 sm:p-7">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Shareable Quote Card</span>
          </DialogTitle>
          <DialogDescription>
            Aesthetic keepsake ready for Instagram stories, Twitter, or your camera roll.
          </DialogDescription>
        </DialogHeader>

        {/* 100% Reliable, Stunning HTML/CSS Card Preview */}
        <div className="relative rounded-3xl overflow-hidden border border-white/[0.1] bg-gradient-to-b from-[#0e0e14] via-[#09090e] to-[#050508] p-6 sm:p-8 text-center space-y-6 shadow-2xl">
          {/* Subtle glow circle */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(49,46,129,0.18)_0%,transparent_70%)] pointer-events-none" />

          {/* Brand header */}
          <div className="space-y-1 relative z-10">
            <div className="flex items-center justify-center space-x-1.5 text-neutral-200">
              <Feather className="w-3.5 h-3.5 text-neutral-300" />
              <span className="font-serif font-bold tracking-[0.25em] text-xs uppercase">
                UNSAID
              </span>
            </div>
            <Badge variant="secondary" className="font-mono text-[10px] text-neutral-400">
              #{post.category}
            </Badge>
          </div>

          {/* Quote text */}
          <div className="relative z-10 py-2">
            <p className="text-neutral-100 text-lg sm:text-xl font-serif font-light italic leading-relaxed whitespace-pre-wrap selection:bg-neutral-800">
              &ldquo;{post.content}&rdquo;
            </p>
          </div>

          {/* Attached image preview (if post has one) */}
          {resolvedImg && (
            <div className="relative z-10 rounded-2xl overflow-hidden border border-white/[0.08] max-h-40 w-full bg-neutral-950/80 shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolvedImg}
                alt="Attached memory"
                className="w-full h-auto max-h-40 object-cover"
              />
            </div>
          )}

          {/* Author footer */}
          <div className="pt-2 border-t border-white/[0.06] text-xs text-neutral-500 font-mono relative z-10 flex flex-col space-y-1">
            <span className="italic">— {post.author}</span>
            <span className="text-[10px] text-neutral-600 font-serif italic">
              “Say what you can’t say” • unsaid.me
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <Button
            variant="outline"
            className="flex-1 rounded-2xl"
            onClick={handleCopyLink}
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Link Copied' : 'Copy Link'}</span>
          </Button>

          <Button
            variant="default"
            className="flex-1 rounded-2xl"
            onClick={handleDownload}
            disabled={downloading}
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Exporting...' : 'Save Image'}</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
