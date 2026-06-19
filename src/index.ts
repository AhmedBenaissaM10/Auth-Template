import { env } from './config/env'
import app from './app'
import logger from './utils/logger';
import { prisma } from './lib/prisma';
import { redisConnection } from './lib/redis';

const PORT = env.PORT || 4000;

process.on('uncaughtException', (err: Error) => {
  logger.error('💥 UNCAUGHT EXCEPTION! Shutting down...');
  logger.error(err.name, err.message);
  process.exit(1);
});

const start = async () => {
  await redisConnection();

  const server = app.listen(PORT, () => {
    logger.info(`🚀 Server running on http://localhost:${PORT}`);
  });

  process.on('SIGINT', async () => {
    await prisma.$disconnect();
    logger.info('Prisma disconnected');
    process.exit(0);
  });

  process.on('unhandledRejection', (err: Error) => {
    logger.error('💥 UNHANDLED REJECTION! Shutting down...');
    logger.error(err.name, err.message);
    server.close(() => {
      process.exit(1);
    });
  });

  process.on('SIGTERM', () => {
    logger.warn('🛑 SIGTERM received. Graceful shutdown...');
    server.close(() => {
      logger.warn('Process terminated.');
    });
  });
};

start();