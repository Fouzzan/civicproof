import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

/**
 * Server-side Prisma client for CivicProof.
 *
 * Database credentials must never reach the browser (Docs/13-SECURITY.md §4,
 * §6), so this module is server-only. Route handlers and server components
 * import it; client components must not.
 */
if (typeof window !== "undefined") {
  throw new Error(
    "lib/db must only be imported from server-side code. Move the database " +
      "call into a route handler or server component.",
  );
}

const globalForPrisma = globalThis as unknown as {
  civicproofPrisma?: PrismaClient;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and add a " +
        "PostgreSQL (Neon) connection string.",
    );
  }

  // Prisma 7 connects through a driver adapter rather than a `url` in the
  // schema. PrismaPg speaks plain PostgreSQL, so the same code works against
  // Neon's pooled endpoint and a local Postgres instance.
  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

function getPrismaClient(): PrismaClient {
  // In development Next.js clears the module registry on every hot reload. The
  // client is cached on globalThis so a reload reuses one instance instead of
  // opening a new connection pool each time. In production the module is
  // evaluated once, so no global is needed.
  if (process.env.NODE_ENV === "production") {
    return (globalForPrisma.civicproofPrisma ??= createPrismaClient());
  }

  globalForPrisma.civicproofPrisma ??= createPrismaClient();
  return globalForPrisma.civicproofPrisma;
}

/**
 * Lazily-instantiated client. The underlying PrismaClient is created on first
 * property access, not at import time, so importing this module is safe before
 * DATABASE_URL is configured — a missing connection string surfaces when a
 * query is actually attempted rather than breaking the build.
 *
 * Usage is unchanged: `prisma.case.findUnique(...)`.
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = getPrismaClient();
    const value = Reflect.get(client, property, client);

    return typeof value === "function" ? value.bind(client) : value;
  },
});
