import pino from "pino";

/**
 * Structured logging utility using pino
 * Supports log levels: error, warn, info, debug
 *
 * Usage:
 *   logger.error({ error }, 'Error message');
 *   logger.warn('Warning message');
 *   logger.info({ userId: 123 }, 'User action');
 *   logger.debug('Debug information');
 *
 * Note: pino-pretty is disabled in development to avoid worker thread issues
 * with Next.js/Turbopack. Logs are output as JSON for better compatibility.
 */
const logger = pino({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  // Disable pino-pretty transport to avoid worker thread issues in Next.js/Turbopack
  // Use simple JSON output instead for better compatibility
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
});

export default logger;
