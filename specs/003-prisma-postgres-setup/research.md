# Research: Prisma + PostgreSQL Setup

**Feature**: Prisma + PostgreSQL Database Setup  
**Date**: 2025-01-27  
**Purpose**: Resolve technical decisions and best practices for Prisma + PostgreSQL integration in Next.js

## Research Questions

### 1. Prisma Setup and Configuration

**Question**: What is the recommended way to set up Prisma in a Next.js App Router project?

**Decision**: Use Prisma with Next.js App Router following the official Next.js + Prisma integration pattern.

**Rationale**:
- Prisma officially supports Next.js with dedicated documentation
- App Router requires special handling for Prisma Client singleton to avoid connection pool exhaustion
- Next.js 16 recommends creating Prisma Client instance in a separate module with singleton pattern

**Alternatives Considered**:
- Direct database queries (rejected: loses type safety and ORM benefits)
- Other ORMs like TypeORM, Sequelize (rejected: Prisma is specified in constitution and provides better TypeScript integration)

**References**:
- [Prisma Next.js Guide](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management#prismaclient-in-serverless-environments)
- [Next.js Database Documentation](https://nextjs.org/docs/app/building-your-application/data-fetching/databases)

---

### 2. Prisma Client Singleton Pattern

**Question**: How to implement Prisma Client singleton in Next.js to avoid connection pool exhaustion?

**Decision**: Create Prisma Client instance in `lib/db.ts` with global variable pattern for development and module-level caching for production.

**Rationale**:
- Next.js hot reloading in development can create multiple Prisma Client instances
- Global variable pattern prevents multiple instances in development
- Module-level caching works in production (serverless environments)
- Matches Prisma's official recommendation for Next.js

**Implementation Pattern**:
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**Alternatives Considered**:
- Creating new instance on each import (rejected: causes connection pool exhaustion)
- Using Prisma Client extension (rejected: unnecessary complexity for MVP)

**References**:
- [Prisma Connection Management](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)

---

### 3. PostgreSQL Setup Options

**Question**: What are the best options for running PostgreSQL locally during development?

**Decision**: Support both local PostgreSQL installation and Docker-based setup, with Docker as recommended option.

**Rationale**:
- Docker provides consistent environment across developers
- Easier setup for new developers (no local PostgreSQL installation needed)
- Can be documented with docker-compose for convenience
- Local installation still supported for developers who prefer it

**Alternatives Considered**:
- Only Docker (rejected: some developers prefer local installation)
- Only local installation (rejected: Docker is more portable and easier to set up)

**References**:
- [PostgreSQL Docker Official Image](https://hub.docker.com/_/postgres)
- [Docker Compose for Development](https://docs.docker.com/compose/)

---

### 4. Schema Push vs Migrations

**Question**: How to handle schema changes during development without migrations?

**Decision**: Use `prisma db push` for all schema changes during development phase. Document that migrations will be used after first production release.

**Rationale**:
- `prisma db push` directly syncs schema to database without creating migration files
- Faster iteration during development
- Matches requirement: "no migrations on development stage"
- Can reset database easily by dropping and pushing again
- Migrations will be introduced in future phase for production safety

**Alternatives Considered**:
- Using migrations from start (rejected: conflicts with requirement)
- Manual SQL scripts (rejected: loses Prisma benefits and type safety)

**References**:
- [Prisma db push documentation](https://www.prisma.io/docs/reference/api-reference/command-reference#db-push)

---

### 5. Error Handling and Connection Resilience

**Question**: How should the application handle database connection errors?

**Decision**: Application starts successfully even if database is unavailable. Database operations return clear error messages. Connection errors are logged using structured logging (pino).

**Rationale**:
- Allows development to continue on frontend/other features even if database is down
- Matches requirement: "Application starts successfully, but database operations return clear error messages"
- Prisma Client throws specific error types that can be caught and handled
- Structured logging ensures errors are properly categorized

**Implementation Approach**:
- Prisma Client operations wrapped in try-catch blocks
- Errors logged with appropriate severity (error level)
- User-friendly error messages returned to API consumers
- Connection establishment errors logged but don't block app startup

**Alternatives Considered**:
- Fail-fast on startup (rejected: conflicts with requirement and reduces developer productivity)
- Silent failures (rejected: makes debugging difficult)

**References**:
- [Prisma Error Handling](https://www.prisma.io/docs/reference/api-reference/error-reference)

---

### 6. Environment Variables and Security

**Question**: How to securely manage database connection string?

**Decision**: Store DATABASE_URL in .env file, exclude .env from git, provide .env.example with placeholder.

**Rationale**:
- Standard practice for Next.js projects
- .env files are automatically loaded by Next.js
- .env.example documents required variables without exposing secrets
- Matches requirement: "protect credentials in .env file (excluded from version control)"

**Implementation**:
- Add `.env` to `.gitignore` (if not already present)
- Create `.env.example` with `DATABASE_URL=postgresql://user:password@localhost:5432/dbname`
- Document DATABASE_URL format in quickstart guide

**Alternatives Considered**:
- Hardcoded connection strings (rejected: security risk)
- External secret management (rejected: overkill for development phase)

**References**:
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

---

### 7. Schema Validation and Testing

**Question**: What should be included in the base schema for verification?

**Decision**: Single test table `TestRecord` with `id` (String @id @default(uuid())) and `name` (String) fields.

**Rationale**:
- Minimal structure sufficient for verification
- Demonstrates Prisma schema syntax
- Can be used in verification test (create and read)
- Doesn't create unnecessary dependencies for future features
- Matches clarification: "Empty schema with one test table for verification"

**Schema Example**:
```prisma
model TestRecord {
  id   String @id @default(uuid())
  name String
}
```

**Alternatives Considered**:
- No test table (rejected: no way to verify setup works)
- Multiple tables with relationships (rejected: unnecessary complexity, domain tables will come in future features)

---

### 8. Verification Approach

**Question**: How to verify database setup is working correctly?

**Decision**: Create a simple verification script or API endpoint that creates a TestRecord, reads it back, and confirms success.

**Rationale**:
- Tests all components: connection, schema, client, CRUD operations
- Can be run manually or automated
- Provides clear success/failure feedback
- Matches requirement: "create and read a test record"

**Implementation Options**:
1. Standalone script: `scripts/verify-db.ts` (can be run with `tsx` or `ts-node`)
2. API endpoint: `app/api/db-test/route.ts` (can be called via HTTP)

**Decision**: Provide both options - standalone script for CLI verification, API endpoint for HTTP-based verification.

**Alternatives Considered**:
- Only script (rejected: API endpoint is more convenient for some developers)
- Only API endpoint (rejected: script is more direct and doesn't require server to be running)

---

## Summary of Decisions

1. **Prisma Setup**: Official Next.js + Prisma integration pattern
2. **Client Singleton**: Global variable pattern in `lib/db.ts` for development, module caching for production
3. **PostgreSQL**: Support both Docker and local installation, Docker recommended
4. **Schema Management**: Use `prisma db push` during development, migrations deferred to production phase
5. **Error Handling**: Application starts without database, operations return clear errors, structured logging
6. **Security**: DATABASE_URL in .env (gitignored), .env.example for documentation
7. **Base Schema**: Single TestRecord table with id and name fields
8. **Verification**: Both standalone script and API endpoint for testing setup

## Open Questions Resolved

All technical questions from the specification have been resolved. No NEEDS CLARIFICATION markers remain.

