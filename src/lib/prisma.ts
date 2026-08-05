import { PrismaClient } from "@prisma/client";
import "@/lib/env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function withServerlessConnectionLimit(url: string | undefined) {
  if (!url) {
    return url;
  }

  try {
    const parsed = new URL(url);
    if (!parsed.searchParams.has("connection_limit")) {
      // One connection per serverless isolate avoids MySQL max_connections exhaustion.
      parsed.searchParams.set("connection_limit", "1");
    }
    // Fail fast when MySQL is unreachable instead of hanging login/API requests.
    if (!parsed.searchParams.has("connect_timeout")) {
      parsed.searchParams.set("connect_timeout", "10");
    }
    if (!parsed.searchParams.has("pool_timeout")) {
      parsed.searchParams.set("pool_timeout", "10");
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

function createPrismaClient() {
  const url = withServerlessConnectionLimit(process.env.DATABASE_URL);

  return new PrismaClient({
    datasources: url ? { db: { url } } : undefined,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function isCurrentPrismaClient(client: PrismaClient) {
  // Dev hot-reload can keep an old PrismaClient after schema changes.
  // Bump this check whenever a new model/delegate is added.
  return (
    typeof client.testimonial !== "undefined" &&
    typeof client.workService !== "undefined" &&
    typeof client.clientWorkService !== "undefined" &&
    typeof client.setting !== "undefined" &&
    typeof client.stationaryLaunchSignup !== "undefined"
  );
}

function getPrismaClient() {
  const cached = globalForPrisma.prisma;

  if (cached && isCurrentPrismaClient(cached)) {
    return cached;
  }

  if (cached) {
    void cached.$disconnect().catch(() => undefined);
  }

  const client = createPrismaClient();
  // Always cache on globalThis so serverless/Fluid Compute reuses one client
  // per isolate instead of opening a new connection on every Proxy access.
  globalForPrisma.prisma = client;

  return client;
}

/**
 * Lazy proxy so schema updates recreate the client even when this module
 * was already loaded with a stale PrismaClient singleton.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
