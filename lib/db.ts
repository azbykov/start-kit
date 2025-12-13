import { PrismaClient } from "@prisma/client";
import logger from "./logger";
import { validateDatabaseUrl } from "./db-utils";

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Validate DATABASE_URL on import
try {
  validateDatabaseUrl(process.env.DATABASE_URL);
} catch (error) {
  const errorMessage =
    error instanceof Error ? error.message : "Unknown error";
  logger.error(
    { error: errorMessage },
    "Database configuration error: DATABASE_URL validation failed"
  );
  // Don't throw here - allow app to start, but database operations will fail
}

// Create Prisma Client instance
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? [
            { level: "query", emit: "stdout" },
            { level: "error", emit: "stdout" },
            { level: "warn", emit: "stdout" },
          ]
        : [{ level: "error", emit: "stdout" }],
  });

// Log connection establishment
logger.info("Prisma Client initialized");

// Prevent multiple instances in development (Next.js hot reload)
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown handler - only for production
// In development, Next.js hot reload handles connection cleanup automatically
if (process.env.NODE_ENV === "production") {
  const globalForShutdown = globalThis as unknown as {
    shutdownHandlerRegistered: boolean | undefined;
    isDisconnecting: boolean | undefined;
  };

  if (!globalForShutdown.shutdownHandlerRegistered) {
    process.on("beforeExit", async () => {
      // Prevent multiple disconnect calls
      if (globalForShutdown.isDisconnecting) {
        return;
      }
      globalForShutdown.isDisconnecting = true;

      try {
        logger.info("Closing database connection");
        await prisma.$disconnect();
        logger.info("Database connection closed");
      } catch (error) {
        // Ignore errors during shutdown
      }
    });
    globalForShutdown.shutdownHandlerRegistered = true;
  }
}

export default prisma;

