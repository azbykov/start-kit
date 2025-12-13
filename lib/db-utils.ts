/**
 * Database utility functions
 * Provides validation and helper functions for database operations
 */

/**
 * Validates DATABASE_URL format
 * @param url - Database connection string
 * @returns true if valid, throws error if invalid
 */
export function validateDatabaseUrl(url: string | undefined): boolean {
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Please configure it in your .env file."
    );
  }

  // More flexible PostgreSQL URL pattern validation
  // Supports postgresql://, postgres://, and various connection string formats
  const postgresUrlPattern =
    /^(postgresql|postgres):\/\/.+/;

  if (!postgresUrlPattern.test(url)) {
    throw new Error(
      `Invalid DATABASE_URL format. Expected format: postgresql://user:password@host:port/database`
    );
  }

  return true;
}

