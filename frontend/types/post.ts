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
  author: 'Anonymous';
  createdAt: string;
  likeCount: number;
}

export interface AdminPost {
  id: string;
  content: string;
  category: string;
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
