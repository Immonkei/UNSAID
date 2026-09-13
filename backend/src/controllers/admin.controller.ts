import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { ENV } from '../config/env';
import { loginSchema } from '../validators/auth.validator';
import { moderationService } from '../services/moderation.service';
import { facebookService } from '../services/facebook.service';
import { ModerationStatus, ReportStatus } from '@prisma/client';

export class AdminController {
  /**
   * Admin authentication / login.
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = loginSchema.parse(req.body);

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
        return;
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
        return;
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        ENV.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(200).json({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get all posts with admin filters.
   */
  async getPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = req.query.status as ModerationStatus | undefined;
      const category = req.query.category as string | undefined;
      const search = req.query.search as string | undefined;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await moderationService.getPosts({
        status,
        category,
        search,
        page,
        limit,
      });

      res.status(200).json({
        success: true,
        data: result.posts,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get pending posts.
   */
  async getPendingPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await moderationService.getPendingPosts(page, limit);

      res.status(200).json({
        success: true,
        data: result.posts,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Approve a post.
   */
  async approvePost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const publishToFacebook = req.body.publishToFacebook !== false;

      const result = await moderationService.approvePost(id, publishToFacebook);

      res.status(200).json({
        success: true,
        message: 'Post approved successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Reject a post.
   */
  async rejectPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const post = await moderationService.rejectPost(id);

      res.status(200).json({
        success: true,
        message: 'Post rejected',
        data: post,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Delete a post.
   */
  async deletePost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const result = await moderationService.deletePost(id);

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get reports list.
   */
  async getReports(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = req.query.status as ReportStatus | undefined;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await moderationService.getReports(status, page, limit);

      res.status(200).json({
        success: true,
        data: result.reports,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Update report status (RESOLVED / DISMISSED).
   */
  async updateReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const { status } = req.body;

      if (!status || !['RESOLVED', 'DISMISSED'].includes(status)) {
        res.status(400).json({
          success: false,
          message: 'Invalid status. Must be RESOLVED or DISMISSED',
        });
        return;
      }

      const report = await moderationService.updateReportStatus(id, status as ReportStatus);

      res.status(200).json({
        success: true,
        message: `Report marked as ${status}`,
        data: report,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Manual Facebook publish retry for an approved post.
   */
  async retryFacebookPublish(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const result = await facebookService.publishPost(id);

      res.status(200).json({
        success: result.success,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const adminController = new AdminController();
