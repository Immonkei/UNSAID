'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, X, Copy, Check } from 'lucide-react';
import { Post } from '../types/post';

interface QuoteCardModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuoteCardModal({ post, isOpen, onClose }: QuoteCardModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas size (Instagram Story 1080x1350 or Square 1080x1080)
    const width = 1080;
    const height = 1080;
    canvas.width = width;
    canvas.height = height;

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#09090b');
    bgGrad.addColorStop(0.5, '#0f1016');
    bgGrad.addColorStop(1, '#09090b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle ambient glow in center
    const radial = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, 500);
    radial.addColorStop(0, 'rgba(30, 41, 59, 0.4)');
    radial.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, width, height);

    // Delicate Border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 2;
    ctx.strokeRect(60, 60, width - 120, height - 120);

    // Brand Header: UNSAID
    ctx.fillStyle = '#f4f4f5';
    ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.letterSpacing = '6px';
    ctx.textAlign = 'center';
    ctx.fillText('UNSAID', width / 2, 140);

    // Category badge
    ctx.fillStyle = '#71717a';
    ctx.font = '18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.letterSpacing = '2px';
    ctx.fillText(`#${post.category.toUpperCase()}`, width / 2, 180);

    // Large Quote Content in Serif
    ctx.fillStyle = '#fafafa';
    ctx.font = 'italic 42px Georgia, Cambria, serif';
    ctx.letterSpacing = '0px';
    ctx.textAlign = 'center';

    const text = `“${post.content}”`;
    const maxWidth = 800;
    const lineHeight = 64;
    const words = text.split(' ');
    let line = '';
    const lines: string[] = [];

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        lines.push(line.trim());
        line = words[n] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line.trim());

    // Center vertically
    const totalTextHeight = lines.length * lineHeight;
    let startY = (height - totalTextHeight) / 2 + 30;

    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], width / 2, startY);
      startY += lineHeight;
    }

    // Author: — Anonymous
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '24px "Courier New", Courier, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('— Anonymous', width / 2, height - 190);

    // Footer tagline
    ctx.fillStyle = '#52525b';
    ctx.font = 'italic 16px Georgia, serif';
    ctx.fillText('“Say what you can’t say” • unsaid.me', width / 2, height - 130);
  }, [isOpen, post]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!canvasRef.current) return;
    setDownloading(true);
    const link = document.createElement('a');
    link.download = `unsaid-${post.id.slice(0, 8)}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
    setTimeout(() => setDownloading(false), 800);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative max-w-md w-full rounded-2xl bg-neutral-900/90 border border-neutral-800 p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-neutral-200">Shareable Quote Card</h3>
            <p className="text-xs text-neutral-400">Save as a high-res image for stories or posts</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Canvas Preview */}
        <div className="rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 shadow-inner flex items-center justify-center p-2">
          <canvas
            ref={canvasRef}
            className="w-full h-auto max-h-[380px] object-contain rounded-lg shadow-md"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <button
            onClick={handleCopyLink}
            className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl border border-neutral-700 bg-neutral-800 text-xs text-neutral-200 hover:bg-neutral-700 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Link Copied' : 'Copy Link'}</span>
          </button>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-neutral-100 text-neutral-950 text-xs font-semibold hover:bg-neutral-200 transition-all hover:scale-[1.02] shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Exporting...' : 'Save Image'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
