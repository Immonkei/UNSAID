'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Heart, ImageIcon, Share2, Check, MessageCircle, Send, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Post, WhisperItem } from '../../../types/post';
import { api, resolveImageUrl } from '../../../lib/api';
import QuoteCardModal from '../../../components/QuoteCardModal';
import { Card, CardContent, CardFooter } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Textarea } from '../../../components/ui/textarea';

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
  const [whispers, setWhispers] = useState<WhisperItem[]>([]);
  const [whisperText, setWhisperText] = useState('');
  const [sendingWhisper, setSendingWhisper] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchPostAndWhispers = async () => {
      try {
        const [postData, whispersData] = await Promise.all([
          api.getPostById(id),
          api.getWhispers(id).catch(() => []),
        ]);
        setPost(postData);
        setLikes(postData.likeCount || 0);
        setWhispers(whispersData);
        if (postData?.content) {
          const preview = postData.content.length > 50 ? `${postData.content.slice(0, 50)}...` : postData.content;
          document.title = `“${preview}” | UNSAID`;
        }
      } catch {
        setError('This thought could not be found or has not been approved yet.');
      } finally {
        setLoading(false);
      }
    };
    fetchPostAndWhispers();
  }, [id]);

  const handleSendWhisper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whisperText.trim() || !post || sendingWhisper) return;

    setSendingWhisper(true);
    try {
      const newWhisper = await api.createWhisper(post.id, whisperText.trim());
      setWhispers((prev) => [...prev, newWhisper]);
      setWhisperText('');
      toast.success('Your quiet whisper was sent into the night.', {
        description: 'Thank you for reminding a stranger they are not alone.',
      });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Could not send whisper');
    } finally {
      setSendingWhisper(false);
    }
  };

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

          {post.recipient && (
            <div className="flex items-center space-x-2 pt-1 text-sm text-[#7C99B8]">
              <span className="font-mono uppercase tracking-widest text-xs text-neutral-500">To:</span>
              <span className="font-serif italic font-light text-neutral-200 tracking-wide text-lg">{post.recipient}</span>
            </div>
          )}

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

      {/* Quiet Whispers (Unsent Replies) Section */}
      {post && (
        <section id="whispers" className="space-y-6 pt-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <div className="flex items-center space-x-2 text-neutral-200">
              <MessageCircle className="w-4 h-4 text-[#7C99B8]" />
              <h2 className="font-serif text-lg font-light tracking-wide">
                Quiet Whispers
              </h2>
              <span className="font-mono text-xs text-neutral-500">
                ({whispers.length})
              </span>
            </div>
            <span className="text-[11px] font-mono text-neutral-500 italic">
              Gentle anonymous notes of understanding
            </span>
          </div>

          {/* Whispers Feed */}
          {whispers.length === 0 ? (
            <div className="rounded-3xl border border-white/[0.06] bg-[#0c0f16]/50 p-8 text-center space-y-2">
              <p className="font-serif italic text-neutral-400 text-sm">
                No whispers left yet for this confession.
              </p>
              <p className="text-xs text-neutral-500 font-light">
                Be the first stranger to leave a quiet note of warmth.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {whispers.map((w) => (
                <div
                  key={w.id}
                  className="rounded-2xl border border-white/[0.06] bg-[#0c0f16]/60 backdrop-blur-md p-5 space-y-2.5 transition-all hover:border-white/[0.12]"
                >
                  <p className="text-sm font-serif font-light text-neutral-200 leading-relaxed whitespace-pre-wrap selection:bg-neutral-800">
                    &ldquo;{w.content}&rdquo;
                  </p>
                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500">
                    <span className="italic text-[#7C99B8]/90">
                      — {w.author}
                    </span>
                    <span>
                      {new Date(w.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Leave a Quiet Whisper Input */}
          <form
            onSubmit={handleSendWhisper}
            className="rounded-3xl border border-white/[0.08] bg-[#0c0f16]/75 backdrop-blur-xl p-5 sm:p-6 space-y-3.5 shadow-xl"
          >
            <div className="flex items-center space-x-1.5 text-xs text-neutral-400">
              <Sparkles className="w-3.5 h-3.5 text-[#7C99B8]" />
              <span>Leave an anonymous quiet whisper for this person:</span>
            </div>

            <div className="relative">
              <Textarea
                value={whisperText}
                onChange={(e) => setWhisperText(e.target.value)}
                placeholder="I hear you. You’re not crazy for feeling that..."
                maxLength={280}
                rows={3}
                className="bg-[#080a0f]/80 border-white/[0.08] focus:border-[#7C99B8]/70 text-xs sm:text-sm font-serif placeholder:font-sans placeholder:text-neutral-500 resize-none rounded-2xl p-4 text-neutral-200"
              />
              <div className="absolute right-3.5 bottom-3 text-[10px] font-mono text-neutral-500">
                {whisperText.length}/280
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-neutral-500 italic font-mono">
                100% Anonymous • No accounts
              </span>
              <Button
                type="submit"
                size="sm"
                disabled={!whisperText.trim() || sendingWhisper}
                className="rounded-full px-5 text-xs space-x-1.5 bg-neutral-200 text-neutral-950 font-medium hover:bg-white"
              >
                <Send className="w-3 h-3" />
                <span>{sendingWhisper ? 'Whispering...' : 'Send Whisper'}</span>
              </Button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
