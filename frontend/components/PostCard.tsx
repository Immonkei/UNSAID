'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Flag, Share2, ImageIcon } from 'lucide-react';
import { Post } from '../types/post';
import { api, resolveImageUrl } from '../lib/api';
import QuoteCardModal from './QuoteCardModal';
import { Card, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';

interface PostCardProps {
  post: Post;
  showFullLink?: boolean;
}

export default function PostCard({ post, showFullLink = true }: PostCardProps) {
  const [likes, setLikes] = useState(post.likeCount || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Spam');
  const [isReporting, setIsReporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const resolvedImg = resolveImageUrl(post.imageUrl);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiking) return;
    setIsLiking(true);

    const previousLikes = likes;
    const previousState = hasLiked;
    setLikes((prev) => (hasLiked ? prev - 1 : prev + 1));
    setHasLiked(!hasLiked);

    try {
      const res = await api.likePost(post.id);
      setLikes(res.likeCount);
      setHasLiked(res.liked);
    } catch {
      setLikes(previousLikes);
      setHasLiked(previousState);
    } finally {
      setIsLiking(false);
    }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsReporting(true);
    try {
      await api.reportPost(post.id, reportReason);
      setReportSuccess(true);
      setTimeout(() => {
        setShowReportModal(false);
        setReportSuccess(false);
      }, 1500);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Report failed');
    } finally {
      setIsReporting(false);
    }
  };

  const formattedDate = new Date(post.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  return (
    <>
      <Card className="group relative flex flex-col justify-between hover:border-neutral-700 hover:bg-neutral-900/70 hover:shadow-2xl hover:-translate-y-0.5">
        {/* Top subtle highlight line */}
        <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent pointer-events-none" />

        <CardContent className="p-6 sm:p-7 pb-4 sm:pb-4 space-y-4">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <Badge variant="secondary" className="px-3 py-0.5 text-[11px] font-mono">
              #{post.category}
            </Badge>
            <span className="text-neutral-500 font-mono text-[11px]">{formattedDate}</span>
          </div>

          {showFullLink ? (
            <Link href={`/post/${post.id}`} className="block group-hover:text-neutral-100 transition-colors">
              <p className="text-neutral-200 text-lg sm:text-[1.2rem] font-light leading-relaxed whitespace-pre-wrap font-serif selection:bg-neutral-800">
                &ldquo;{post.content}&rdquo;
              </p>
            </Link>
          ) : (
            <p className="text-neutral-200 text-lg sm:text-[1.2rem] font-light leading-relaxed whitespace-pre-wrap font-serif selection:bg-neutral-800">
              &ldquo;{post.content}&rdquo;
            </p>
          )}

          {/* Attached Image */}
          {resolvedImg && (
            <div className="relative rounded-2xl overflow-hidden border border-neutral-800/80 max-h-72 w-full bg-neutral-950/80">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolvedImg}
                alt="Attached memory"
                className="w-full h-auto max-h-72 object-cover transition-transform duration-300 group-hover:scale-[1.01]"
              />
            </div>
          )}
        </CardContent>

        <CardFooter className="mt-4 pt-4 border-t border-neutral-800/60 flex items-center justify-between p-6 sm:p-7">
          <span className="text-xs text-neutral-400 italic font-mono tracking-wide">
            — {post.author}
          </span>

          <div className="flex items-center space-x-1 sm:space-x-1.5">
            {/* Heart / Like button */}
            <Button
              variant={hasLiked ? 'secondary' : 'ghost'}
              size="sm"
              onClick={handleLike}
              className={`rounded-full px-3 transition-all ${
                hasLiked
                  ? 'text-rose-400 bg-rose-950/60 border border-rose-800/80 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                  : 'text-neutral-400 hover:text-rose-400'
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  hasLiked ? 'fill-current scale-110' : 'group-hover:scale-105'
                }`}
              />
              <span className="font-mono text-[11px]">{likes}</span>
            </Button>

            {/* Quote Card */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowQuoteModal(true)}
              title="Save as aesthetic quote image"
            >
              <ImageIcon className="w-3.5 h-3.5" />
            </Button>

            {/* Share */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowQuoteModal(true)}
              title="Share"
            >
              <Share2 className="w-3.5 h-3.5" />
            </Button>

            {/* Report */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowReportModal(true)}
              title="Report this thought"
              className="text-neutral-500 hover:text-amber-400"
            >
              <Flag className="w-3.5 h-3.5" />
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

      {/* Report Dialog with Shadcn Dialog */}
      <Dialog open={showReportModal} onOpenChange={(open) => setShowReportModal(open)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Report this thought</DialogTitle>
            <DialogDescription>
              Help keep UNSAID safe and anonymous. Select the primary reason:
            </DialogDescription>
          </DialogHeader>

          {reportSuccess ? (
            <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl text-xs text-emerald-300 text-center font-medium">
              Thank you. Our moderators will review this submission.
            </div>
          ) : (
            <form onSubmit={handleReport} className="space-y-4">
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-3 text-xs text-neutral-200 focus:outline-none focus:border-neutral-600"
              >
                <option value="Spam">Spam or advertising</option>
                <option value="Harassment">Harassment or targeting someone</option>
                <option value="Hate speech">Hate speech or discrimination</option>
                <option value="Sexual content">Explicit sexual content</option>
                <option value="Personal information">Contains personal or identifying info</option>
                <option value="Threat">Violence or threats</option>
                <option value="Other">Other violation</option>
              </select>

              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReportModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  size="sm"
                  disabled={isReporting}
                >
                  {isReporting ? 'Submitting...' : 'Submit Report'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
