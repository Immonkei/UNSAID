'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Flag, Share2, Check } from 'lucide-react';
import { Post } from '../types/post';
import { api } from '../lib/api';

interface PostCardProps {
  post: Post;
  showFullLink?: boolean;
}

export default function PostCard({ post, showFullLink = true }: PostCardProps) {
  const [likes, setLikes] = useState(post.likeCount || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Spam');
  const [isReporting, setIsReporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);

    // Optimistic UI update
    const previousLikes = likes;
    const previousState = hasLiked;
    setLikes((prev) => (hasLiked ? prev - 1 : prev + 1));
    setHasLiked(!hasLiked);

    try {
      const res = await api.likePost(post.id);
      setLikes(res.likeCount);
      setHasLiked(res.liked);
    } catch {
      // Revert if error
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

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'UNSAID — Anonymous Thought',
          text: `"${post.content.slice(0, 100)}..."`,
          url,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = new Date(post.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  return (
    <article className="group relative rounded-2xl bg-neutral-900/60 border border-neutral-800/80 p-6 flex flex-col justify-between transition-all duration-300 hover:border-neutral-700/80 hover:bg-neutral-900/90 shadow-sm">
      <div>
        <div className="flex items-center justify-between text-xs text-neutral-400 mb-4">
          <span className="px-2.5 py-1 rounded-full bg-neutral-800/80 text-neutral-300 font-medium tracking-wide">
            {post.category}
          </span>
          <span className="text-neutral-400 text-[11px]">{formattedDate}</span>
        </div>

        {showFullLink ? (
          <Link href={`/post/${post.id}`} className="block group-hover:text-neutral-100 transition-colors">
            <p className="text-neutral-200 text-base sm:text-lg font-light leading-relaxed whitespace-pre-wrap font-serif selection:bg-neutral-800">
              &ldquo;{post.content}&rdquo;
            </p>
          </Link>
        ) : (
          <p className="text-neutral-200 text-base sm:text-lg font-light leading-relaxed whitespace-pre-wrap font-serif selection:bg-neutral-800">
            &ldquo;{post.content}&rdquo;
          </p>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-neutral-800/60 flex items-center justify-between">
        <span className="text-xs text-neutral-300 italic font-mono">— {post.author}</span>

        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Like button */}
          <button
            onClick={handleLike}
            aria-label="Like post"
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-full text-xs transition-all ${
              hasLiked
                ? 'text-rose-400 bg-rose-950/40 border border-rose-900/60'
                : 'text-neutral-400 hover:text-rose-400 hover:bg-neutral-800/60'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-current' : ''}`} />
            <span>{likes}</span>
          </button>

          {/* Share button */}
          <button
            onClick={handleShare}
            aria-label="Share post"
            className="p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60 rounded-full transition-colors"
            title="Copy share link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>

          {/* Report button */}
          <button
            onClick={() => setShowReportModal(true)}
            aria-label="Report post"
            className="p-1.5 text-neutral-400 hover:text-amber-400 hover:bg-neutral-800/60 rounded-full transition-colors"
            title="Report this post"
          >
            <Flag className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-neutral-900 border border-neutral-800 p-5 shadow-xl">
            <h3 className="text-sm font-semibold text-neutral-200 mb-2">Report this thought</h3>
            <p className="text-xs text-neutral-400 mb-4">
              Help keep UNSAID safe. Choose a reason for reporting this post:
            </p>

            {reportSuccess ? (
              <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg text-xs text-emerald-300 text-center">
                Report submitted. Our moderators will review it.
              </div>
            ) : (
              <form onSubmit={handleReport} className="space-y-4">
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-xs text-neutral-200 focus:outline-none focus:border-neutral-500"
                >
                  <option value="Spam">Spam</option>
                  <option value="Harassment">Harassment</option>
                  <option value="Hate speech">Hate speech</option>
                  <option value="Sexual content">Sexual content</option>
                  <option value="Personal information">Personal information</option>
                  <option value="Threat">Threat</option>
                  <option value="Other">Other</option>
                </select>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="px-3 py-1.5 text-xs text-neutral-400 hover:text-neutral-200 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isReporting}
                    className="px-3 py-1.5 text-xs bg-rose-600 hover:bg-rose-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isReporting ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
