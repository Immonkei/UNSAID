import { Router } from 'express';
import { postController } from '../controllers/post.controller';
import { submissionLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

// Public routes
router.get('/categories', (req, res) => postController.getCategories(req, res));
router.get('/', (req, res, next) => postController.getPosts(req, res, next));
router.get('/:id', (req, res, next) => postController.getPostById(req, res, next));

// Submission with strict rate limiting (10 / hour per client)
router.post('/', submissionLimiter, (req, res, next) => postController.createPost(req, res, next));

// User interactions
router.post('/:id/report', (req, res, next) => postController.reportPost(req, res, next));
router.post('/:id/like', (req, res, next) => postController.likePost(req, res, next));

export default router;
