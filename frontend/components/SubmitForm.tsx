'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Send,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Eye,
  Edit3,
  ImagePlus,
  X,
  Loader2,
  HeartHandshake,
  PhoneCall,
  LifeBuoy,
} from 'lucide-react';
import { api, resolveImageUrl } from '../lib/api';
import { toast } from 'sonner';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';

const CATEGORIES = [
  'Love',
  'Heartbreak',
  'Life',
  'Family',
  'Friendship',
  'Overthinking',
  'Motivation',
  'Regret',
  'Letting Go',
  'Other',
] as const;

const PROMPT_CHIPS = [
  'I never told you, but...',
  'I pretend I’m okay when...',
  'To the one who got away...',
  'I wish someone had told me...',
  'I forgave you, but...',
];

const RECIPIENT_SUGGESTIONS = [
  'The one that got away',
  'My younger self',
  'Mom & Dad',
  'Someone I lost',
  'Myself',
  'A stranger',
  'You',
];

// Compassionate crisis detector (self-harm, suicide, severe crisis)
const CRISIS_REGEX = /\b(suicide|kill\s*myself|end\s*my\s*life|want\s*to\s*die|self\s*harm|slit\s*my\s*wrists|hanging\s*myself|jump\s*off|take\s*all\s*my\s*pills|can'?t\s*go\s*on\s*anymore|better\s*off\s*dead)\b/i;

export default function SubmitForm() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [content, setContent] = useState('');
  const [recipient, setRecipient] = useState('');
  const [category, setCategory] = useState<string>('Overthinking');
  const [agreeToRules, setAgreeToRules] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const charCount = content.length;
  const MAX_CHARS = 2000;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size must be under 5MB');
      return;
    }

    setIsUploadingImage(true);
    setErrorMessage(null);

    try {
      const uploadedUrl = await api.uploadImage(file);
      setImageUrl(uploadedUrl);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    setImageUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (content.trim().length < 3) {
      setErrorMessage('Your thought must be at least 3 characters.');
      return;
    }

    if (!agreeToRules) {
      setErrorMessage('You must agree to the community rules.');
      return;
    }

    setIsSubmitting(true);

    try {
      await api.submitThought(content.trim(), category, agreeToRules, imageUrl, recipient.trim() || null);
      setIsSubmitted(true);
      toast.success('Your thought has been sent into the quiet', {
        description: 'Thank you for sharing your unsaid truth.',
      });
      setContent('');
      setRecipient('');
      setImageUrl(null);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyPrompt = (prompt: string) => {
    if (!content) {
      setContent(prompt + ' ');
    } else {
      setContent((prev) => prev + '\n' + prompt + ' ');
    }
  };

  if (isSubmitted) {
    return (
      <Card className="p-8 sm:p-12 text-center space-y-6 shadow-2xl animate-fadeIn">
        <div className="w-14 h-14 mx-auto rounded-full bg-emerald-950/60 border border-emerald-800/80 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <div className="space-y-3">
          <h2 className="text-2xl font-serif text-neutral-100 font-light">
            Your thought has been sent into the quiet.
          </h2>
          <p className="text-sm text-neutral-400 max-w-md mx-auto leading-relaxed font-light">
            Thank you for trusting this space. To maintain empathy and protect everyone&apos;s privacy, all submissions undergo brief moderation before becoming visible on the feed.
          </p>
        </div>
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => setIsSubmitted(false)}
            className="w-full sm:w-auto"
          >
            Submit Another Thought
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/">Explore Others&apos; Thoughts</Link>
          </Button>
        </div>
      </Card>
    );
  }

  const resolvedImg = resolveImageUrl(imageUrl);

  return (
    <Card className="p-6 sm:p-9 shadow-2xl relative">
      {/* Top ambient highlight line */}
      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent pointer-events-none" />

      {/* Mode Switcher */}
      <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4 mb-6">
        <Badge variant="secondary" className="font-mono text-[10px] tracking-wider uppercase">
          Anonymous Thought
        </Badge>
        <div className="flex items-center space-x-1 bg-neutral-950/80 p-1 rounded-2xl border border-neutral-800">
          <Button
            type="button"
            variant={!previewMode ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setPreviewMode(false)}
            className="h-7 text-xs"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Write</span>
          </Button>
          <Button
            type="button"
            variant={previewMode ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setPreviewMode(true)}
            className="h-7 text-xs"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview Card</span>
          </Button>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 flex items-center space-x-2.5 p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Gentle Crisis & Distress Care Banner */}
      {CRISIS_REGEX.test(content) && (
        <div className="mb-6 rounded-3xl bg-gradient-to-b from-[#18141d] to-[#0f0e16] border border-amber-500/30 p-5 sm:p-6 shadow-2xl relative overflow-hidden animate-fadeIn">
          {/* Ambient Warmth Glow */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start space-x-3.5 relative z-10">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0 mt-0.5 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <HeartHandshake className="w-4 h-4" />
            </div>

            <div className="space-y-2 flex-1">
              <h4 className="text-sm font-serif font-normal text-amber-100">
                You are carrying so much right now. Please know you matter.
              </h4>
              <p className="text-xs text-neutral-300 leading-relaxed font-light">
                If the weight feels impossible, you do not have to endure it in silence. Free, anonymous, and caring support is available 24/7 with people trained to listen:
              </p>

              <div className="pt-1 flex flex-wrap gap-2 text-xs">
                <a
                  href="tel:988"
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 font-mono text-[11px] transition-colors"
                >
                  <PhoneCall className="w-3 h-3" />
                  <span>Call or Text 988 (Suicide & Crisis Lifeline)</span>
                </a>

                <a
                  href="https://findahelpline.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-neutral-300 text-[11px] transition-colors"
                >
                  <LifeBuoy className="w-3 h-3 text-[#7C99B8]" />
                  <span>International Helplines (findahelpline.com)</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Prompts Spark */}
        {!previewMode && (
          <div className="space-y-2">
            <div className="flex items-center space-x-1.5 text-xs text-neutral-400">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Need inspiration? Tap to start:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {PROMPT_CHIPS.map((chip) => (
                <button
                  type="button"
                  key={chip}
                  onClick={() => handleApplyPrompt(chip)}
                  className="text-[11px] px-3 py-1 rounded-full bg-neutral-950/60 border border-neutral-800/80 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700 transition-colors cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-neutral-500 font-mono">Popular tags:</span>
              {['#UnsentLetters', '#3AMThoughts', '#Heartache', '#LettingGo', '#Closure', '#FirstLove'].map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => handleApplyPrompt(tag)}
                  className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#7C99B8]/10 hover:bg-[#7C99B8]/20 border border-[#7C99B8]/30 text-[#7C99B8] transition-colors cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content Area or Preview */}
        {previewMode ? (
          <div className="p-6 sm:p-8 rounded-3xl border border-neutral-800 bg-neutral-950/80 space-y-4">
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <Badge variant="secondary">{category}</Badge>
              <span className="font-mono text-[11px]">Just now</span>
            </div>

            {recipient.trim() && (
              <div className="flex items-center space-x-2 text-xs text-[#7C99B8]">
                <span className="font-mono uppercase tracking-widest text-[10px] text-neutral-500">To:</span>
                <span className="font-serif italic font-light text-neutral-200">{recipient.trim()}</span>
              </div>
            )}

            <p className="text-neutral-200 text-lg sm:text-xl font-serif font-light leading-relaxed whitespace-pre-wrap">
              {content.trim() ? `“${content}”` : '“Your thought will appear here...”'}
            </p>

            {resolvedImg && (
              <div className="relative rounded-2xl overflow-hidden border border-neutral-800 max-h-80 w-full bg-neutral-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolvedImg}
                  alt="Attached memory"
                  className="w-full h-auto max-h-80 object-cover"
                />
              </div>
            )}

            <div className="pt-3 border-t border-neutral-800 text-xs text-neutral-500 font-mono">
              — Anonymous
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Recipient Dedication Field */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-neutral-950/50 border border-neutral-800/70">
              <div className="flex items-center justify-between">
                <label className="text-xs text-neutral-400 font-mono flex items-center space-x-1.5">
                  <span className="text-[#7C99B8]">To:</span>
                  <span>Who is this unsaid letter for? (Optional)</span>
                </label>
                <span className="text-[10px] font-mono text-neutral-500">{recipient.length}/60</span>
              </div>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value.slice(0, 60))}
                placeholder="e.g. My younger self, The one that got away, S., Mom"
                className="w-full bg-neutral-900/60 border border-neutral-800 focus:border-[#7C99B8]/60 focus:ring-1 focus:ring-[#7C99B8]/40 rounded-xl px-3.5 py-2 text-sm text-neutral-200 placeholder:text-neutral-600 outline-none transition-colors"
                maxLength={60}
              />
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-neutral-500 mr-1">Quick ideas:</span>
                {RECIPIENT_SUGGESTIONS.map((sug) => (
                  <button
                    type="button"
                    key={sug}
                    onClick={() => setRecipient(sug)}
                    className={`text-[10px] px-2.5 py-0.5 rounded-full border transition-colors cursor-pointer ${
                      recipient === sug
                        ? 'bg-[#7C99B8]/20 text-[#7C99B8] border-[#7C99B8]/40'
                        : 'bg-neutral-900/40 text-neutral-400 border-neutral-800/80 hover:text-neutral-200 hover:border-neutral-700'
                    }`}
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Textarea
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type whatever you've been holding back. Let your emotions breathe..."
                maxLength={MAX_CHARS}
              />

            <div className="flex justify-between items-center text-[11px] text-neutral-500 px-1">
              <span>Nothing will ever trace back to you</span>
              <span className={charCount > MAX_CHARS - 100 ? 'text-amber-400 font-mono' : 'font-mono'}>
                {charCount} / {MAX_CHARS}
              </span>
            </div>

            {/* Attached Image Preview */}
            {resolvedImg && (
              <div className="relative inline-block rounded-2xl overflow-hidden border border-neutral-700/80 bg-neutral-900 shadow-md group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolvedImg}
                  alt="Uploaded photo"
                  className="h-32 w-auto max-w-xs object-cover rounded-2xl"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-neutral-950/80 hover:bg-rose-950/90 text-neutral-300 hover:text-rose-400 border border-neutral-700 transition-colors"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Add Image Button */}
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/webp, image/gif"
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage || Boolean(imageUrl)}
                className="rounded-full text-xs text-neutral-400 hover:text-neutral-200"
              >
                {isUploadingImage ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-300" />
                    <span>Uploading photo...</span>
                  </>
                ) : (
                  <>
                    <ImagePlus className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{imageUrl ? 'Photo attached' : 'Add an emotional photo / memory (optional)'}</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
        )}

        {/* Category Select */}
        <div className="space-y-2">
          <label className="block text-xs uppercase tracking-wider text-neutral-400 font-medium">
            Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setCategory(cat)}
                className={`p-2 rounded-xl text-xs font-medium transition-all text-center border cursor-pointer ${
                  category === cat
                    ? 'bg-neutral-100 text-neutral-950 border-neutral-100 font-semibold shadow-sm'
                    : 'bg-neutral-950/60 text-neutral-400 border-neutral-800/80 hover:text-neutral-200 hover:border-neutral-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Anonymity Pledge & Rules Checkbox */}
        <div className="pt-1 space-y-3">
          <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-neutral-950/40 border border-neutral-800/60">
            <ShieldCheck className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
            <p className="text-xs text-neutral-400 leading-relaxed font-light">
              Never include real faces, identifying documents, phone numbers, or private details. Automatic privacy filters actively reject personal contact information.
            </p>
          </div>

          <label className="flex items-start space-x-3 cursor-pointer select-none group">
            <input
              type="checkbox"
              checked={agreeToRules}
              onChange={(e) => setAgreeToRules(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-neutral-100 focus:ring-0 focus:ring-offset-0"
            />
            <span className="text-xs text-neutral-400 group-hover:text-neutral-300 leading-relaxed transition-colors">
              I agree that this submission and image are free of hate speech, personal attacks, or real identifying info.
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting || isUploadingImage || !agreeToRules || content.trim().length < 3}
          className="w-full flex items-center justify-center space-x-2"
        >
          <Send className="w-4 h-4" />
          <span>{isSubmitting ? 'Sending into the quiet...' : 'Submit Anonymously'}</span>
        </Button>
      </form>
    </Card>
  );
}
