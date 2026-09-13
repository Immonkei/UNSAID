import { prisma } from '../config/database';
import { facebookService } from './facebook.service';
import { ModerationStatus, ReportStatus, Prisma } from '@prisma/client';

export class ModerationService {
  /**
   * List posts for admin with filters, search, and pagination.
   */
  async getPosts(options: {
    status?: ModerationStatus;
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(options.page || 1, 1);
    const take = Math.min(Math.max(options.limit || 20, 1), 100);
    const skip = (page - 1) * take;

    const where: Prisma.PostWhereInput = {};

    if (options.status) {
      where.moderationStatus = options.status;
    }

    if (options.category) {
      where.category = options.category;
    }

    if (options.search) {
      where.content = {
        contains: options.search,
        mode: 'insensitive',
      };
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          _count: {
            select: {
              reports: true,
              likes: true,
            },
          },
        },
      }),
      prisma.post.count({ where }),
    ]);

    return {
      posts,
      pagination: {
        page,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  /**
   * Quick shortcut to get pending posts for moderation.
   */
  async getPendingPosts(page = 1, limit = 20) {
    return this.getPosts({
      status: 'PENDING',
      page,
      limit,
    });
  }

  /**
   * Approve a post. Optionally triggers Facebook publication.
   */
  async approvePost(id: string, publishToFacebook = true) {
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    const updated = await prisma.post.update({
      where: { id },
      data: {
        moderationStatus: 'APPROVED',
        approvedAt: new Date(),
      },
    });

    let fbResult = null;
    if (publishToFacebook) {
      // Run Facebook publishing in background/non-blocking to ensure moderation succeeds independently
      fbResult = await facebookService.publishPost(id);
    }

    return {
      post: updated,
      facebookResult: fbResult,
    };
  }

  /**
   * Reject a post.
   */
  async rejectPost(id: string) {
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    return prisma.post.update({
      where: { id },
      data: {
        moderationStatus: 'REJECTED',
      },
    });
  }

  /**
   * Delete a post completely.
   */
  async deletePost(id: string) {
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    await prisma.post.delete({
      where: { id },
    });

    return { success: true, message: 'Post deleted successfully' };
  }

  /**
   * Get reports with post details for admin review.
   */
  async getReports(status?: ReportStatus, page = 1, limit = 20) {
    const take = Math.min(Math.max(limit, 1), 50);
    const skip = (Math.max(page, 1) - 1) * take;

    const where: Prisma.ReportWhereInput = {};
    if (status) {
      where.status = status;
    }

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          post: {
            select: {
              id: true,
              content: true,
              category: true,
              moderationStatus: true,
            },
          },
        },
      }),
      prisma.report.count({ where }),
    ]);

    return {
      reports,
      pagination: {
        page,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  /**
   * Resolve or dismiss a report.
   */
  async updateReportStatus(reportId: string, status: ReportStatus) {
    return prisma.report.update({
      where: { id: reportId },
      data: {
        status,
        resolvedAt: new Date(),
      },
    });
  }
}

export const moderationService = new ModerationService();
