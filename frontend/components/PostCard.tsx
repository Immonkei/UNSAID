'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Flag, Share2, ImageIcon } from 'lucide-react';
import { Post } from '../types/post';
import { api } from '../lib/api';
import QuoteCardModal from './QuoteCardModal';

interface PostCardProps {
  post: Post;
  showFullLink?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  Love: 'text-rose-300/90 bg-rose-950/40 border-rose-900/40',
  Heartbreak: 'text-indigo-300/90 bg-indigo-950/40 border-indigo-900/40',
  Life: 'text-amber-300/90 bg-amber-950/40 border-amber-900/40',
  Family: 'text-emerald-300/90 bg-emerald-950/40 border-emerald-900/40',
  Friendship: 'text-teal-300/90 bg-teal-950/40 border-teal-900/40',
  Overthinking: 'text-violet-300/90 bg-violet-950/40 border-violet-900/40',
  Motivation: 'text-orange-300/90 bg-orange-950/40 border-orange-900/40',
  Regret: 'text-slate-300/90 bg-slate-900/60 border-slate-800/60',
  'Letting Go': 'text-cyan-300/90 bg-cyan-950/40 border-cyan-900/40',
  Other: 'text-neutral-300/90 bg-neutral-900/60 border-neutral-800/60',
};

export default function PostCard({ post, showFullLink = true }: PostCardProps) {
  const [likes, setLikes] = useState(post.likeCount || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Spam');
  const [isReporting, setIsReporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

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

  const categoryStyle =
    CATEGORY_COLORS[post.category] || 'text-neutral-300/90 bg-neutral-900/60 border-neutral-800/60';

  return (
    <>
      <article className="group relative rounded-2xl bg-neutral-900/40 backdrop-blur-sm border border-neutral-800/70 p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:border-neutral-700 hover:bg-neutral-900/70 hover:shadow-xl hover:-translate-y-0.5">
        {/* Top subtle highlight */}
        <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent pointer-events-none" />

        <div>
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-5">
            <span className={`px-3 py-1 rounded-full border text-[11px] font-medium tracking-wide ${categoryStyle}`}>
              {post.category}
            </span>
            <span className="text-neutral-500 font-mono text-[11px]">{formattedDate}</span>
          </div>

          {showFullLink ? (
            <Link href={`/post/${post.id}`} className="block group-hover:text-neutral-100 transition-colors">
              <p className="text-neutral-200 text-lg sm:text-[1.25rem] font-light leading-relaxed whitespace-pre-wrap font-serif selection:bg-neutral-800">
                &ldquo;{post.content}&rdquo;
              </p>
            </Link>
          ) : (
            <p className="text-neutral-200 text-lg sm:text-[1.25rem] font-light leading-relaxed whitespace-pre-wrap font-serif selection:bg-neutral-800">
              &ldquo;{post.content}&rdquo;
            </p>
          )}
        </div>

        <div className="mt-8 pt-4 border-t border-neutral-800/60 flex items-center justify-between">
          <span className="text-xs text-neutral-400 italic font-mono tracking-wide">
            — {post.author}
          </span>

          <div className="flex items-center space-x-1.5">
            {/* Heart / Like */}
            <button
              onClick={handleLike}
              aria-label="Like post"
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                hasLiked
                  ? 'text-rose-400 bg-rose-950/60 border border-rose-800/80 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                  : 'text-neutral-400 hover:text-rose-400 hover:bg-neutral-800/60 border border-transparent'
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  hasLiked ? 'fill-current scale-110' : 'group-hover:scale-105'
                }`}
              />
              <span className="font-mono text-[11px]">{likes}</span>
            </button>

            {/* Generate Quote Card */}
            <button
              onClick={() => setShowQuoteModal(true)}
              aria-label="Create quote card"
              className="p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60 rounded-full transition-colors"
              title="Save as aesthetic quote image"
            >
              <ImageIcon className="w-3.5 h-3.5" />
            </button>

            {/* Share link modal */}
            <button
              onClick={() => setShowQuoteModal(true)}
              aria-label="Share post"
              className="p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60 rounded-full transition-colors"
              title="Share"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            {/* Report */}
            <button
              onClick={() => setShowReportModal(true)}
              aria-label="Report post"
              className="p-1.5 text-neutral-500 hover:text-amber-400 hover:bg-neutral-800/60 rounded-full transition-colors"
              title="Report this thought"
            >
              <Flag className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </article>

      {/* Quote Card Image Generator Modal */}
      <QuoteCardModal
        post={post}
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
      />

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-semibold text-neutral-200">Report this thought</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Help keep UNSAID safe and anonymous. Select the primary reason for reporting:
            </p>

            {reportSuccess ? (
              <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 text-center font-medium">
                Thank you. Our moderators will review this submission.
              </div>
            ) : (
              <form onSubmit={handleReport} className="space-y-4">
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-200 focus:outline-none focus:border-neutral-600"
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
                    className="px-4 py-1.5 text-xs bg-rose-600 hover:bg-rose-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50 shadow-sm"
                  >
                    {isReporting ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
