'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { PenLine, Shield, HeartHandshake, EyeOff } from 'lucide-react';
import CategoryFilter from '../components/CategoryFilter';
import PostFeed from '../components/PostFeed';
import { Post, Pagination } from '../types/post';
import { api } from '../lib/api';

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
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
      // Fallback empty posts on network error / initial DB empty
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

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-10 sm:py-16 space-y-6 max-w-2xl mx-auto">
        <span className="inline-block text-xs uppercase tracking-widest px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 font-mono">
          An Anonymous Emotional Sanctuary
        </span>
        <h1 className="text-4xl sm:text-5xl font-serif font-light tracking-tight text-neutral-100 leading-tight">
          Say what you <span className="italic underline decoration-neutral-700 underline-offset-8">can&apos;t say</span>.
        </h1>
        <p className="text-sm sm:text-base text-neutral-400 font-light leading-relaxed">
          The messages you never sent. The feelings you swallowed. The confessions kept deep inside. Release them here, completely anonymously.
        </p>
        <div className="pt-2 flex items-center justify-center space-x-4">
          <Link
            href="/submit"
            className="flex items-center space-x-2 px-6 py-3 rounded-full bg-neutral-100 text-neutral-950 font-medium text-sm hover:bg-neutral-200 transition-all hover:scale-105 shadow-md"
          >
            <PenLine className="w-4 h-4" />
            <span>Share Your Thought</span>
          </Link>
          <a
            href="#about"
            className="px-5 py-3 rounded-full border border-neutral-800 bg-neutral-900/60 text-neutral-300 font-medium text-sm hover:bg-neutral-800 transition-colors"
          >
            About UNSAID
          </a>
        </div>
      </section>

      {/* Categories & Feed Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-neutral-800/80 pb-3 gap-2">
          <h2 className="text-lg font-serif font-light text-neutral-200">
            Latest Anonymous Thoughts
          </h2>
          <span className="text-xs text-neutral-400 font-mono">
            {pagination.total} {pagination.total === 1 ? 'thought' : 'thoughts'} shared
          </span>
        </div>

        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
        />

        <PostFeed
          posts={posts}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </section>

      {/* About Section */}
      <section id="about" className="pt-16 border-t border-neutral-900 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-neutral-800/60 bg-neutral-900/30 p-6 space-y-3">
          <div className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-300">
            <EyeOff className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-neutral-200">Total Anonymity</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            No accounts, no email, no profile pictures. Every post is attributed solely to &ldquo;Anonymous&rdquo; so you can speak your truth without fear.
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-800/60 bg-neutral-900/30 p-6 space-y-3">
          <div className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-300">
            <Shield className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-neutral-200">Thoughtful Moderation</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Every submission is carefully reviewed by moderators before appearing on the site or our Facebook Page, keeping the environment safe and dignified.
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-800/60 bg-neutral-900/30 p-6 space-y-3">
          <div className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-300">
            <HeartHandshake className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-neutral-200">Shared Humanity</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            You are never as alone as you feel. Reading someone else&apos;s unsaid words reminds us of the quiet depth we all carry within.
          </p>
        </div>
      </section>
    </div>
  );
}
