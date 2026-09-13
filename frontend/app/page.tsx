'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { PenLine, Shield, HeartHandshake, EyeOff, Search, Sparkles, Moon } from 'lucide-react';
import PostCard from '../components/PostCard';
import CategoryFilter from '../components/CategoryFilter';
import PostFeed from '../components/PostFeed';
import CandleVigil from '../components/CandleVigil';
import EmotionalTagBar, { POPULAR_TAGS } from '../components/EmotionalTagBar';
import { Post, Pagination } from '../types/post';
import { api } from '../lib/api';

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const loadPosts = useCallback(
    async (cat: string, pageNum: number, query: string, sort: 'latest' | 'popular') => {
      setLoading(true);
      try {
        const data = await api.getPosts(
          cat === 'All' ? undefined : cat,
          pageNum,
          20,
          query.trim() || undefined,
          sort
        );
        setPosts(data.posts);
        setPagination(data.pagination);
      } catch {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Trigger search with 300ms debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      loadPosts(selectedCategory, 1, searchQuery, sortBy);
    }, 280);

    return () => clearTimeout(handler);
  }, [selectedCategory, searchQuery, sortBy, loadPosts]);

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    setSelectedTag(null);
  };

  const handleTagSelect = (tag: string | null) => {
    setSelectedTag(tag);
    if (!tag) {
      setSearchQuery('');
    } else {
      const match = POPULAR_TAGS.find((t) => t.tag === tag);
      if (match?.categoryHint && selectedCategory === 'All') {
        setSelectedCategory(match.categoryHint);
      }
      setSearchQuery(match ? match.label : `#${tag}`);
    }
  };

  const handlePageChange = (newPage: number) => {
    loadPosts(selectedCategory, newPage, searchQuery, sortBy);
  };

  // Featured thought (most felt confession across loaded posts)
  const featuredPost = useMemo(() => {
    if (posts.length === 0) return null;
    return [...posts].sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))[0];
  }, [posts]);

  return (
    <div className="space-y-16 sm:space-y-20">
      {/* Cinematic Melancholic Hero Section */}
      <section className="text-center py-12 sm:py-24 space-y-8 max-w-2xl mx-auto relative">
        {/* 1. Accent Radial Glow Bloom */}
        <div
          aria-hidden="true"
          className="animate-hero-glow absolute top-1/2 left-1/2 w-[480px] sm:w-[620px] h-[340px] rounded-full blur-3xl pointer-events-none -z-10"
          style={{
            background: 'radial-gradient(ellipse at center, #7C99B8 0%, rgba(124, 153, 184, 0) 70%)',
          }}
        />

        {/* 2. Eyebrow Pill */}
        <div className="animate-hero-eyebrow inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-neutral-900/90 border border-white/[0.08] text-neutral-300 text-xs font-mono shadow-inner tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-[#7C99B8]" />
          <span>An anonymous sanctuary for what you never said</span>
        </div>

        {/* 3. Headline with 4. Animated Draw Underline */}
        <h1 className="animate-hero-headline text-4xl sm:text-6xl md:text-7xl font-serif font-light tracking-tight text-neutral-100 leading-[1.12]">
          Say what you{' '}
          <span className="relative inline-block italic font-normal">
            can&apos;t say
            <span
              aria-hidden="true"
              className="animate-hero-underline absolute left-0 -bottom-1 sm:-bottom-2 w-full h-[1.5px] sm:h-[2px] bg-[#7C99B8] rounded-full"
            />
          </span>
          .
        </h1>

        {/* 5. Subtext */}
        <p className="animate-hero-subtext text-sm sm:text-base text-neutral-400 font-light leading-relaxed max-w-xl mx-auto font-serif italic selection:bg-neutral-800">
          &ldquo;Somewhere in the quiet of the night, the words we swallowed hurt the most. Release them here into the dark — no judgment, no accounts, totally anonymous.&rdquo;
        </p>

        {/* 6. Action Buttons */}
        <div className="animate-hero-cta pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/submit"
            className="group relative overflow-hidden w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-300 text-neutral-950 font-semibold text-sm hover:opacity-95 transition-all duration-300 hover:scale-[1.04] active:scale-[0.98] shadow-[0_4px_25px_rgba(255,255,255,0.14),0_0_20px_rgba(124,153,184,0.15)] hover:shadow-[0_6px_30px_rgba(255,255,255,0.25),0_0_30px_rgba(124,153,184,0.3)] cursor-pointer"
          >
            {/* Shimmer reflection sweep */}
            <span
              aria-hidden="true"
              className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/70 to-transparent -translate-x-[150%] skew-x-[-20deg] group-hover:animate-button-shimmer pointer-events-none"
            />
            <PenLine className="w-4 h-4 group-hover:rotate-[-8deg] transition-transform duration-300" />
            <span>Share Your Thought</span>
          </Link>

          <a
            href="#thoughts"
            className="w-full sm:w-auto px-7 py-3.5 rounded-full border border-white/[0.08] bg-[#0c0c11]/80 backdrop-blur-md text-neutral-300 font-medium text-sm hover:bg-neutral-800/80 hover:text-white transition-all cursor-pointer"
          >
            Read Confessions
          </a>
        </div>
      </section>

      {/* Featured / Spotlight Thought Banner */}
      {featuredPost && (
        <section className="relative rounded-3xl overflow-hidden border border-white/[0.1] bg-gradient-to-b from-[#121622]/90 via-[#0d1017]/85 to-[#08090d] p-8 sm:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.7),0_0_40px_rgba(124,153,184,0.08)] backdrop-blur-2xl group">
          {/* Ambient lantern bloom */}
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 bg-[#7C99B8]/25 blur-[110px] rounded-full pointer-events-none group-hover:bg-[#7C99B8]/30 transition-all duration-700" />
          <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-indigo-950/25 blur-[100px] rounded-full pointer-events-none" />

          {/* Top highlight beam */}
          <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-[#7C99B8]/50 to-transparent pointer-events-none" />

          {/* Background subtle watermark quote */}
          <div
            aria-hidden="true"
            className="absolute -bottom-10 right-4 font-serif text-9xl text-white/[0.03] pointer-events-none select-none font-bold"
          >
            “
          </div>

          <div className="flex items-center space-x-2 text-[11px] uppercase tracking-widest text-[#7C99B8] font-mono font-medium mb-4 relative z-10">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Most Felt by Strangers</span>
          </div>

          <Link href={`/post/${featuredPost.id}`} className="block relative z-10">
            <blockquote className="text-xl sm:text-2xl md:text-3xl font-serif font-light text-neutral-100 leading-relaxed group-hover:text-white transition-colors">
              &ldquo;{featuredPost.content}&rdquo;
            </blockquote>
          </Link>

          <div className="mt-8 flex items-center justify-between text-xs text-neutral-400 font-mono relative z-10 border-t border-white/[0.06] pt-4">
            <span className="italic">— Anonymous • #{featuredPost.category}</span>
            <span className="text-rose-300 font-medium">❤️ {featuredPost.likeCount || 0} felt this</span>
          </div>
        </section>
      )}

      {/* Virtual Candle Vigil / Community Warmth */}
      <CandleVigil />

      {/* Feed Section */}
      <section id="thoughts" className="space-y-6 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/[0.06] pb-5">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-serif font-light text-neutral-100 tracking-tight">
              Unspoken Archives
            </h2>
            <p className="text-xs text-neutral-400 font-light">
              Unfiltered thoughts written into the quiet by strangers.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
            {/* Category Filter Dropdown */}
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={handleCategorySelect}
            />

            {/* Search Input */}
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full bg-[#0f121a]/75 backdrop-blur-xl border border-white/[0.08] hover:border-white/[0.16] rounded-full pl-9 pr-3.5 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-[#7C99B8]/70 focus:ring-1 focus:ring-[#7C99B8]/30 transition-all shadow-inner"
              />
            </div>

            {/* Sort Toggle */}
            <div className="flex items-center bg-[#0f121a]/75 backdrop-blur-xl p-1 rounded-full border border-white/[0.08] text-xs">
              <button
                onClick={() => setSortBy('latest')}
                className={`px-3.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                  sortBy === 'latest'
                    ? 'bg-neutral-200 text-neutral-950 font-semibold shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Latest
              </button>
              <button
                onClick={() => setSortBy('popular')}
                className={`px-3.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                  sortBy === 'popular'
                    ? 'bg-neutral-200 text-neutral-950 font-semibold shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Most Felt
              </button>
            </div>
          </div>
        </div>

        {/* Emotional Tag Quick Mood Bar */}
        <EmotionalTagBar
          selectedTag={selectedTag}
          onSelectTag={handleTagSelect}
        />

        {/* Post Feed */}
        <PostFeed
          posts={posts}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </section>

      {/* About Section */}
      <section id="about" className="pt-20 border-t border-white/[0.06] grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-3xl border border-white/[0.06] bg-[#0c0c11]/50 backdrop-blur-md p-7 space-y-3.5 hover:border-white/[0.12] transition-colors">
          <div className="w-10 h-10 rounded-2xl bg-neutral-900/90 flex items-center justify-center text-neutral-300 shadow-inner">
            <EyeOff className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-neutral-200">Absolute Anonymity</h3>
          <p className="text-xs text-neutral-400 leading-relaxed font-light">
            No accounts, no phone numbers, no tracking. Every thought is attributed solely to &ldquo;Anonymous&rdquo; so you can be vulnerable without fear.
          </p>
        </div>

        <div className="rounded-3xl border border-white/[0.06] bg-[#0c0c11]/50 backdrop-blur-md p-7 space-y-3.5 hover:border-white/[0.12] transition-colors">
          <div className="w-10 h-10 rounded-2xl bg-neutral-900/90 flex items-center justify-center text-neutral-300 shadow-inner">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-neutral-200">Gentle Human Moderation</h3>
          <p className="text-xs text-neutral-400 leading-relaxed font-light">
            Every submission is gently moderated to keep hate speech and harassment away, keeping this space safe for genuine human depth.
          </p>
        </div>

        <div className="rounded-3xl border border-white/[0.06] bg-[#0c0c11]/50 backdrop-blur-md p-7 space-y-3.5 hover:border-white/[0.12] transition-colors">
          <div className="w-10 h-10 rounded-2xl bg-neutral-900/90 flex items-center justify-center text-neutral-300 shadow-inner">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-neutral-200">Quiet Understanding</h3>
          <p className="text-xs text-neutral-400 leading-relaxed font-light">
            &ldquo;Nobody knows it&apos;s me, but someone might understand.&rdquo; Reading someone else&apos;s unsaid words reminds us of the quiet weight we all carry.
          </p>
        </div>
      </section>
    </div>
  );
}
