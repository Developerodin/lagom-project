import { PrismaClient } from "@prisma/client";
import "@/lib/env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  return new PrismaClient({
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

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }

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
