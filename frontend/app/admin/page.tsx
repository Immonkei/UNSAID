'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Check,
  X,
  Trash2,
  Share2,
  RotateCw,
  Search,
  LogOut,
  AlertTriangle,
  FileText,
  Flag,
} from 'lucide-react';
import { AdminPost, ReportItem } from '../../types/post';
import { api, getAdminToken, clearAdminToken } from '../../lib/api';

type Tab = 'pending' | 'approved' | 'rejected' | 'reports';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('pending');
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [publishToFb, setPublishToFb] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const token = typeof window !== 'undefined' ? getAdminToken() : null;

  const loadData = useCallback(async () => {
    if (!token) {
      router.push('/admin/login');
      return;
    }

    setLoading(true);
    try {
      if (activeTab === 'reports') {
        const res = await api.adminGetReports(token);
        setReports(res.reports);
      } else {
        const status =
          activeTab === 'pending'
            ? 'PENDING'
            : activeTab === 'approved'
            ? 'APPROVED'
            : 'REJECTED';

        const res = await api.adminGetPosts(token, {
          status,
          category: selectedCategory,
          search: search.trim() || undefined,
        });
        setPosts(res.posts);
      }
    } catch {
      clearAdminToken();
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  }, [token, activeTab, selectedCategory, search, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApprove = async (id: string) => {
    if (!token) return;
    setActionLoading(id);
    try {
      await api.adminApprovePost(id, token, publishToFb);
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Approval failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!token) return;
    setActionLoading(id);
    try {
      await api.adminRejectPost(id, token);
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Rejection failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (!confirm('Are you sure you want to delete this thought?')) return;
    setActionLoading(id);
    try {
      await api.adminDeletePost(id, token);
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRetryFacebook = async (id: string) => {
    if (!token) return;
    setActionLoading(id);
    try {
      const res = await api.adminRetryFacebookPublish(id, token);
      if (res.success) {
        alert('Published to Facebook successfully!');
      } else {
        alert(`Facebook publish failed: ${res.error}`);
      }
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Publish failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResolveReport = async (id: string, status: 'RESOLVED' | 'DISMISSED') => {
    if (!token) return;
    setActionLoading(id);
    try {
      await api.adminUpdateReport(id, status, token);
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    clearAdminToken();
    router.push('/admin/login');
  };

  return (
    <div className="space-y-8 py-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h1 className="text-2xl font-serif text-neutral-100">Moderation Dashboard</h1>
          <p className="text-xs text-neutral-400">
            Review submissions, maintain community safety, and manage Facebook publishing.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2 text-xs text-neutral-400 bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-800 select-none cursor-pointer">
            <input
              type="checkbox"
              checked={publishToFb}
              onChange={(e) => setPublishToFb(e.target.checked)}
              className="rounded bg-neutral-950 border-neutral-700"
            />
            <span>Auto-publish to Facebook</span>
          </label>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900 text-xs text-neutral-300 hover:bg-neutral-800 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-800 text-xs space-x-6">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 flex items-center space-x-1.5 transition-colors border-b-2 font-medium ${
            activeTab === 'pending'
              ? 'border-neutral-100 text-neutral-100'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Pending Submissions</span>
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          className={`pb-3 flex items-center space-x-1.5 transition-colors border-b-2 font-medium ${
            activeTab === 'approved'
              ? 'border-neutral-100 text-neutral-100'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>Approved Feed</span>
        </button>
        <button
          onClick={() => setActiveTab('rejected')}
          className={`pb-3 flex items-center space-x-1.5 transition-colors border-b-2 font-medium ${
            activeTab === 'rejected'
              ? 'border-neutral-100 text-neutral-100'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <X className="w-3.5 h-3.5 text-rose-400" />
          <span>Rejected Archive</span>
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 flex items-center space-x-1.5 transition-colors border-b-2 font-medium ${
            activeTab === 'reports'
              ? 'border-neutral-100 text-neutral-100'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Flag className="w-3.5 h-3.5 text-amber-400" />
          <span>Reports</span>
        </button>
      </div>

      {/* Search & Filter Bar (for posts) */}
      {activeTab !== 'reports' && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search thoughts content..."
              className="w-full rounded-xl bg-neutral-900 border border-neutral-800 pl-10 pr-4 py-2 text-xs text-neutral-200 focus:outline-none focus:border-neutral-700"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl bg-neutral-900 border border-neutral-800 px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-neutral-700"
          >
            <option value="All">All Categories</option>
            <option value="Love">Love</option>
            <option value="Heartbreak">Heartbreak</option>
            <option value="Life">Life</option>
            <option value="Family">Family</option>
            <option value="Friendship">Friendship</option>
            <option value="Overthinking">Overthinking</option>
            <option value="Motivation">Motivation</option>
            <option value="Regret">Regret</option>
            <option value="Letting Go">Letting Go</option>
            <option value="Other">Other</option>
          </select>
          <button
            onClick={() => loadData()}
            className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
            title="Refresh"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Content Area */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-neutral-900/40 border border-neutral-800/40 animate-pulse" />
          ))}
        </div>
      ) : activeTab === 'reports' ? (
        /* Reports View */
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-neutral-800 rounded-2xl text-xs text-neutral-400">
              No reports to review.
            </div>
          ) : (
            reports.map((report) => (
              <div
                key={report.id}
                className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-1 rounded bg-amber-950/60 border border-amber-800/60 text-amber-300 font-medium">
                    Reason: {report.reason}
                  </span>
                  <span className="text-neutral-400">
                    Status: <strong className="text-neutral-200">{report.status}</strong>
                  </span>
                </div>
                {report.post && (
                  <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800 text-xs text-neutral-300 font-serif whitespace-pre-wrap">
                    &ldquo;{report.post.content}&rdquo;
                  </div>
                )}
                {report.status === 'PENDING' && (
                  <div className="flex items-center justify-end space-x-2 pt-2">
                    <button
                      onClick={() => handleResolveReport(report.id, 'DISMISSED')}
                      disabled={actionLoading === report.id}
                      className="px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800 text-xs text-neutral-300 hover:bg-neutral-700 transition-colors"
                    >
                      Dismiss Report
                    </button>
                    <button
                      onClick={() => {
                        handleResolveReport(report.id, 'RESOLVED');
                        if (report.post) handleReject(report.post.id);
                      }}
                      disabled={actionLoading === report.id}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition-colors"
                    >
                      Take Down & Resolve
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        /* Posts View */
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-neutral-800 rounded-2xl text-xs text-neutral-400">
              No {activeTab} posts found.
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4"
              >
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-neutral-800 text-neutral-300">
                      {post.category}
                    </span>
                    <span>{new Date(post.createdAt).toLocaleString()}</span>
                  </div>

                  {/* Facebook Publishing Status Pill */}
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                        post.facebookStatus === 'PUBLISHED'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : post.facebookStatus === 'PUBLISHING'
                          ? 'bg-blue-950 text-blue-300 border border-blue-800'
                          : post.facebookStatus === 'FAILED'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      FB: {post.facebookStatus}
                    </span>

                    {post.facebookStatus === 'FAILED' && (
                      <button
                        onClick={() => handleRetryFacebook(post.id)}
                        disabled={actionLoading === post.id}
                        className="text-xs text-blue-400 hover:underline flex items-center space-x-1"
                        title={post.facebookError || 'Retry publish'}
                      >
                        <RotateCw className="w-3 h-3" />
                        <span>Retry</span>
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-neutral-200 text-sm sm:text-base font-serif font-light whitespace-pre-wrap">
                  &ldquo;{post.content}&rdquo;
                </p>

                {post.facebookError && (
                  <div className="flex items-center space-x-1 text-[11px] text-rose-400 bg-rose-950/30 p-2 rounded-lg border border-rose-900/50">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Facebook Error: {post.facebookError}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-neutral-400 font-mono">
                    ID: {post.id.slice(0, 8)}...
                  </span>

                  <div className="flex items-center space-x-2">
                    {post.moderationStatus === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleApprove(post.id)}
                          disabled={actionLoading === post.id}
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleReject(post.id)}
                          disabled={actionLoading === post.id}
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-rose-300 text-xs font-medium transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </>
                    )}

                    {post.moderationStatus === 'APPROVED' && (
                      <button
                        onClick={() => handleRetryFacebook(post.id)}
                        disabled={actionLoading === post.id}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-200 transition-colors"
                        title="Publish or re-publish to Facebook"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Publish to FB</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(post.id)}
                      disabled={actionLoading === post.id}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
                      title="Delete post"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
