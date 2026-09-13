'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { PenLine, Shield, HeartHandshake, EyeOff, Search, Sparkles, Moon } from 'lucide-react';
import CategoryFilter from '../components/CategoryFilter';
import PostFeed from '../components/PostFeed';
import { Post, Pagination } from '../types/post';
import { api } from '../lib/api';

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const loadPosts = useCallback(async (cat: string, pageNum: number) => {
    setLoading(true);
    try {
      const data = await api.getPosts(cat === 'All' ? undefined : cat, pageNum);
      setPosts(data.posts);
      setPagination(data.pagination);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts(selectedCategory, 1);
  }, [selectedCategory, loadPosts]);

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
  };

  const handlePageChange = (newPage: number) => {
    loadPosts(selectedCategory, newPage);
  };

  // Filter & sort
  const displayedPosts = useMemo(() => {
    let list = [...posts];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) => p.content.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'popular') {
      list.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
    }

    return list;
  }, [posts, searchQuery, sortBy]);

  // Featured thought (most felt confession)
  const featuredPost = useMemo(() => {
    if (posts.length === 0) return null;
    return [...posts].sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))[0];
  }, [posts]);

  return (
    <div className="space-y-16 sm:space-y-20">
      {/* Cinematic Melancholic Hero Section */}
      <section className="text-center py-12 sm:py-24 space-y-8 max-w-2xl mx-auto relative">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-neutral-900/90 border border-white/[0.08] text-neutral-400 text-xs font-mono shadow-inner tracking-wider">
          <Moon className="w-3.5 h-3.5 text-indigo-400" />
          <span>The midnight archive of unspoken feelings</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-light tracking-tight text-neutral-100 leading-[1.12]">
          Say what you{' '}
          <span className="italic font-normal underline decoration-neutral-700 underline-offset-[10px]">
            can&apos;t say
          </span>
          .
        </h1>

        <p className="text-sm sm:text-base text-neutral-400 font-light leading-relaxed max-w-xl mx-auto font-serif italic selection:bg-neutral-800">
          &ldquo;Somewhere in the quiet of the night, the words we swallowed hurt the most. Release them here into the dark — no judgment, no accounts, totally anonymous.&rdquo;
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/submit"
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-300 text-neutral-950 font-semibold text-sm hover:opacity-95 transition-all hover:scale-[1.03] active:scale-[0.98] shadow-[0_4px_25px_rgba(255,255,255,0.12)] cursor-pointer"
          >
            <PenLine className="w-4 h-4" />
            <span>Leave a Confession</span>
          </Link>

          <a
            href="#thoughts"
            className="w-full sm:w-auto px-7 py-3.5 rounded-full border border-white/[0.08] bg-[#0c0c11]/80 backdrop-blur-md text-neutral-300 font-medium text-sm hover:bg-neutral-800/80 hover:text-white transition-all cursor-pointer"
          >
            Read the Unsaid
          </a>
        </div>
      </section>

      {/* Featured / Spotlight Thought Banner */}
      {featuredPost && (
        <section className="relative rounded-3xl overflow-hidden border border-white/[0.08] bg-gradient-to-b from-[#0e0e14]/90 via-[#0a0a0f]/80 to-[#060608] p-7 sm:p-11 shadow-2xl backdrop-blur-xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-56 h-56 bg-indigo-950/30 blur-3xl rounded-full pointer-events-none" />
          <div className="flex items-center space-x-2 text-[11px] uppercase tracking-widest text-indigo-400 font-mono font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Most Felt by Strangers</span>
          </div>
          <Link href={`/post/${featuredPost.id}`} className="block group">
            <blockquote className="text-xl sm:text-2xl md:text-3xl font-serif font-light text-neutral-100 leading-relaxed group-hover:text-white transition-colors">
              &ldquo;{featuredPost.content}&rdquo;
            </blockquote>
          </Link>
          <div className="mt-6 flex items-center justify-between text-xs text-neutral-500 font-mono">
            <span>— Anonymous • #{featuredPost.category}</span>
            <span className="text-rose-400/80">❤️ {featuredPost.likeCount || 0} felt this</span>
          </div>
        </section>
      )}

      {/* Feed Section */}
      <section id="thoughts" className="space-y-6 pt-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
          <div>
            <h2 className="text-xl font-serif font-light text-neutral-100">
              Unspoken Archives
            </h2>
            <p className="text-xs text-neutral-500 font-light">
              Unfiltered thoughts written into the quiet by strangers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search words..."
                className="w-full bg-[#0c0c11] border border-white/[0.08] rounded-full pl-8 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
              />
            </div>

            {/* Sort Toggle */}
            <div className="flex items-center bg-[#0c0c11] p-0.5 rounded-full border border-white/[0.08] text-xs">
              <button
                onClick={() => setSortBy('latest')}
                className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                  sortBy === 'latest'
                    ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Latest
              </button>
              <button
                onClick={() => setSortBy('popular')}
                className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                  sortBy === 'popular'
                    ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Most Felt
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
        />

        {/* Post Feed */}
        <PostFeed
          posts={displayedPosts}
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
