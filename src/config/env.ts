import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();

const EnvSchema = z.object({
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const result = EnvSchema.safeParse(process.env);

if (!result.success) {
  console.error("Environment variable validation failed:", result.error.format());
  process.exit(1);
}
console.log("✅ Environment variables validated.");

export const env = result.data;