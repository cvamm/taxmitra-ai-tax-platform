import type { NextConfig } from "next";

/**
 * Load .env (for `npm run dev` / local `next start` on Node).
 * In serverless deploys (Vercel) process.env is already populated by the
 * platform, so this import is a no-op and never shadows platform vars.
 */
import "dotenv/config";

/**
 * A stray lockfile in the user's home directory would otherwise win the
 * workspace-root detection and resolve app paths relative to home.
 */
const nextConfig: NextConfig = {
  turbopack: { root: process.cwd() },
};

export default nextConfig;
