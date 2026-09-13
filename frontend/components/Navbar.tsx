'use client';

import Link from 'next/link';
import { Feather, Plus, ShieldAlert } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#09090b]/80 border-b border-neutral-800/60 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center border border-neutral-800 group-hover:border-neutral-600 transition-all shadow-[0_0_12px_rgba(255,255,255,0.03)] group-hover:shadow-[0_0_16px_rgba(255,255,255,0.08)]">
            <Feather className="w-4 h-4 text-neutral-200 group-hover:text-white transition-colors" />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:space-x-2.5">
            <span className="font-serif tracking-[0.25em] text-lg font-bold uppercase text-neutral-100">
              UNSAID
            </span>
            <span className="hidden sm:inline-block text-[11px] text-neutral-500 font-light italic font-serif">
              Say what you can&apos;t say
            </span>
          </div>
        </Link>

        {/* Right CTA */}
        <div className="flex items-center space-x-3">
          <Link
            href="/submit"
            className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-300 text-neutral-950 text-xs sm:text-sm font-medium hover:opacity-95 transition-all hover:scale-[1.03] active:scale-[0.98] shadow-[0_2px_12px_rgba(255,255,255,0.1)]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Leave a Thought</span>
          </Link>
          <Link
            href="/admin"
            className="p-2 text-neutral-500 hover:text-neutral-300 rounded-full hover:bg-neutral-900 transition-colors"
            title="Moderation Portal"
          >
            <ShieldAlert className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
