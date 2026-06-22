import "server-only";

import { loadEnvConfig } from "@next/env";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

loadEnvConfig(process.cwd());

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pool?: Pool;
};

function createClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    return null;
  }

  const pool =
    globalForPrisma.pool ??
    new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
    });

  if (!globalForPrisma.pool) {
    globalForPrisma.pool = pool;
  }

  return new PrismaClient({
    adapter: new PrismaPg(pool),
    log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
  });
}

function getClient() {
  if (!globalForPrisma.prisma) {
    const client = createClient();

    if (!client) {
      throw new Error("DATABASE_URL is required for Prisma.");
    }

    globalForPrisma.prisma = client;
  }

  return globalForPrisma.prisma;
}

export function getDb() {
  return getClient();
}

export const db = new Proxy({} as PrismaClient, {
  get(_target, property: PropertyKey, receiver) {
    const client = getClient();
    const value = Reflect.get(
      client as PrismaClient & Record<PropertyKey, unknown>,
      property,
      receiver,
    );

    if (typeof value === "function") {
      return Function.prototype.bind.call(value, client);
    }

    return value;
  },
}) as PrismaClient;

if (process.env.NODE_ENV !== "production" && process.env.DATABASE_URL) {
  globalForPrisma.prisma = getClient();
}
