'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Send, ShieldCheck, CheckCircle2, AlertCircle, Sparkles, Eye, Edit3 } from 'lucide-react';
import { api } from '../lib/api';

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

export default function SubmitForm() {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<string>('Overthinking');
  const [agreeToRules, setAgreeToRules] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const charCount = content.length;
  const MAX_CHARS = 2000;

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
      await api.submitThought(content.trim(), category, agreeToRules);
      setIsSubmitted(true);
      setContent('');
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
      <div className="rounded-3xl border border-neutral-800/80 bg-neutral-900/50 backdrop-blur-md p-8 sm:p-12 text-center space-y-6 shadow-2xl animate-fadeIn">
        <div className="w-14 h-14 mx-auto rounded-full bg-emerald-950/60 border border-emerald-800/80 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <div className="space-y-3">
          <h2 className="text-2xl font-serif text-neutral-100 font-light">
            Your thought has been sent into the quiet.
          </h2>
          <p className="text-sm text-neutral-400 max-w-md mx-auto leading-relaxed font-light">
            Thank you for trusting this space. To maintain empathy and protect everyone&apos;s privacy, all submissions undergo brief moderation before becoming visible on the feed and our community channels.
          </p>
        </div>
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => setIsSubmitted(false)}
            className="w-full sm:w-auto px-6 py-3 rounded-full border border-neutral-700 bg-neutral-800 text-neutral-200 text-xs font-medium hover:bg-neutral-700 transition-colors"
          >
            Submit Another Thought
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-neutral-100 text-neutral-950 text-xs font-semibold hover:bg-neutral-200 transition-colors text-center shadow-sm"
          >
            Explore Others&apos; Thoughts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-md p-6 sm:p-9 space-y-7 shadow-2xl relative">
      {/* Top ambient highlight line */}
      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent pointer-events-none" />

      {/* Mode Switcher (Write / Preview) */}
      <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4">
        <span className="text-xs uppercase tracking-widest text-neutral-400 font-mono">
          Anonymous Entry
        </span>
        <div className="flex items-center space-x-1 bg-neutral-950/80 p-1 rounded-full border border-neutral-800">
          <button
            type="button"
            onClick={() => setPreviewMode(false)}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
              !previewMode
                ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Write</span>
          </button>
          <button
            type="button"
            onClick={() => setPreviewMode(true)}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
              previewMode
                ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview Card</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center space-x-2.5 p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

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
                className="text-[11px] px-3 py-1 rounded-full bg-neutral-950/60 border border-neutral-800/80 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700 transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content Area or Preview Card */}
      {previewMode ? (
        <div className="p-6 sm:p-8 rounded-2xl border border-neutral-800 bg-neutral-950/80 space-y-4">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span className="px-2.5 py-0.5 rounded-full bg-neutral-800 text-neutral-300 font-medium">
              {category}
            </span>
            <span className="font-mono text-[11px]">Just now</span>
          </div>
          <p className="text-neutral-200 text-lg sm:text-xl font-serif font-light leading-relaxed whitespace-pre-wrap">
            {content.trim() ? `“${content}”` : '“Your thought will appear here...”'}
          </p>
          <div className="pt-3 border-t border-neutral-800 text-xs text-neutral-500 font-mono">
            — Anonymous
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <textarea
            rows={7}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type whatever you've been holding back. Let your emotions breathe..."
            maxLength={MAX_CHARS}
            className="w-full rounded-2xl bg-neutral-950/80 border border-neutral-800/80 p-5 text-base sm:text-lg text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors font-serif resize-none leading-relaxed"
          />
          <div className="flex justify-between items-center text-[11px] text-neutral-500 px-1">
            <span>Nothing will ever trace back to you</span>
            <span className={charCount > MAX_CHARS - 100 ? 'text-amber-400 font-mono' : 'font-mono'}>
              {charCount} / {MAX_CHARS}
            </span>
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
              className={`p-2 rounded-xl text-xs font-medium transition-all text-center border ${
                category === cat
                  ? 'bg-neutral-100 text-neutral-950 border-neutral-100 font-semibold'
                  : 'bg-neutral-950/60 text-neutral-400 border-neutral-800/80 hover:text-neutral-200 hover:border-neutral-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Anonymity Pledge & Rules Checkbox */}
      <div className="pt-2 space-y-3">
        <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-neutral-950/40 border border-neutral-800/60">
          <ShieldCheck className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
          <p className="text-xs text-neutral-400 leading-relaxed font-light">
            Never include real names, phone numbers, addresses, or private details. Automatic privacy filters actively reject personal contact information.
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
            I agree that this submission is free of hate speech, personal attacks, or real identifying info.
          </span>
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || !agreeToRules || content.trim().length < 3}
        className="w-full flex items-center justify-center space-x-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-300 text-neutral-950 text-sm font-semibold hover:opacity-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_4px_20px_rgba(255,255,255,0.15)] active:scale-[0.99] cursor-pointer"
      >
        <Send className="w-4 h-4" />
        <span>{isSubmitting ? 'Sending into the quiet...' : 'Submit Anonymously'}</span>
      </button>
    </form>
  );
}
