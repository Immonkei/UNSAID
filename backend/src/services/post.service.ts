import { prisma } from '../config/database';
import { VALID_CATEGORIES } from '../validators/post.validator';

export class PostService {
  /**
   * Submit an anonymous thought. Enters PENDING state.
   */
  async createPost(content: string, category: string) {
    const post = await prisma.post.create({
      data: {
        content,
        category,
        moderationStatus: 'PENDING',
        facebookStatus: 'NOT_PUBLISHED',
      },
    });

    return {
      id: post.id,
      moderationStatus: post.moderationStatus,
    };
  }

  /**
   * Get public feed of approved posts with pagination and optional category filter.
   */
  async getApprovedPosts(page = 1, limit = 20, category?: string) {
    const take = Math.min(Math.max(limit, 1), 50);
    const skip = (Math.max(page, 1) - 1) * take;

    const whereClause: { moderationStatus: 'APPROVED'; category?: string } = {
      moderationStatus: 'APPROVED',
    };

    if (category && VALID_CATEGORIES.includes(category as (typeof VALID_CATEGORIES)[number])) {
      whereClause.category = category;
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: whereClause,
        orderBy: { approvedAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          content: true,
          category: true,
          createdAt: true,
          approvedAt: true,
          _count: {
            select: { likes: true },
          },
        },
      }),
      prisma.post.count({ where: whereClause }),
    ]);

    return {
      posts: posts.map((p) => ({
        id: p.id,
        content: p.content,
        category: p.category,
        author: 'Anonymous',
        createdAt: p.approvedAt || p.createdAt,
        likeCount: p._count.likes,
      })),
      pagination: {
        page,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  /**
   * Get single approved post.
   */
  async getPostById(id: string) {
    const post = await prisma.post.findFirst({
      where: {
        id,
        moderationStatus: 'APPROVED',
      },
      select: {
        id: true,
        content: true,
        category: true,
        createdAt: true,
        approvedAt: true,
        _count: {
          select: { likes: true },
        },
      },
    });

    if (!post) {
      return null;
    }

    return {
      id: post.id,
      content: post.content,
      category: post.category,
      author: 'Anonymous',
      createdAt: post.approvedAt || post.createdAt,
      likeCount: post._count.likes,
    };
  }

  /**
   * Like a post anonymously using a browser identifier or random hash.
   */
  async likePost(postId: string, anonymousIdentifier: string) {
    // Check if post exists and is approved
    const post = await prisma.post.findFirst({
      where: { id: postId, moderationStatus: 'APPROVED' },
    });

    if (!post) {
      throw new Error('Post not found or not approved');
    }

    // Try creating like; if already liked with this anonymousIdentifier, it ignores or unlikes
    const existing = await prisma.like.findUnique({
      where: {
        postId_anonymousIdentifier: {
          postId,
          anonymousIdentifier,
        },
      },
    });

    if (existing) {
      await prisma.like.delete({
        where: { id: existing.id },
      });
      const likeCount = await prisma.like.count({ where: { postId } });
      return { liked: false, likeCount };
    } else {
      await prisma.like.create({
        data: {
          postId,
          anonymousIdentifier,
        },
      });
      const likeCount = await prisma.like.count({ where: { postId } });
      return { liked: true, likeCount };
    }
  }

  /**
   * Report an approved post.
   */
  async reportPost(postId: string, reason: string) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    const report = await prisma.report.create({
      data: {
        postId,
        reason,
        status: 'PENDING',
      },
    });

    return report;
  }

  /**
   * Get all supported categories.
   */
  getCategories() {
    return [...VALID_CATEGORIES];
  }
}

export const postService = new PostService();
