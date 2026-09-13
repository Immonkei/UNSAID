'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Feather, PenLine, Sparkles } from 'lucide-react';
import SoundscapeControl from './SoundscapeControl';

export default function Navbar() {
  const router = useRouter();

  // Hidden admin shortcut: Ctrl + Shift + A (or Cmd + Shift + A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        router.push('/admin');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-[#080a0f]/80 border-b border-white/[0.08] transition-colors shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      {/* Top subtle highlight shimmer border */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#7C99B8]/40 to-transparent pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 sm:h-[4.25rem] flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center space-x-3 group select-none">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-b from-[#161a24] to-[#0c0e14] flex items-center justify-center border border-white/[0.12] group-hover:border-[#7C99B8]/60 transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_20px_rgba(124,153,184,0.3)]">
              <Feather className="w-4 h-4 text-neutral-300 group-hover:text-white transition-colors duration-300 group-hover:rotate-6" />
            </div>
            {/* Tiny live ambient dot */}
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7C99B8] opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7C99B8]" />
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-baseline space-x-2">
              <span className="font-serif tracking-[0.28em] text-lg font-bold uppercase text-neutral-100 group-hover:text-white transition-colors">
                UNSAID
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-mono tracking-widest text-[#7C99B8]/80 font-medium">
                Sanctuary
              </span>
            </div>
            <span className="hidden sm:inline-block text-[11px] text-neutral-400/80 font-light italic font-serif -mt-0.5">
              Say what you can&apos;t say
            </span>
          </div>
        </Link>

        {/* Right Nav CTA Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Ambient Soundscapes Audio Player */}
          <SoundscapeControl />

          {/* Subtle Explore link */}
          <Link
            href="/#thoughts"
            className="hidden sm:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04] transition-all"
          >
            <span>Confessions</span>
          </Link>

          {/* Frosted Glass "Leave a Thought" Button */}
          <Link
            href="/submit"
            className="group relative overflow-hidden flex items-center space-x-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#0d1017]/85 backdrop-blur-2xl border border-white/[0.12] hover:border-[#7C99B8]/50 text-neutral-100 hover:text-white text-xs sm:text-sm font-medium transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] shadow-[0_8px_25px_rgba(0,0,0,0.6),0_0_20px_rgba(124,153,184,0.12)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.7),0_0_25px_rgba(124,153,184,0.25)] cursor-pointer"
          >
            {/* Soft inner top gradient line */}
            <span className="absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#7C99B8]/40 to-transparent pointer-events-none" />

            {/* Shimmer reflection sweep effect */}
            <span
              aria-hidden="true"
              className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/[0.15] to-transparent -translate-x-[150%] skew-x-[-20deg] group-hover:animate-button-shimmer pointer-events-none"
            />

            <PenLine className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#7C99B8] group-hover:text-white group-hover:rotate-[-8deg] transition-all duration-300" />
            <span className="tracking-tight">Leave a Thought</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
