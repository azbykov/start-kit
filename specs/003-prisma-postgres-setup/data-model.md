# Data Model: Prisma + PostgreSQL Setup

**Feature**: Prisma + PostgreSQL Database Setup  
**Date**: 2025-01-27  
**Status**: Initial Schema

## Overview

This feature establishes the foundational database infrastructure. The schema is ready for domain-specific entities (User, Player, Team, Match, etc.) to be added in future features.

## Prisma Schema

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Add your domain models here
```

## Future Entities (Out of Scope)

The following entities are planned for future features and are NOT part of this setup:

- **User**: Authentication and authorization (NextAuth integration)
- **Player**: Player profiles and statistics
- **Team**: Team information and rosters
- **Match**: Match records and results
- **PlayerMatchStats**: Player performance in matches
- **Tournament**: Tournament organization
- **VideoLink**: Video content links
- **ImportJob**: CSV/JSON import tracking

These will be added incrementally as features are implemented.

## Database Connection

**Connection String Format**: `postgresql://[user]:[password]@[host]:[port]/[database]`

**Example**: `postgresql://postgres:postgres@localhost:5432/startkit_dev`

**Configuration**: Stored in `DATABASE_URL` environment variable (`.env` file)

## Schema Management

**Development Workflow**:
1. Edit `prisma/schema.prisma`
2. Run `npx prisma db push` to sync schema to database
3. Run `npx prisma generate` to regenerate Prisma Client (if needed)

**Important**: During development, we use `prisma db push` instead of migrations. Migrations will be introduced after the first production release.

## Notes

- Schema changes are applied directly to the database without migration files
- Existing tables are overwritten (dropped and recreated) during push operations
- This approach is suitable for development but will be replaced with migrations for production

