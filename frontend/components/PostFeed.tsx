'use client';

import PostCard from './PostCard';
import { Post, Pagination } from '../types/post';

interface PostFeedProps {
  posts: Post[];
  loading: boolean;
  pagination?: Pagination;
  onPageChange?: (newPage: number) => void;
}

export default function PostFeed({
  posts,
  loading,
  pagination,
  onPageChange,
}: PostFeedProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-8">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl bg-neutral-900/40 border border-neutral-800/40 p-6 h-48 animate-pulse flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-20 h-4 bg-neutral-800 rounded-full" />
              <div className="w-full h-3 bg-neutral-800/80 rounded" />
              <div className="w-4/5 h-3 bg-neutral-800/60 rounded" />
            </div>
            <div className="w-24 h-3 bg-neutral-800/50 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-20 px-4 border border-dashed border-neutral-800/80 rounded-2xl bg-neutral-900/20">
        <p className="font-serif italic text-neutral-400 text-lg mb-2">No unsaid thoughts here yet.</p>
        <p className="text-xs text-neutral-400">
          Be the first to say what you couldn&apos;t say.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 pt-4">
          <button
            onClick={() => onPageChange?.(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900 text-xs text-neutral-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-800"
          >
            Previous
          </button>
          <span className="text-xs text-neutral-400 px-2">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => onPageChange?.(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900 text-xs text-neutral-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-800"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
