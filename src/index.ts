
import { env } from './config/env'
import app from './app'
import logger from './utils/logger';
import { prisma } from './lib/prisma';



const PORT = env.PORT || 4000

process.on('uncaughtException', (err: Error) => {
  logger.error('💥 UNCAUGHT EXCEPTION! Shutting down...');
  logger.error(err.name, err.message);
  process.exit(1); // Must exit — app state is now unreliable
});

const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT} `);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  logger.info("Prisma disconnected ")
  process.exit(0);
});


// --- Unhandled async promise rejections ---
process.on('unhandledRejection', (err: Error) => {
  logger.error('💥 UNHANDLED REJECTION! Shutting down...');
  logger.error(err.name, err.message);
  server.close(() => {
    process.exit(1); // Graceful shutdown — let current requests finish
  });
});

// --- Graceful shutdown on SIGTERM (e.g. from Docker/Kubernetes) ---
process.on('SIGTERM', () => {
  logger.warn('🛑 SIGTERM received. Graceful shutdown...');
  server.close(() => {
    logger.warn('Process terminated.');
  });
});



