'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Heart, ImageIcon, Share2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Post } from '../../../types/post';
import { api, resolveImageUrl } from '../../../lib/api';
import QuoteCardModal from '../../../components/QuoteCardModal';
import { Card, CardContent, CardFooter } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';

export default function SinglePostPage() {
  const params = useParams();
  const id = params?.id as string;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchPost = async () => {
      try {
        const data = await api.getPostById(id);
        setPost(data);
        setLikes(data.likeCount || 0);
      } catch {
        setError('This thought could not be found or has not been approved yet.');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleLike = async () => {
    if (!post || isLiking) return;
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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Link copied into your hands', {
      description: 'Share this thought with someone who understands.',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const resolvedImg = resolveImageUrl(post?.imageUrl);

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-6">
      <Link
        href="/"
        className="inline-flex items-center space-x-2 text-xs text-neutral-400 hover:text-neutral-200 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to all thoughts</span>
      </Link>

      {loading ? (
        <Card className="p-10 h-72 animate-pulse" />
      ) : error || !post ? (
        <Card className="text-center py-20 px-6 space-y-4">
          <p className="font-serif italic text-neutral-400 text-xl font-light">
            {error || 'Thought not found'}
          </p>
          <Button asChild>
            <Link href="/">Explore Other Thoughts</Link>
          </Button>
        </Card>
      ) : (
        <Card className="relative p-8 sm:p-12 shadow-2xl space-y-8 overflow-hidden bg-[#0c0c11]/80 backdrop-blur-xl border-white/[0.07]">
          {/* Subtle Top Glow Line */}
          <div className="absolute inset-x-12 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent pointer-events-none" />

          <div className="flex items-center justify-between text-xs text-neutral-500">
            <Badge variant="secondary" className="font-mono text-xs">
              #{post.category}
            </Badge>
            <span className="font-mono text-[11px] italic">
              {new Date(post.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          <blockquote className="text-2xl sm:text-3xl font-serif font-light text-neutral-100 leading-relaxed whitespace-pre-wrap selection:bg-neutral-800 tracking-[0.01em]">
            &ldquo;{post.content}&rdquo;
          </blockquote>

          {resolvedImg && (
            <div className="relative rounded-3xl overflow-hidden border border-white/[0.08] max-h-[500px] w-full bg-neutral-950/80 shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolvedImg}
                alt="Memory attached to this thought"
                className="w-full h-auto max-h-[500px] object-contain rounded-3xl"
              />
            </div>
          )}

          <div className="pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-xs text-neutral-500 font-mono italic tracking-widest">
              — {post.author}
            </span>

            <div className="flex items-center space-x-2">
              <Button
                variant={hasLiked ? 'secondary' : 'outline'}
                size="sm"
                onClick={handleLike}
                className={`rounded-full px-4 transition-all duration-300 ${
                  hasLiked
                    ? 'text-rose-300 bg-rose-950/70 border border-rose-800/80 shadow-[0_0_15px_rgba(244,63,94,0.25)]'
                    : 'text-neutral-400 hover:text-rose-400'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-current text-rose-400' : ''}`} />
                <span>{likes} felt this</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowQuoteModal(true)}
                className="rounded-full flex items-center space-x-1.5"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Quote Card</span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyLink}
                title="Copy direct link"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <QuoteCardModal
            post={post}
            isOpen={showQuoteModal}
            onClose={() => setShowQuoteModal(false)}
          />
        </Card>
      )}
    </div>
  );
}
