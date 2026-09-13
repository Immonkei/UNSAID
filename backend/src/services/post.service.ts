import { prisma } from '../config/database';
import { VALID_CATEGORIES } from '../validators/post.validator';

export class PostService {
  /**
   * Submit an anonymous thought. Enters PENDING state.
   */
  async createPost(content: string, category: string, imageUrl?: string | null, recipient?: string | null) {
    const post = await prisma.post.create({
      data: {
        content,
        category,
        recipient: recipient ? recipient.trim() : null,
        imageUrl: imageUrl || null,
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
   * Get public feed of approved posts with pagination, search, category filter, and sorting.
   */
  async getApprovedPosts(
    page = 1,
    limit = 20,
    category?: string,
    search?: string,
    sort: 'latest' | 'popular' = 'latest'
  ) {
    const take = Math.min(Math.max(limit, 1), 50);
    const skip = (Math.max(page, 1) - 1) * take;

    const whereClause: any = {
      moderationStatus: 'APPROVED',
    };

    if (category && category !== 'All' && VALID_CATEGORIES.includes(category as (typeof VALID_CATEGORIES)[number])) {
      whereClause.category = category;
    }

    if (search && search.trim()) {
      const rawTerm = search.trim();
      const cleanTerm = rawTerm.startsWith('#') ? rawTerm.slice(1).trim() : rawTerm;
      whereClause.OR = [
        { content: { contains: rawTerm, mode: 'insensitive' } },
        { content: { contains: cleanTerm, mode: 'insensitive' } },
        { recipient: { contains: cleanTerm, mode: 'insensitive' } },
      ];
    }

    // Order by likes count or recency
    const orderBy: any =
      sort === 'popular'
        ? { likes: { _count: 'desc' } }
        : [{ approvedAt: 'desc' }, { createdAt: 'desc' }];

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: whereClause,
        orderBy,
        skip,
        take,
        select: {
          id: true,
          content: true,
          category: true,
          recipient: true,
          imageUrl: true,
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
        recipient: p.recipient,
        imageUrl: p.imageUrl,
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
        recipient: true,
        imageUrl: true,
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
      recipient: post.recipient,
      imageUrl: post.imageUrl,
      author: 'Anonymous',
      createdAt: post.approvedAt || post.createdAt,
      likeCount: post._count.likes,
    };
  }

  /**
   * Get a random approved thought for serendipity discovery.
   */
  async getRandomPost(excludeId?: string) {
    const where: any = {
      moderationStatus: 'APPROVED',
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const count = await prisma.post.count({ where });
    if (count === 0) {
      return null;
    }

    const randomSkip = Math.floor(Math.random() * count);
    const [post] = await prisma.post.findMany({
      where,
      skip: randomSkip,
      take: 1,
      select: {
        id: true,
        content: true,
        category: true,
        recipient: true,
        imageUrl: true,
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
      recipient: post.recipient,
      imageUrl: post.imageUrl,
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

  /**
   * Get all quiet whispers (unsent replies) for an approved post.
   */
  async getWhispers(postId: string) {
    const post = await prisma.post.findFirst({
      where: { id: postId, moderationStatus: 'APPROVED' },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    const whispers = await prisma.whisper.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
      take: 50,
      select: {
        id: true,
        content: true,
        createdAt: true,
      },
    });

    return whispers.map((w) => ({
      id: w.id,
      content: w.content,
      author: 'A stranger who understood',
      createdAt: w.createdAt,
    }));
  }

  /**
   * Leave a quiet whisper (gentle note of understanding) on a thought.
   */
  async createWhisper(postId: string, content: string) {
    const post = await prisma.post.findFirst({
      where: { id: postId, moderationStatus: 'APPROVED' },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    const whisper = await prisma.whisper.create({
      data: {
        postId,
        content,
      },
    });

    return {
      id: whisper.id,
      content: whisper.content,
      author: 'A stranger who understood',
      createdAt: whisper.createdAt,
    };
  }

  /**
   * Get candle vigil stats (total candles lit and whether current visitor has lit one).
   */
  async getCandleStatus(anonymousIdentifier: string) {
    const [totalCandles, userCandle] = await Promise.all([
      prisma.candle.count(),
      prisma.candle.findUnique({
        where: { anonymousIdentifier },
      }),
    ]);

    return {
      totalCandles,
      hasLit: Boolean(userCandle),
    };
  }

  /**
   * Toggle candle vigil (light or extinguish silent warmth).
   */
  async toggleCandle(anonymousIdentifier: string) {
    const existing = await prisma.candle.findUnique({
      where: { anonymousIdentifier },
    });

    if (existing) {
      await prisma.candle.delete({
        where: { id: existing.id },
      });
      const totalCandles = await prisma.candle.count();
      return { hasLit: false, totalCandles };
    } else {
      await prisma.candle.create({
        data: { anonymousIdentifier },
      });
      const totalCandles = await prisma.candle.count();
      return { hasLit: true, totalCandles };
    }
  }
}

export const postService = new PostService();

