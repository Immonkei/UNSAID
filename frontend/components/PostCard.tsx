'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Share2, ImageIcon, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Post } from '../types/post';
import { api, resolveImageUrl } from '../lib/api';
import QuoteCardModal from './QuoteCardModal';
import { Card, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface PostCardProps {
  post: Post;
  showFullLink?: boolean;
}

const CATEGORY_STYLES: Record<string, string> = {
  Love: 'text-rose-300/80 bg-rose-950/30 border-rose-900/40',
  Heartbreak: 'text-indigo-300/80 bg-indigo-950/30 border-indigo-900/40',
  Life: 'text-amber-300/80 bg-amber-950/30 border-amber-900/40',
  Family: 'text-emerald-300/80 bg-emerald-950/30 border-emerald-900/40',
  Friendship: 'text-teal-300/80 bg-teal-950/30 border-teal-900/40',
  Overthinking: 'text-violet-300/80 bg-violet-950/30 border-violet-900/40',
  Motivation: 'text-orange-300/80 bg-orange-950/30 border-orange-900/40',
  Regret: 'text-blue-300/80 bg-blue-950/30 border-blue-900/40',
  'Letting Go': 'text-cyan-300/80 bg-cyan-950/30 border-cyan-900/40',
  Other: 'text-neutral-400 bg-neutral-900/50 border-neutral-800/60',
};

export default function PostCard({ post, showFullLink = true }: PostCardProps) {
  const [likes, setLikes] = useState(post.likeCount || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  const resolvedImg = resolveImageUrl(post.imageUrl);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiking) return;
    setIsLiking(true);

    const prevLikes = likes;
    const prevLiked = hasLiked;
    const nextLiked = !hasLiked;

    setLikes((prev) => (nextLiked ? prev + 1 : prev - 1));
    setHasLiked(nextLiked);

    if (nextLiked) {
      toast('You felt this unsaid thought.', {
        icon: '🖤',
        description: 'Someone out there knows they are not alone.',
      });
    }

    try {
      const res = await api.likePost(post.id);
      setLikes(res.likeCount);
      setHasLiked(res.liked);
    } catch {
      setLikes(prevLikes);
      setHasLiked(prevLiked);
    } finally {
      setIsLiking(false);
    }
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied into your hands', {
      description: 'Share this thought with someone who understands.',
    });
  };

  const formattedDate = new Date(post.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  const catStyle = CATEGORY_STYLES[post.category] || 'text-neutral-400 bg-neutral-900/50 border-neutral-800/60';

  return (
    <>
      <Card className="group relative flex flex-col justify-between rounded-3xl bg-[#0c0c11]/80 backdrop-blur-xl border border-white/[0.06] hover:border-white/[0.14] transition-all duration-500 hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)] hover:-translate-y-1 overflow-hidden">
        {/* Soft top gradient line */}
        <div className="absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent pointer-events-none" />

        {/* Ambient subtle card glow on hover */}
        <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-indigo-950/20 rounded-full blur-2xl group-hover:bg-indigo-900/30 transition-all pointer-events-none" />

        <CardContent className="p-6 sm:p-8 pb-4 sm:pb-4 space-y-4 relative z-10">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span className={`px-3 py-1 rounded-full border text-[11px] font-mono tracking-wide ${catStyle}`}>
              #{post.category}
            </span>
            <span className="font-mono text-[11px] text-neutral-500 italic">
              {formattedDate}
            </span>
          </div>

          {showFullLink ? (
            <Link href={`/post/${post.id}`} className="block group-hover:text-neutral-100 transition-colors">
              <p className="text-neutral-200 text-lg sm:text-[1.25rem] font-light leading-relaxed whitespace-pre-wrap font-serif selection:bg-neutral-800 tracking-[0.01em]">
                &ldquo;{post.content}&rdquo;
              </p>
            </Link>
          ) : (
            <p className="text-neutral-200 text-lg sm:text-[1.25rem] font-light leading-relaxed whitespace-pre-wrap font-serif selection:bg-neutral-800 tracking-[0.01em]">
              &ldquo;{post.content}&rdquo;
            </p>
          )}

          {/* Attached Image (if present) */}
          {resolvedImg && (
            <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] max-h-80 w-full bg-neutral-950/90 shadow-inner group/img">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolvedImg}
                alt="Memory attached to this thought"
                className="w-full h-auto max-h-80 object-cover opacity-90 group-hover/img:opacity-100 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            </div>
          )}
        </CardContent>

        <CardFooter className="mt-4 pt-4 border-t border-white/[0.05] flex items-center justify-between p-6 sm:p-8 pt-0 relative z-10">
          <span className="text-xs text-neutral-500 italic font-mono tracking-widest">
            — {post.author}
          </span>

          <div className="flex items-center space-x-1 sm:space-x-1.5">
            {/* Felt This / Like button */}
            <Button
              variant={hasLiked ? 'secondary' : 'ghost'}
              size="sm"
              onClick={handleLike}
              className={`rounded-full px-3.5 transition-all duration-300 ${
                hasLiked
                  ? 'text-rose-300 bg-rose-950/70 border border-rose-800/80 shadow-[0_0_15px_rgba(244,63,94,0.25)]'
                  : 'text-neutral-400 hover:text-rose-400 hover:bg-white/[0.04]'
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 transition-transform duration-300 ${
                  hasLiked ? 'fill-current scale-110 text-rose-400' : 'group-hover:scale-105'
                }`}
              />
              <span className="font-mono text-[11px] ml-1">{likes}</span>
            </Button>

            {/* Quote Card Exporter */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowQuoteModal(true)}
              title="Save as aesthetic quote card"
              className="text-neutral-400 hover:text-neutral-100 hover:bg-white/[0.05]"
            >
              <ImageIcon className="w-3.5 h-3.5" />
            </Button>

            {/* Copy Link Share */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopyLink}
              title="Copy share link"
              className="text-neutral-400 hover:text-neutral-100 hover:bg-white/[0.05]"
            >
              <Share2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Quote Card Image Generator Modal */}
      <QuoteCardModal
        post={post}
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
      />
    </>
  );
}
