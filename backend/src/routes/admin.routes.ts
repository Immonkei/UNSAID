import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticateAdmin } from '../middleware/auth.middleware';
import { authLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

// Admin Login with rate limiting
router.post('/login', authLimiter, (req, res, next) => adminController.login(req, res, next));

// Moderation routes (protected)
router.use(authenticateAdmin);

router.get('/posts', (req, res, next) => adminController.getPosts(req, res, next));
router.get('/posts/pending', (req, res, next) => adminController.getPendingPosts(req, res, next));
router.patch('/posts/:id/approve', (req, res, next) => adminController.approvePost(req, res, next));
router.patch('/posts/:id/reject', (req, res, next) => adminController.rejectPost(req, res, next));
router.delete('/posts/:id', (req, res, next) => adminController.deletePost(req, res, next));
router.post('/posts/:id/facebook-publish', (req, res, next) => adminController.retryFacebookPublish(req, res, next));

// Stats route
router.get('/stats', (req, res, next) => adminController.getStats(req, res, next));

// Report management
router.get('/reports', (req, res, next) => adminController.getReports(req, res, next));
router.patch('/reports/:id', (req, res, next) => adminController.updateReport(req, res, next));

export default router;
