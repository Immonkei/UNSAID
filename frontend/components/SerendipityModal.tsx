'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Dices, Sparkles, Heart, MessageCircle, ArrowRight, X, Loader2 } from 'lucide-react';
import { Post } from '../types/post';
import { api, resolveImageUrl } from '../lib/api';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export default function SerendipityModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPost, setCurrentPost] = useState<Post | null>(null);
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const fetchRandomPost = async (excludeId?: string) => {
    setLoading(true);
    setHasLiked(false);
    try {
      const post = await api.getRandomPost(excludeId);
      if (post) {
        setCurrentPost(post);
        setLikes(post.likeCount || 0);
      } else {
        toast.info('No other thoughts to draw right now.');
      }
    } catch {
      toast.error('Could not pull a serendipity thought.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    fetchRandomPost();
  };

  const handleNext = () => {
    if (currentPost) {
      fetchRandomPost(currentPost.id);
    } else {
      fetchRandomPost();
    }
  };

  const handleLike = async () => {
    if (!currentPost || isLiking) return;
    setIsLiking(true);

    const prevLikes = likes;
    const prevLiked = hasLiked;
    const nextLiked = !hasLiked;
    setLikes((prev) => (nextLiked ? prev + 1 : prev - 1));
    setHasLiked(nextLiked);

    if (nextLiked) {
      toast('You felt this serendipitous thought.', {
        icon: '🖤',
        description: 'Two strangers crossed paths in the quiet.',
      });
    }

    try {
      const res = await api.likePost(currentPost.id);
      setLikes(res.likeCount);
      setHasLiked(res.liked);
    } catch {
      setLikes(prevLikes);
      setHasLiked(prevLiked);
    } finally {
      setIsLiking(false);
    }
  };

  const resolvedImg = resolveImageUrl(currentPost?.imageUrl);

  return (
    <>
      {/* Floating Serendipity Trigger Button in Bottom Left */}
      <div className="fixed bottom-6 left-6 z-40">
        <button
          type="button"
          onClick={handleOpen}
          className="group relative flex items-center space-x-2 px-4 py-2.5 rounded-full bg-[#0d1017]/90 backdrop-blur-2xl border border-white/[0.12] hover:border-[#7C99B8]/50 text-neutral-200 hover:text-white shadow-[0_12px_30px_rgba(0,0,0,0.7),0_0_20px_rgba(124,153,184,0.15)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.85),0_0_30px_rgba(124,153,184,0.3)] transition-all duration-300 hover:scale-105 active:scale-95 select-none cursor-pointer"
        >
          {/* Subtle top light bar */}
          <span className="absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#7C99B8]/40 to-transparent pointer-events-none" />

          <Dices className="w-4 h-4 text-[#7C99B8] group-hover:rotate-45 transition-transform duration-500" />
          <span className="text-xs font-medium tracking-tight">Serendipity</span>
          <span className="hidden sm:inline-block text-[10px] font-mono text-neutral-500">
            • Random
          </span>
        </button>
      </div>

      {/* Serendipity Thought Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg w-full p-6 sm:p-8 bg-[#0d1017]/95 backdrop-blur-2xl border border-white/[0.1] rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(124,153,184,0.12)]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest bg-[#7C99B8]/15 text-[#7C99B8] border border-[#7C99B8]/30">
                  <Sparkles className="w-3 h-3 text-[#7C99B8]" />
                  <span>Serendipity</span>
                </span>
                <span className="text-xs text-neutral-500 font-mono">Random Whisper</span>
              </div>
            </div>
            <DialogTitle className="sr-only">Random Thought of the Night</DialogTitle>
            <DialogDescription className="sr-only">
              A random unsaid thought written into the quiet by a stranger.
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-6 h-6 animate-spin text-[#7C99B8]" />
              <p className="text-xs font-mono text-neutral-500">
                Finding a quiet thought in the dark...
              </p>
            </div>
          ) : currentPost ? (
            <div className="space-y-6 pt-2">
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <Badge variant="secondary" className="font-mono text-[11px]">
                  #{currentPost.category}
                </Badge>
                <span className="font-mono text-[11px] italic">
                  {new Date(currentPost.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>

              {currentPost.recipient && (
                <div className="flex items-center space-x-2 text-xs text-[#7C99B8]">
                  <span className="font-mono uppercase tracking-widest text-[10px] text-neutral-500">
                    To:
                  </span>
                  <span className="font-serif italic font-light text-neutral-200 text-sm">
                    {currentPost.recipient}
                  </span>
                </div>
              )}

              <blockquote className="text-xl sm:text-2xl font-serif font-light text-neutral-100 leading-relaxed whitespace-pre-wrap selection:bg-neutral-800">
                &ldquo;{currentPost.content}&rdquo;
              </blockquote>

              {resolvedImg && (
                <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] max-h-56 w-full bg-neutral-950/80">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolvedImg}
                    alt="Memory attached"
                    className="w-full h-auto max-h-56 object-cover"
                  />
                </div>
              )}

              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-xs text-neutral-500 font-mono italic">
                  — {currentPost.author}
                </span>

                <div className="flex items-center space-x-2">
                  <Button
                    variant={hasLiked ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={handleLike}
                    className={`rounded-full px-3 transition-all ${
                      hasLiked
                        ? 'text-rose-300 bg-rose-950/70 border border-rose-800/80'
                        : 'text-neutral-400 hover:text-rose-400'
                    }`}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 mr-1 ${hasLiked ? 'fill-current text-rose-400' : ''}`}
                    />
                    <span className="font-mono text-[11px]">{likes}</span>
                  </Button>

                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="text-neutral-400 hover:text-[#7C99B8]"
                    title="Read unsent whispers"
                  >
                    <Link href={`/post/${currentPost.id}#whispers`} onClick={() => setIsOpen(false)}>
                      <MessageCircle className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Next Random Thought button */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-2xl text-xs"
                >
                  <Link href={`/post/${currentPost.id}`} onClick={() => setIsOpen(false)}>
                    <span>View Full Page</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </Button>

                <Button
                  variant="default"
                  size="sm"
                  onClick={handleNext}
                  className="flex-1 rounded-2xl text-xs flex items-center justify-center space-x-1.5"
                >
                  <Dices className="w-3.5 h-3.5" />
                  <span>Next Random Thought</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-neutral-400">
              No confessions found.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
