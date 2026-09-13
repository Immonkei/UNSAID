'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Send, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
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

export default function SubmitForm() {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<string>('Overthinking');
  const [agreeToRules, setAgreeToRules] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

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

  if (isSubmitted) {
    return (
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-8 text-center space-y-5">
        <div className="w-12 h-12 mx-auto rounded-full bg-emerald-950/60 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-serif text-neutral-100">Your thought has been sent into the quiet.</h2>
          <p className="text-sm text-neutral-400 max-w-md mx-auto leading-relaxed">
            Thank you for being brave enough to share. Every thought is reviewed by our moderators to protect our anonymous space before being published to the website and our Facebook Page.
          </p>
        </div>
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => setIsSubmitted(false)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-neutral-700 bg-neutral-800 text-neutral-200 text-xs font-medium hover:bg-neutral-700 transition-colors"
          >
            Submit Another Thought
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-neutral-100 text-neutral-950 text-xs font-medium hover:bg-neutral-200 transition-colors text-center"
          >
            Return to Feed
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 sm:p-8 space-y-6">
      {errorMessage && (
        <div className="flex items-center space-x-2 p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Thought Content */}
      <div className="space-y-2">
        <label htmlFor="thought" className="block text-xs uppercase tracking-wider text-neutral-400 font-medium">
          What have you left unsaid?
        </label>
        <textarea
          id="thought"
          rows={6}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your raw, honest feelings... No one will know it was you."
          maxLength={MAX_CHARS}
          className="w-full rounded-xl bg-neutral-950/80 border border-neutral-800 p-4 text-sm sm:text-base text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors font-serif resize-none"
        />
        <div className="flex justify-between items-center text-[11px] text-neutral-400 px-1">
          <span>Your words remain 100% anonymous</span>
          <span className={charCount > MAX_CHARS - 100 ? 'text-amber-400' : ''}>
            {charCount} / {MAX_CHARS}
          </span>
        </div>
      </div>

      {/* Category Select */}
      <div className="space-y-2">
        <label htmlFor="category" className="block text-xs uppercase tracking-wider text-neutral-400 font-medium">
          Category
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-xl bg-neutral-950/80 border border-neutral-800 p-3 text-sm text-neutral-200 focus:outline-none focus:border-neutral-600 transition-colors"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Anonymity Pledge & Rules Checkbox */}
      <div className="pt-2 space-y-3">
        <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-neutral-950/40 border border-neutral-800/60">
          <ShieldCheck className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
          <p className="text-xs text-neutral-400 leading-relaxed">
            Please do not include names, phone numbers, addresses, or private details that could identify you or anyone else.
          </p>
        </div>

        <label className="flex items-start space-x-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={agreeToRules}
            onChange={(e) => setAgreeToRules(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-neutral-100 focus:ring-0 focus:ring-offset-0"
          />
          <span className="text-xs text-neutral-400 leading-relaxed">
            I agree that my submission follows community standards and does not contain hate speech, threats, harassment, or personal contact information.
          </span>
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || !agreeToRules || content.trim().length < 3}
        className="w-full flex items-center justify-center space-x-2 py-3.5 px-6 rounded-xl bg-neutral-100 text-neutral-950 text-sm font-semibold hover:bg-neutral-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg active:scale-[0.99]"
      >
        <Send className="w-4 h-4" />
        <span>{isSubmitting ? 'Sending Anonymously...' : 'Submit Anonymously'}</span>
      </button>
    </form>
  );
}
