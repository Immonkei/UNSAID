import { prisma } from '../config/database';
import { ENV } from '../config/env';

export interface PublishResult {
  success: boolean;
  facebookPostId?: string;
  error?: string;
}

export class FacebookService {
  /**
   * Publishes an approved post to the configured Facebook Page via Graph API.
   * Keeps Facebook publication status decoupled from moderation status.
   */
  async publishPost(postId: string): Promise<PublishResult> {
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return { success: false, error: 'Post not found' };
    }

    if (post.moderationStatus !== 'APPROVED') {
      return { success: false, error: 'Only approved posts can be published to Facebook' };
    }

    // Check if Facebook credentials are configured
    if (!ENV.FB_PAGE_ID || !ENV.FB_PAGE_ACCESS_TOKEN) {
      console.warn('[FacebookService] FB_PAGE_ID or FB_PAGE_ACCESS_TOKEN is missing. Skipping Facebook publication.');
      await prisma.post.update({
        where: { id: postId },
        data: {
          facebookStatus: 'FAILED',
          facebookError: 'Facebook credentials not configured in environment',
        },
      });
      return { success: false, error: 'Facebook credentials not configured' };
    }

    // Set status to PUBLISHING
    await prisma.post.update({
      where: { id: postId },
      data: { facebookStatus: 'PUBLISHING' },
    });

    const dedication = post.recipient ? `To: ${post.recipient}\n\n` : '';
    const messageText = `${dedication}"${post.content}"\n\n— Anonymous\n#${post.category.replace(/\s+/g, '')} #UNSAID`;

    try {
      const url = `https://graph.facebook.com/${ENV.FB_API_VERSION}/${ENV.FB_PAGE_ID}/feed`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          access_token: ENV.FB_PAGE_ACCESS_TOKEN,
        }),
      });

      const data = (await response.json()) as { id?: string; error?: { message: string; type: string; code: number } };

      if (!response.ok || data.error) {
        const errorMessage = data.error?.message || `HTTP ${response.status}: Failed to publish to Facebook`;
        console.error('[FacebookService] Publishing failed:', errorMessage);

        await prisma.post.update({
          where: { id: postId },
          data: {
            facebookStatus: 'FAILED',
            facebookError: errorMessage,
          },
        });

        return { success: false, error: errorMessage };
      }

      const publishedId = data.id || '';
      await prisma.post.update({
        where: { id: postId },
        data: {
          facebookStatus: 'PUBLISHED',
          facebookPostId: publishedId,
          facebookPublishedAt: new Date(),
          facebookError: null,
        },
      });

      return { success: true, facebookPostId: publishedId };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown Facebook API error';
      console.error('[FacebookService] Exception during publish:', errorMsg);

      await prisma.post.update({
        where: { id: postId },
        data: {
          facebookStatus: 'FAILED',
          facebookError: errorMsg,
        },
      });

      return { success: false, error: errorMsg };
    }
  }
}

export const facebookService = new FacebookService();
