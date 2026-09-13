'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Heart, ImageIcon, Share2, Flag, Check } from 'lucide-react';
import { Post } from '../../../types/post';
import { api } from '../../../lib/api';
import QuoteCardModal from '../../../components/QuoteCardModal';

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
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Spam');
  const [isReporting, setIsReporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
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
    setLikes((prev) => (hasLiked ? prev - 1 : prev + 1));
    setHasLiked(!hasLiked);

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
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post) return;
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
        <div className="rounded-3xl bg-neutral-900/40 border border-neutral-800/40 p-10 h-72 animate-pulse" />
      ) : error || !post ? (
        <div className="text-center py-20 px-6 rounded-3xl border border-neutral-800 bg-neutral-900/40 space-y-4">
          <p className="font-serif italic text-neutral-400 text-xl font-light">
            {error || 'Thought not found'}
          </p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 rounded-full bg-neutral-100 text-neutral-950 text-xs font-semibold hover:bg-neutral-200 transition-colors"
          >
            Explore Other Thoughts
          </Link>
        </div>
      ) : (
        <article className="relative rounded-3xl bg-neutral-900/40 backdrop-blur-md border border-neutral-800/80 p-8 sm:p-12 shadow-2xl space-y-8">
          {/* Subtle Top Glow */}
          <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent pointer-events-none" />

          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="px-3 py-1 rounded-full bg-neutral-800/80 text-neutral-300 font-medium">
              #{post.category}
            </span>
            <span className="font-mono text-[11px]">
              {new Date(post.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          <blockquote className="text-2xl sm:text-3xl font-serif font-light text-neutral-100 leading-relaxed whitespace-pre-wrap selection:bg-neutral-800">
            &ldquo;{post.content}&rdquo;
          </blockquote>

          <div className="pt-6 border-t border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-xs text-neutral-400 font-mono italic">
              — {post.author}
            </span>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  hasLiked
                    ? 'text-rose-400 bg-rose-950/60 border border-rose-800/80 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                    : 'text-neutral-400 hover:text-rose-400 hover:bg-neutral-800/60 border border-neutral-800/80'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-current' : ''}`} />
                <span>{likes} felt this</span>
              </button>

              <button
                onClick={() => setShowQuoteModal(true)}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-neutral-300 bg-neutral-800/80 hover:bg-neutral-700/80 border border-neutral-700/60 transition-colors"
                title="Generate shareable image"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Quote Card</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="p-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-full transition-colors"
                title="Copy direct link"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setShowReportModal(true)}
                className="p-2 text-neutral-500 hover:text-amber-400 hover:bg-neutral-800 rounded-full transition-colors"
                title="Report thought"
              >
                <Flag className="w-4 h-4" />
              </button>
            </div>
          </div>

          <QuoteCardModal
            post={post}
            isOpen={showQuoteModal}
            onClose={() => setShowQuoteModal(false)}
          />

          {/* Report Modal */}
          {showReportModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm">
              <div className="w-full max-w-sm rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl space-y-4">
                <h3 className="text-sm font-semibold text-neutral-200">Report this thought</h3>
                {reportSuccess ? (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 text-center">
                    Report received.
                  </div>
                ) : (
                  <form onSubmit={handleReport} className="space-y-4">
                    <select
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-200 focus:outline-none"
                    >
                      <option value="Spam">Spam</option>
                      <option value="Harassment">Harassment</option>
                      <option value="Hate speech">Hate speech</option>
                      <option value="Sexual content">Sexual content</option>
                      <option value="Personal information">Personal information</option>
                      <option value="Threat">Threat</option>
                      <option value="Other">Other</option>
                    </select>
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowReportModal(false)}
                        className="px-3 py-1.5 text-xs text-neutral-400 hover:text-neutral-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isReporting}
                        className="px-4 py-1.5 text-xs bg-rose-600 hover:bg-rose-500 text-white font-medium rounded-lg"
                      >
                        Submit
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </article>
      )}
    </div>
  );
}
