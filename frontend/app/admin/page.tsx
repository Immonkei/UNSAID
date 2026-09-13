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
  Flag,
  Inbox,
  CheckCircle2,
} from 'lucide-react';
import { AdminPost, ReportItem } from '../../types/post';
import { api, getAdminToken, clearAdminToken, resolveImageUrl } from '../../lib/api';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('pending');
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

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="rounded-full"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>

      {/* Shadcn Tabs */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val)}>
        <TabsList className="w-full sm:w-auto overflow-x-auto">
          <TabsTrigger value="pending" className="flex items-center space-x-2">
            <Inbox className="w-3.5 h-3.5" />
            <span>Pending Submissions</span>
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center space-x-2">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Approved Feed</span>
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center space-x-2">
            <X className="w-3.5 h-3.5 text-rose-400" />
            <span>Rejected Archive</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center space-x-2">
            <Flag className="w-3.5 h-3.5 text-amber-400" />
            <span>Reports</span>
          </TabsTrigger>
        </TabsList>

        {/* Filter Bar */}
        {activeTab !== 'reports' && (
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search through thought content..."
                className="pl-10"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-xl bg-neutral-900/80 border border-neutral-800 px-3.5 py-2 text-xs text-neutral-200 focus:outline-none focus:border-neutral-600"
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

            <Button
              variant="outline"
              size="icon"
              onClick={() => loadData()}
              title="Refresh"
            >
              <RotateCw className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Tab Content */}
        <div className="mt-6">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 rounded-3xl bg-neutral-900/30 border border-neutral-800/40 animate-pulse" />
              ))}
            </div>
          ) : activeTab === 'reports' ? (
            <div className="space-y-4">
              {reports.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-neutral-800/80 rounded-3xl text-xs text-neutral-500 font-light">
                  No reports to review at this moment. The community is peaceful.
                </div>
              ) : (
                reports.map((report) => (
                  <Card key={report.id} className="p-6 space-y-4">
                    <div className="flex items-center justify-between text-xs">
                      <Badge variant="warning">
                        Flag: {report.reason}
                      </Badge>
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
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleResolveReport(report.id, 'DISMISSED')}
                          disabled={actionLoading === report.id}
                        >
                          Dismiss Report
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            handleResolveReport(report.id, 'RESOLVED');
                            if (report.post) handleReject(report.post.id);
                          }}
                          disabled={actionLoading === report.id}
                        >
                          Take Down & Resolve
                        </Button>
                      </div>
                    )}
                  </Card>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {posts.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-neutral-800/80 rounded-3xl text-xs text-neutral-500 font-light">
                  No {activeTab} thoughts found matching your criteria.
                </div>
              ) : (
                posts.map((post) => (
                  <Card key={post.id} className="p-6 sm:p-7 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-neutral-400 gap-2">
                      <div className="flex items-center space-x-2.5">
                        <Badge variant="secondary">
                          {post.category}
                        </Badge>
                        <span className="text-neutral-500 font-mono text-[11px]">
                          {new Date(post.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            post.facebookStatus === 'PUBLISHED'
                              ? 'success'
                              : post.facebookStatus === 'FAILED'
                              ? 'destructive'
                              : 'outline'
                          }
                          className="font-mono text-[10px]"
                        >
                          FB: {post.facebookStatus}
                        </Badge>

                        {post.facebookStatus === 'FAILED' && (
                          <button
                            onClick={() => handleRetryFacebook(post.id)}
                            disabled={actionLoading === post.id}
                            className="text-xs text-blue-400 hover:underline flex items-center space-x-1 cursor-pointer"
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

                    {post.imageUrl && (
                      <div className="relative rounded-2xl overflow-hidden border border-neutral-800 max-h-60 max-w-sm bg-neutral-950">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={resolveImageUrl(post.imageUrl) || ''}
                          alt="Submitted image"
                          className="w-full h-auto max-h-60 object-contain rounded-2xl"
                        />
                      </div>
                    )}

                    {post.facebookError && (
                      <div className="flex items-center space-x-2 text-[11px] text-rose-400 bg-rose-950/20 p-3 rounded-xl border border-rose-900/40">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>Facebook Note: {post.facebookError}</span>
                      </div>
                    )}

                    <div className="pt-3 border-t border-neutral-800/70 flex items-center justify-between">
                      <div className="flex items-center space-x-3 text-[11px] text-neutral-500 font-mono">
                        <span>ID: {post.id.slice(0, 8)}</span>
                        {post._count && <span>• {post._count.likes} likes</span>}
                      </div>

                      <div className="flex items-center space-x-2">
                        {post.moderationStatus === 'PENDING' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(post.id)}
                              disabled={actionLoading === post.id}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleReject(post.id)}
                              disabled={actionLoading === post.id}
                              className="text-rose-300 hover:text-rose-200"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </Button>
                          </>
                        )}

                        {post.moderationStatus === 'APPROVED' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRetryFacebook(post.id)}
                            disabled={actionLoading === post.id}
                            title="Publish or re-publish to Facebook"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>Publish FB</span>
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(post.id)}
                          disabled={actionLoading === post.id}
                          className="text-neutral-500 hover:text-rose-400"
                          title="Permanently Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
}
