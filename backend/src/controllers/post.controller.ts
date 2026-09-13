import { Request, Response, NextFunction } from 'express';
import { postService } from '../services/post.service';
import { storageService } from '../services/storage.service';
import { createPostSchema, reportPostSchema, likePostSchema, createWhisperSchema } from '../validators/post.validator';

export class PostController {
  async createPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = createPostSchema.parse(req.body);
      const result = await postService.createPost(
        validated.content,
        validated.category,
        validated.imageUrl,
        validated.recipient
      );

      res.status(201).json({
        success: true,
        message: 'Your unsaid thought has been submitted for moderation. Thank you for sharing.',
        data: {
          id: result.id,
          status: result.moderationStatus,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async uploadImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No image file uploaded',
        });
        return;
      }

      const imageUrl = await storageService.uploadImage(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );

      res.status(200).json({
        success: true,
        imageUrl,
      });
    } catch (err) {
      next(err);
    }
  }

  async getPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const category = req.query.category as string | undefined;
      const search = req.query.search as string | undefined;
      const sort = (req.query.sort === 'popular' ? 'popular' : 'latest') as 'latest' | 'popular';

      const result = await postService.getApprovedPosts(page, limit, category, search, sort);

      res.status(200).json({
        success: true,
        data: result.posts,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }

  async getPostById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const post = await postService.getPostById(id);

      if (!post) {
        res.status(404).json({
          success: false,
          message: 'Post not found or not approved',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: post,
      });
    } catch (err) {
      next(err);
    }
  }

  async getRandomPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const excludeId = req.query.excludeId as string | undefined;
      const post = await postService.getRandomPost(excludeId);

      if (!post) {
        res.status(404).json({
          success: false,
          message: 'No approved posts available yet',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: post,
      });
    } catch (err) {
      next(err);
    }
  }

  async likePost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const validated = likePostSchema.parse(req.body || {});

      // Fallback identifier if client didn't send one (hash of client IP)
      const identifier = validated.anonymousIdentifier || (req.ip || 'anonymous_client');

      const result = await postService.likePost(id, identifier);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async reportPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const validated = reportPostSchema.parse(req.body);

      const report = await postService.reportPost(id, validated.reason);

      res.status(201).json({
        success: true,
        message: 'Thank you. The report has been received and will be reviewed by moderators.',
        data: { id: report.id },
      });
    } catch (err) {
      next(err);
    }
  }

  getCategories(req: Request, res: Response): void {
    const categories = postService.getCategories();
    res.status(200).json({
      success: true,
      data: categories,
    });
  }

  async getWhispers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const whispers = await postService.getWhispers(id);

      res.status(200).json({
        success: true,
        data: whispers,
      });
    } catch (err) {
      next(err);
    }
  }

  async createWhisper(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const validated = createWhisperSchema.parse(req.body);

      const whisper = await postService.createWhisper(id, validated.content);

      res.status(201).json({
        success: true,
        message: 'Your quiet whisper was received.',
        data: whisper,
      });
    } catch (err) {
      next(err);
    }
  }

  async getCandleStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const identifier = (req.query.anonymousIdentifier as string) || (req.ip || 'anonymous_guest');
      const status = await postService.getCandleStatus(identifier);

      res.status(200).json({
        success: true,
        data: status,
      });
    } catch (err) {
      next(err);
    }
  }

  async toggleCandle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const identifier = (req.body?.anonymousIdentifier as string) || (req.ip || 'anonymous_guest');
      const result = await postService.toggleCandle(identifier);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const postController = new PostController();
