import { z } from 'zod';
import dotenv from 'dotenv';
import logger from '../utils/logger';
dotenv.config();

const EnvSchema = z.object({
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  ACCESS_TOKEN_SECRET: z.string().min(15).default("your-Access-Token-secret"),
  REFRESH_TOKEN_SECRET: z.string().min(15).default("your-Refresh-Token-secret"),
  RESEND_API_KEY: z.string(),
});

const result = EnvSchema.safeParse(process.env);

if (!result.success) {
  logger.error("Environment variable validation failed:", result.error.format());
  process.exit(1);
}
logger.info("✅ Environment variables validated.");

export const env = result.data;