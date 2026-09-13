'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import PostCard from '../../../components/PostCard';
import { Post } from '../../../types/post';
import { api } from '../../../lib/api';

export default function SinglePostPage() {
  const params = useParams();
  const id = params?.id as string;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchPost = async () => {
      try {
        const data = await api.getPostById(id);
        setPost(data);
      } catch {
        setError('This thought could not be found or has not been approved yet.');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-6">
      <Link
        href="/"
        className="inline-flex items-center space-x-2 text-xs text-neutral-400 hover:text-neutral-200 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to thoughts</span>
      </Link>

      {loading ? (
        <div className="rounded-2xl bg-neutral-900/40 border border-neutral-800/40 p-8 h-64 animate-pulse" />
      ) : error || !post ? (
        <div className="text-center py-16 px-4 rounded-2xl border border-neutral-800 bg-neutral-900/40 space-y-4">
          <p className="font-serif italic text-neutral-400 text-lg">{error || 'Thought not found'}</p>
          <Link
            href="/"
            className="inline-block px-4 py-2 rounded-full bg-neutral-800 text-xs text-neutral-200 hover:bg-neutral-700 transition-colors"
          >
            Explore Other Thoughts
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <PostCard post={post} showFullLink={false} />
        </div>
      )}
    </div>
  );
}
