import { existsSync } from "node:fs";

import { defineConfig } from "@prisma/config";

/**
 * Prisma CLI configuration (Prisma 7).
 *
 * Prisma 7 removed `url` from the schema's datasource block and no longer loads
 * .env files automatically, so the connection string is resolved here for CLI
 * commands such as `prisma migrate` and `prisma db push`.
 *
 * Next.js loads .env.local itself at runtime; this only covers the CLI, which
 * runs outside Next. `process.loadEnvFile` is built into Node 20.12+, so no
 * dotenv dependency is required.
 *
 * No credential is ever hardcoded — if DATABASE_URL is unset, CLI commands that
 * need a live database will fail with Prisma's own error, which is the correct
 * behaviour until a Neon connection string is provided.
 */
for (const envFile of [".env", ".env.local"] as const) {
  if (existsSync(envFile)) {
    process.loadEnvFile(envFile);
  }
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
