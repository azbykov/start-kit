# Data Model: Project Setup and Foundation

**Date**: 2025-11-29  
**Feature**: Project Setup and Foundation  
**Phase**: 1 - Design & Contracts

## Overview

This setup task does not involve domain data entities. It establishes the technical foundation and infrastructure for the application. The data model (Prisma schema with User, Player, Team, Match, etc.) will be created in later tasks.

## Infrastructure Data Structures

### Environment Configuration

**Type**: Configuration object (not persisted)

**Fields**:

- `NEXT_PUBLIC_API_URL` (string, optional): Base URL for API requests
- `NODE_ENV` (string, required): Environment mode (development, production, test)
- Additional environment variables will be added in later tasks (database URL, auth secrets, etc.)

**Validation**:

- Required variables must be present at runtime
- `.env.example` documents all required variables
- `.env` file excluded from version control

---

### Log Entry Structure

**Type**: Structured log object (not persisted, output to console/file)

**Fields**:

- `level` (string, enum): "error" | "warn" | "info" | "debug"
- `message` (string, required): Human-readable log message
- `timestamp` (string, ISO 8601): Log timestamp
- `context` (object, optional): Additional context data
- `error` (object, optional): Error object if level is "error"

**Usage**:

- Created by logger utility (`lib/logger.ts`)
- Output format: JSON in production, pretty-printed in development
- Used in API routes and server components

---

### API Client Configuration

**Type**: Axios instance configuration (runtime object)

**Fields**:

- `baseURL` (string): Base URL for all API requests
- `timeout` (number): Request timeout in milliseconds
- `headers` (object): Default headers (Content-Type, etc.)
- Interceptors: Request/response interceptors for error handling

**Usage**:

- Configured in `lib/api.ts`
- Used by all API calls in the application
- Can be extended with auth token interceptor in later tasks

---

## Future Data Model Notes

The following entities will be defined in later tasks (referenced from constitution):

- **User**: Authentication identity + role
- **Player**: Public player information
- **Team**: Team information
- **Match**: Match data
- **PlayerMatchStats**: Player performance in matches
- **Tournament**: Tournament information
- **VideoLink**: Video references
- **ImportJob**: Import tracking

These will be defined in Prisma schema when database setup task is implemented.

---

## Type Definitions Location

Type definitions will be organized as follows:

```
lib/
├── api.ts              # API client types
├── logger.ts           # Logger types
└── types/              # Shared types (created in later tasks)
    ├── api.ts          # API request/response types
    ├── domain.ts       # Domain entity types (derived from Prisma)
    └── common.ts       # Common utility types
```

**Principle**: Types derived from Prisma schema (Principle III: API and Data Model Are the Source of Truth)
