# Quick Start: Prisma + PostgreSQL Setup

**Feature**: Prisma + PostgreSQL Database Setup  
**Date**: 2025-01-27

## Prerequisites

- Node.js installed (version compatible with Next.js 16)
- PostgreSQL installed locally OR Docker installed
- Project dependencies installed (`npm install`)

## Step 1: Install Prisma

```bash
npm install prisma @prisma/client
npm install -D prisma
```

## Step 2: Initialize Prisma

```bash
npx prisma init
```

This creates:
- `prisma/schema.prisma` - Schema definition file
- `.env` - Environment variables file (if not exists)

## Step 3: Configure Database Connection

### Local PostgreSQL Setup

Ensure PostgreSQL is installed and running locally:

**macOS (using Homebrew):**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Windows:**
Download and install from [PostgreSQL official website](https://www.postgresql.org/download/windows/)

**Create database:**
```bash
createdb startkit_dev
# or via psql:
# psql -U postgres
# CREATE DATABASE startkit_dev;
```

## Step 4: Configure Environment Variables

Edit `.env` file (created by `prisma init`):

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/startkit_dev"
```

**Important**: 
- Replace credentials if using different PostgreSQL setup
- Ensure `.env` is in `.gitignore` (should be excluded from version control)
- Create `.env.example` with placeholder: `DATABASE_URL="postgresql://user:password@localhost:5432/dbname"`

## Step 5: Update Prisma Schema

Edit `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Add your models here
// Example:
// model User {
//   id   String @id @default(uuid())
//   name String
// }
```

## Step 6: Apply Schema to Database

```bash
npx prisma db push
```

This applies your schema to the database.

## Step 7: Generate Prisma Client

```bash
npx prisma generate
```

This generates the TypeScript types and Prisma Client.

## Step 8: Create Database Client Singleton

Create `lib/db.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

## Step 9: Use Database Client in Code

Example usage in API route (`app/api/example/route.ts`):

```typescript
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Use prisma client to perform database operations
    // Example: const records = await prisma.yourModel.findMany()
    return NextResponse.json({ message: 'Database client is ready' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Database operation failed' },
      { status: 500 }
    )
  }
}
```

## Troubleshooting

### Connection Refused

- Verify PostgreSQL is running: `docker ps` or `pg_isready`
- Check DATABASE_URL format and credentials
- Ensure database exists: `psql -l` or check Docker logs

### Schema Push Fails

- Check schema.prisma syntax: `npx prisma validate`
- Verify database connection before pushing
- Check for conflicting tables (push will overwrite them)

### Prisma Client Not Found

- Run `npx prisma generate` after schema changes
- Restart Next.js dev server after generating client

### Application Starts But Database Operations Fail

- This is expected behavior (application starts without database)
- Check error messages in logs
- Verify DATABASE_URL is correctly set
- Test connection by attempting a database operation

## Next Steps

After successful setup:

1. ✅ Database connection configured
2. ✅ Schema file created
3. ✅ Prisma Client singleton available
4. ✅ Ready to add domain models

**Ready for**: Next features can now use the database for:
- User authentication (NextAuth)
- Player/Team/Match CRUD operations
- Data import functionality
- Any other database-dependent features

## Performance Expectations

The system is designed to meet the following performance targets:

- **Database Connection**: Connection should be established within 5 seconds of application startup under normal conditions (NFR-001)
- **Schema Push**: Schema push operation should complete within 30 seconds for schemas with up to 20 tables (NFR-002)

**Manual Verification**:
- Monitor application startup logs to verify connection time
- Time the `npm run db:push` command for schema operations
- If performance targets are not met, check:
  - PostgreSQL server performance
  - Network latency (if using remote database)
  - Database server load

## Important Notes

- **No Migrations**: During development, use `prisma db push` only. Migrations will be introduced after first production release.
- **Schema Changes**: Edit `schema.prisma` and run `prisma db push` to apply changes.
- **Data Loss**: `prisma db push` will overwrite existing tables. This is acceptable during development.
- **Environment Variables**: Never commit `.env` file. Always use `.env.example` for documentation.
- **Application Startup**: Application will start successfully even if database is unavailable. Database operations will return clear error messages.

