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
  Inbox,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
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
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

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

  const showToast = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleApprove = async (id: string) => {
    if (!token) return;
    setActionLoading(id);
    try {
      await api.adminApprovePost(id, token, publishToFb);
      showToast('Post approved successfully');
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
      showToast('Post rejected and moved to archive');
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Rejection failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (!confirm('Are you sure you want to permanently delete this thought?')) return;
    setActionLoading(id);
    try {
      await api.adminDeletePost(id, token);
      showToast('Post permanently deleted');
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
        showToast('Published to Facebook successfully!');
      } else {
        alert(`Facebook publish note: ${res.error || 'Check FB credentials in .env'}`);
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
      showToast(`Report marked as ${status}`);
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
      {/* Toast Notification */}
      {statusMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 px-4 py-3 rounded-2xl bg-neutral-900 border border-neutral-700 text-neutral-100 text-xs shadow-2xl animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-6">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h1 className="text-2xl font-serif text-neutral-100 font-light">
              Moderation Portal
            </h1>
          </div>
          <p className="text-xs text-neutral-400 font-light">
            Review unfiltered submissions, protect community privacy, and control distribution.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2 text-xs text-neutral-300 bg-neutral-900/90 px-3.5 py-2 rounded-full border border-neutral-800 select-none cursor-pointer hover:border-neutral-700 transition-colors">
            <input
              type="checkbox"
              checked={publishToFb}
              onChange={(e) => setPublishToFb(e.target.checked)}
              className="w-3.5 h-3.5 rounded bg-neutral-950 border-neutral-700 text-neutral-100 focus:ring-0"
            />
            <span>Auto-publish to Facebook</span>
          </label>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-full border border-neutral-800 bg-neutral-900/90 text-xs text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-800/80 text-xs space-x-6 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 flex items-center space-x-2 transition-all border-b-2 font-medium cursor-pointer ${
            activeTab === 'pending'
              ? 'border-neutral-100 text-neutral-100 font-semibold'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Inbox className="w-3.5 h-3.5" />
          <span>Pending Submissions</span>
        </button>

        <button
          onClick={() => setActiveTab('approved')}
          className={`pb-3 flex items-center space-x-2 transition-all border-b-2 font-medium cursor-pointer ${
            activeTab === 'approved'
              ? 'border-emerald-400 text-neutral-100 font-semibold'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>Approved Feed</span>
        </button>

        <button
          onClick={() => setActiveTab('rejected')}
          className={`pb-3 flex items-center space-x-2 transition-all border-b-2 font-medium cursor-pointer ${
            activeTab === 'rejected'
              ? 'border-rose-400 text-neutral-100 font-semibold'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <X className="w-3.5 h-3.5 text-rose-400" />
          <span>Rejected Archive</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 flex items-center space-x-2 transition-all border-b-2 font-medium cursor-pointer ${
            activeTab === 'reports'
              ? 'border-amber-400 text-neutral-100 font-semibold'
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
              placeholder="Search through thought content..."
              className="w-full rounded-xl bg-neutral-900/80 border border-neutral-800 pl-10 pr-4 py-2 text-xs text-neutral-200 focus:outline-none focus:border-neutral-600"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl bg-neutral-900/80 border border-neutral-800 px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-neutral-600"
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
            className="p-2 rounded-xl bg-neutral-900/80 border border-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
            title="Refresh"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Content Area */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 rounded-3xl bg-neutral-900/30 border border-neutral-800/40 animate-pulse" />
          ))}
        </div>
      ) : activeTab === 'reports' ? (
        /* Reports View */
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-neutral-800/80 rounded-3xl text-xs text-neutral-500 font-light">
              No reports to review at this moment. The community is peaceful.
            </div>
          ) : (
            reports.map((report) => (
              <div
                key={report.id}
                className="rounded-3xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-sm p-6 space-y-4 shadow-sm"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="px-3 py-1 rounded-full bg-amber-950/40 border border-amber-800/60 text-amber-300 font-medium text-[11px]">
                    Flag: {report.reason}
                  </span>
                  <span className="text-neutral-500 font-mono text-[11px]">
                    Status: <strong className="text-neutral-300">{report.status}</strong>
                  </span>
                </div>

                {report.post && (
                  <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800/80 text-sm text-neutral-200 font-serif whitespace-pre-wrap leading-relaxed">
                    &ldquo;{report.post.content}&rdquo;
                  </div>
                )}

                {report.status === 'PENDING' && (
                  <div className="flex items-center justify-end space-x-2 pt-2">
                    <button
                      onClick={() => handleResolveReport(report.id, 'DISMISSED')}
                      disabled={actionLoading === report.id}
                      className="px-4 py-2 rounded-xl border border-neutral-700 bg-neutral-800 text-xs text-neutral-300 hover:bg-neutral-700 transition-colors"
                    >
                      Dismiss Report
                    </button>
                    <button
                      onClick={() => {
                        handleResolveReport(report.id, 'RESOLVED');
                        if (report.post) handleReject(report.post.id);
                      }}
                      disabled={actionLoading === report.id}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition-colors shadow-sm"
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
            <div className="text-center py-20 border border-dashed border-neutral-800/80 rounded-3xl text-xs text-neutral-500 font-light">
              No {activeTab} thoughts found matching your criteria.
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="rounded-3xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-sm p-6 sm:p-7 space-y-4 transition-all hover:border-neutral-700"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-neutral-400 gap-2">
                  <div className="flex items-center space-x-2.5">
                    <span className="px-3 py-1 rounded-full bg-neutral-800/90 text-neutral-300 text-[11px] font-medium">
                      {post.category}
                    </span>
                    <span className="text-neutral-500 font-mono text-[11px]">
                      {new Date(post.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {/* Facebook Publishing Status Pill */}
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider font-semibold uppercase ${
                        post.facebookStatus === 'PUBLISHED'
                          ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/80'
                          : post.facebookStatus === 'PUBLISHING'
                          ? 'bg-blue-950/70 text-blue-300 border border-blue-800/80 animate-pulse'
                          : post.facebookStatus === 'FAILED'
                          ? 'bg-rose-950/70 text-rose-300 border border-rose-800/80'
                          : 'bg-neutral-800/70 text-neutral-400 border border-neutral-700/60'
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

                <p className="text-neutral-100 text-base sm:text-lg font-serif font-light leading-relaxed whitespace-pre-wrap">
                  &ldquo;{post.content}&rdquo;
                </p>

                {post.facebookError && (
                  <div className="flex items-center space-x-2 text-[11px] text-rose-400 bg-rose-950/20 p-3 rounded-xl border border-rose-900/40">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Facebook Note: {post.facebookError}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-3 border-t border-neutral-800/70 flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-[11px] text-neutral-500 font-mono">
                    <span>ID: {post.id.slice(0, 8)}</span>
                    {post._count && <span>• {post._count.likes} likes</span>}
                  </div>

                  <div className="flex items-center space-x-2">
                    {post.moderationStatus === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleApprove(post.id)}
                          disabled={actionLoading === post.id}
                          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleReject(post.id)}
                          disabled={actionLoading === post.id}
                          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-rose-300 text-xs font-medium transition-all active:scale-95 cursor-pointer"
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
                        className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-200 transition-colors"
                        title="Publish or re-publish to Facebook"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Publish FB</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(post.id)}
                      disabled={actionLoading === post.id}
                      className="p-2 rounded-xl text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
                      title="Permanently Delete"
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
