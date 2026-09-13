import { Post, AdminPost, ReportItem, Pagination } from '../types/post';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper for anonymous client identifier (UUID stored in localStorage)
export const getAnonymousIdentifier = (): string => {
  if (typeof window === 'undefined') return 'server_side_call';
  let id = localStorage.getItem('unsaid_anon_id');
  if (!id) {
    id = 'anon_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('unsaid_anon_id', id);
  }
  return id;
};

// Admin token storage helpers
export const getAdminToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('unsaid_admin_token');
};

export const setAdminToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('unsaid_admin_token', token);
  }
};

export const clearAdminToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('unsaid_admin_token');
  }
};

// Public API
export const api = {
  async getPosts(
    category?: string,
    page = 1,
    limit = 20
  ): Promise<{ posts: Post[]; pagination: Pagination }> {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const res = await fetch(`${API_BASE_URL}/posts?${params.toString()}`, {
      next: { revalidate: 10 },
    });
    if (!res.ok) throw new Error('Failed to fetch posts');
    const json = await res.json();
    return { posts: json.data, pagination: json.pagination };
  },

  async getPostById(id: string): Promise<Post> {
    const res = await fetch(`${API_BASE_URL}/posts/${id}`);
    if (!res.ok) throw new Error('Post not found');
    const json = await res.json();
    return json.data;
  },

  async submitThought(
    content: string,
    category: string,
    agreeToRules: boolean
  ): Promise<{ id: string; message: string }> {
    const res = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, category, agreeToRules }),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to submit thought');
    }
    return { id: json.data.id, message: json.message };
  },

  async likePost(postId: string): Promise<{ liked: boolean; likeCount: number }> {
    const anonId = getAnonymousIdentifier();
    const res = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ anonymousIdentifier: anonId }),
    });
    if (!res.ok) throw new Error('Failed to like post');
    const json = await res.json();
    return json.data;
  },

  async reportPost(postId: string, reason: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE_URL}/posts/${postId}/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to submit report');
    return { message: json.message };
  },

  // Admin APIs
  async adminLogin(email: string, password: string): Promise<{ token: string; user: { email: string; role: string } }> {
    const res = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Login failed');
    return json.data;
  },

  async adminGetPosts(
    token: string,
    options?: { status?: string; category?: string; search?: string; page?: number; limit?: number }
  ): Promise<{ posts: AdminPost[]; pagination: Pagination }> {
    const params = new URLSearchParams();
    if (options?.status) params.append('status', options.status);
    if (options?.category && options.category !== 'All') params.append('category', options.category);
    if (options?.search) params.append('search', options.search);
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());

    const res = await fetch(`${API_BASE_URL}/admin/posts?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch admin posts');
    const json = await res.json();
    return { posts: json.data, pagination: json.pagination };
  },

  async adminApprovePost(id: string, token: string, publishToFacebook = true): Promise<AdminPost> {
    const res = await fetch(`${API_BASE_URL}/admin/posts/${id}/approve`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ publishToFacebook }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to approve post');
    return json.data.post;
  },

  async adminRejectPost(id: string, token: string): Promise<AdminPost> {
    const res = await fetch(`${API_BASE_URL}/admin/posts/${id}/reject`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to reject post');
    return json.data;
  },

  async adminDeletePost(id: string, token: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/admin/posts/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to delete post');
  },

  async adminGetReports(
    token: string,
    status?: string,
    page = 1
  ): Promise<{ reports: ReportItem[]; pagination: Pagination }> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('page', page.toString());

    const res = await fetch(`${API_BASE_URL}/admin/reports?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch reports');
    const json = await res.json();
    return { reports: json.data, pagination: json.pagination };
  },

  async adminUpdateReport(id: string, status: 'RESOLVED' | 'DISMISSED', token: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/admin/reports/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update report');
  },

  async adminRetryFacebookPublish(id: string, token: string): Promise<{ success: boolean; error?: string }> {
    const res = await fetch(`${API_BASE_URL}/admin/posts/${id}/facebook-publish`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    return json.data;
  },
};
