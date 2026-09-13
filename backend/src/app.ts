import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import { ENV } from './config/env';
import { generalLimiter } from './middleware/rateLimit.middleware';
import { errorHandler } from './middleware/error.middleware';
import postRoutes from './routes/post.routes';
import adminRoutes from './routes/admin.routes';

export const createApp = (): Express => {
  const app = express();

  // Security Headers (allow cross-origin images for frontend)
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // Serve static uploaded images
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // CORS configuration supporting production, preview domains, and localhost
  app.use(
    cors({
      origin: true, // Reflect request origin to allow credentials and all subdomains
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    })
  );

  // Body Parsing with safe limit to prevent denial of service
  app.use(express.json({ limit: '50kb' }));
  app.use(express.urlencoded({ extended: true, limit: '50kb' }));

  // General rate limiter
  app.use('/api', generalLimiter);

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      service: 'UNSAID API',
      timestamp: new Date().toISOString(),
    });
  });

  // API Routes
  app.use('/api/posts', postRoutes);
  app.use('/api/admin', adminRoutes);

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: `Route not found: ${req.method} ${req.path}`,
    });
  });

  // Central Error Handler
  app.use(errorHandler);

  return app;
};
