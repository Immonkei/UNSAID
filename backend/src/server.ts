import { createApp } from './app';
import { ENV } from './config/env';
import { prisma } from './config/database';

const app = createApp();

const server = app.listen(ENV.PORT, () => {
  console.log(`[UNSAID Backend] Server running in ${ENV.NODE_ENV} mode on port ${ENV.PORT}`);
});

// Graceful shutdown handling
const shutdown = async (signal: string) => {
  console.log(`[UNSAID Backend] Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log('[UNSAID Backend] Prisma disconnected. Process exiting.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
