'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { PenLine, Shield, HeartHandshake, EyeOff, Search, Sparkles } from 'lucide-react';
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

  // Filter & sort in-memory for instant responsive search
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

  // Featured thought (most liked or first thought)
  const featuredPost = useMemo(() => {
    if (posts.length === 0) return null;
    return [...posts].sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))[0];
  }, [posts]);

  return (
    <div className="space-y-14 sm:space-y-16">
      {/* Hero Section */}
      <section className="text-center py-10 sm:py-20 space-y-7 max-w-2xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-neutral-900/80 border border-neutral-800 text-neutral-300 text-xs font-mono shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>An anonymous sanctuary for what you never said</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-serif font-light tracking-tight text-neutral-100 leading-[1.15]">
          Say what you{' '}
          <span className="italic font-normal underline decoration-neutral-700 underline-offset-8">
            can&apos;t say
          </span>
          .
        </h1>

        <p className="text-sm sm:text-base text-neutral-400 font-light leading-relaxed max-w-xl mx-auto">
          The words you swallowed. The memories that linger. The confessions kept deep inside.
          Release them into the quiet — no names, no profiles, 100% anonymous.
        </p>

        <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/submit"
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-neutral-100 to-neutral-200 text-neutral-950 font-semibold text-sm hover:opacity-95 transition-all hover:scale-[1.03] active:scale-[0.98] shadow-[0_4px_20px_rgba(255,255,255,0.12)]"
          >
            <PenLine className="w-4 h-4" />
            <span>Share Your Thought</span>
          </Link>

          <a
            href="#thoughts"
            className="w-full sm:w-auto px-6 py-3.5 rounded-full border border-neutral-800 bg-neutral-900/50 backdrop-blur-sm text-neutral-300 font-medium text-sm hover:bg-neutral-800/80 transition-colors"
          >
            Read Confessions
          </a>
        </div>
      </section>

      {/* Featured / Spotlight Thought Banner (if available) */}
      {featuredPost && (
        <section className="relative rounded-3xl overflow-hidden border border-neutral-800/80 bg-gradient-to-b from-neutral-900/80 via-neutral-900/40 to-neutral-950 p-6 sm:p-10 shadow-2xl backdrop-blur-md">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-indigo-900/20 blur-3xl rounded-full pointer-events-none" />
          <div className="flex items-center space-x-2 text-[11px] uppercase tracking-widest text-indigo-400 font-mono font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Thought in the Spotlight</span>
          </div>
          <Link href={`/post/${featuredPost.id}`} className="block group">
            <blockquote className="text-xl sm:text-2xl md:text-3xl font-serif font-light text-neutral-100 leading-relaxed group-hover:text-white transition-colors">
              &ldquo;{featuredPost.content}&rdquo;
            </blockquote>
          </Link>
          <div className="mt-5 flex items-center justify-between text-xs text-neutral-500 font-mono">
            <span>— Anonymous • #{featuredPost.category}</span>
            <span>{featuredPost.likeCount || 0} felt this</span>
          </div>
        </section>
      )}

      {/* Categories, Search & Feed Section */}
      <section id="thoughts" className="space-y-6 pt-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800/80 pb-4">
          <div>
            <h2 className="text-xl font-serif font-light text-neutral-100">
              Unspoken Archives
            </h2>
            <p className="text-xs text-neutral-400 font-light">
              Explore unfiltered thoughts written by strangers around the world.
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
                className="w-full bg-neutral-900/80 border border-neutral-800 rounded-full pl-8 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
              />
            </div>

            {/* Sort Toggle */}
            <div className="flex items-center bg-neutral-900/80 p-0.5 rounded-full border border-neutral-800 text-xs">
              <button
                onClick={() => setSortBy('latest')}
                className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                  sortBy === 'latest'
                    ? 'bg-neutral-800 text-neutral-100'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Latest
              </button>
              <button
                onClick={() => setSortBy('popular')}
                className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                  sortBy === 'popular'
                    ? 'bg-neutral-800 text-neutral-100'
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
      <section id="about" className="pt-20 border-t border-neutral-900 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-3xl border border-neutral-800/60 bg-neutral-900/30 backdrop-blur-sm p-7 space-y-3.5 hover:border-neutral-700/60 transition-colors">
          <div className="w-10 h-10 rounded-2xl bg-neutral-800/80 flex items-center justify-center text-neutral-200 shadow-inner">
            <EyeOff className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-neutral-100">Absolute Anonymity</h3>
          <p className="text-xs text-neutral-400 leading-relaxed font-light">
            We never ask for your email, phone, name, or account. Every entry is attributed solely to &ldquo;Anonymous&rdquo; so you can be completely honest without consequences.
          </p>
        </div>

        <div className="rounded-3xl border border-neutral-800/60 bg-neutral-900/30 backdrop-blur-sm p-7 space-y-3.5 hover:border-neutral-700/60 transition-colors">
          <div className="w-10 h-10 rounded-2xl bg-neutral-800/80 flex items-center justify-center text-neutral-200 shadow-inner">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-neutral-100">Empathetic Moderation</h3>
          <p className="text-xs text-neutral-400 leading-relaxed font-light">
            Every submission is gently moderated to keep hate speech, harassment, and private details away, preserving a safe haven for sincere emotions.
          </p>
        </div>

        <div className="rounded-3xl border border-neutral-800/60 bg-neutral-900/30 backdrop-blur-sm p-7 space-y-3.5 hover:border-neutral-700/60 transition-colors">
          <div className="w-10 h-10 rounded-2xl bg-neutral-800/80 flex items-center justify-center text-neutral-200 shadow-inner">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-neutral-100">Shared Vulnerability</h3>
          <p className="text-xs text-neutral-400 leading-relaxed font-light">
            &ldquo;Nobody knows it&apos;s me, but someone might understand.&rdquo; When you read what others left unsaid, you realize you were never truly alone.
          </p>
        </div>
      </section>
    </div>
  );
}
