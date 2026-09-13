'use client';

import Link from 'next/link';
import { Feather, Plus } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-neutral-950/80 border-b border-neutral-800/80 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center border border-neutral-700 group-hover:border-neutral-500 transition-colors">
            <Feather className="w-4 h-4 text-neutral-200" />
          </div>
          <div>
            <span className="font-serif tracking-widest text-lg font-bold uppercase text-neutral-100">
              UNSAID
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs text-neutral-400 font-light italic">
              Say what you can&apos;t say
            </span>
          </div>
        </Link>

        <div className="flex items-center space-x-3">
          <Link
            href="/submit"
            className="flex items-center space-x-2 px-4 py-2 rounded-full bg-neutral-100 text-neutral-950 text-sm font-medium hover:bg-neutral-200 transition-all hover:scale-105 active:scale-95 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Share Thought</span>
          </Link>
          <Link
            href="/admin"
            className="text-xs text-neutral-300 hover:text-neutral-100 px-2 py-1 transition-colors"
          >
            Admin
          </Link>
        </div>
      </div>
    </header>
  );
}
