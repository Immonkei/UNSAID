export type Category =
  | 'Love'
  | 'Heartbreak'
  | 'Life'
  | 'Family'
  | 'Friendship'
  | 'Overthinking'
  | 'Motivation'
  | 'Regret'
  | 'Letting Go'
  | 'Other';

export interface Post {
  id: string;
  content: string;
  category: Category | string;
  recipient?: string | null;
  imageUrl?: string | null;
  author: 'Anonymous';
  createdAt: string;
  likeCount: number;
}

export interface AdminPost {
  id: string;
  content: string;
  category: string;
  recipient?: string | null;
  imageUrl?: string | null;
  moderationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  facebookStatus: 'NOT_PUBLISHED' | 'PUBLISHING' | 'PUBLISHED' | 'FAILED';
  facebookPostId?: string | null;
  facebookPublishedAt?: string | null;
  facebookError?: string | null;
  createdAt: string;
  approvedAt?: string | null;
  _count?: {
    reports: number;
    likes: number;
  };
}

export interface ReportItem {
  id: string;
  postId: string;
  reason: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
  resolvedAt?: string | null;
  post?: {
    id: string;
    content: string;
    category: string;
    moderationStatus: string;
  };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminStats {
  totalPosts: number;
  pendingPosts: number;
  approvedPosts: number;
  rejectedPosts: number;
  totalReports: number;
  pendingReports: number;
  totalLikes: number;
}

export interface WhisperItem {
  id: string;
  content: string;
  author: string;
  createdAt: string;
}


