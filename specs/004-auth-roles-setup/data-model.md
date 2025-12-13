# Data Model: NextAuth Setup with User Model, Roles, and Private Routes

**Date**: 2025-01-27  
**Feature**: NextAuth Setup with User Model, Roles, and Private Routes

## Overview

This document defines the database schema for authentication system with user roles and session management. The schema integrates NextAuth.js required models with custom User model supporting role-based access control.

## Entities

### User

Represents a user account in the system with authentication credentials and role-based permissions.

**Fields**:

- `id` (String, Primary Key): Unique identifier (CUID)
- `name` (String, Optional): Display name for the user
- `email` (String, Unique, Required): Email address used for authentication
- `emailVerified` (DateTime, Optional): Timestamp when email was verified (null if not verified)
- `password` (String, Optional): Bcrypt-hashed password (only for credentials provider)
- `role` (Role Enum, Default: PLAYER): User's permission level
- `isActive` (Boolean, Default: true): Account active status (false blocks sign-in)
- `createdAt` (DateTime, Auto): Account creation timestamp
- `updatedAt` (DateTime, Auto): Last update timestamp

**Relationships**:

- One-to-many with `Account` (OAuth providers, if used)
- One-to-many with `Session` (active sessions)

**Validation Rules**:

- Email must be unique (enforced by database)
- Password must be hashed with bcrypt before storage (application-level)
- Role must be one of: PLAYER, COACH, AGENT, ADMIN
- isActive=false blocks authentication (FR-026)

**State Transitions**:

- User creation: `isActive=true`, `emailVerified=null` (default)
- Email verification: `emailVerified` set to current timestamp
- Account deactivation: `isActive=false` (blocks sign-in)
- Account reactivation: `isActive=true` (allows sign-in)
- Role change: `role` field updated (requires session re-validation)

---

### Role (Enum)

Represents user permission levels and access rights.

**Values**:

- `PLAYER`: Basic user role (default for new users)
- `COACH`: Can manage teams and players
- `AGENT`: Can manage player contracts and extended search
- `ADMIN`: Full system access, manages users and roles

**Usage**:

- Stored as enum type in database (type-safe)
- Used for access control decisions in middleware and route handlers
- Single role per user (no multi-role support in MVP)

---

### Account

NextAuth required model for OAuth provider accounts. Not used in MVP (credentials provider only) but required by NextAuth schema.

**Fields** (NextAuth standard):

- `id` (String, Primary Key): Unique identifier
- `userId` (String, Foreign Key): Reference to User
- `type` (String): Account type (e.g., "oauth", "credentials")
- `provider` (String): Provider name (e.g., "google", "yandex")
- `providerAccountId` (String): Provider-specific user ID
- `refresh_token` (String, Optional): OAuth refresh token
- `access_token` (String, Optional): OAuth access token
- `expires_at` (Int, Optional): Token expiration timestamp
- `token_type` (String, Optional): Token type
- `scope` (String, Optional): OAuth scopes
- `id_token` (String, Optional): OAuth ID token
- `session_state` (String, Optional): OAuth session state

**Relationships**:

- Many-to-one with `User` (cascade delete)

**Constraints**:

- Unique constraint on `[provider, providerAccountId]`

---

### Session

NextAuth required model for database session storage. Stores active user sessions.

**Fields** (NextAuth standard):

- `id` (String, Primary Key): Unique identifier
- `sessionToken` (String, Unique): Session token (used in cookies)
- `userId` (String, Foreign Key): Reference to User
- `expires` (DateTime): Session expiration timestamp

**Relationships**:

- Many-to-one with `User` (cascade delete)

**Validation Rules**:

- Session expires automatically based on `expires` timestamp
- Expired sessions are cleaned up by NextAuth
- Role changes require session re-validation (not automatic expiration)

**State Transitions**:

- Session creation: Created on successful sign-in
- Session expiration: Automatically invalidated when `expires` < now
- Session revocation: Deleted from database (manual or automatic on role mismatch)

---

### VerificationToken

NextAuth required model for email verification and password reset tokens. Not used in MVP but required by NextAuth schema.

**Fields** (NextAuth standard):

- `identifier` (String): Email or identifier being verified
- `token` (String, Unique): Verification token
- `expires` (DateTime): Token expiration timestamp

**Constraints**:

- Unique constraint on `[identifier, token]`

---

## Prisma Schema

```prisma
enum Role {
  PLAYER
  COACH
  AGENT
  ADMIN
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  password      String?   // Bcrypt hashed
  role          Role      @default(PLAYER)
  isActive      Boolean   @default(true)
  accounts      Account[]
  sessions      Session[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@map("users")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}
```

## Data Integrity

### Constraints

- Email uniqueness enforced at database level
- Foreign key constraints with cascade delete for Account and Session
- Unique constraints on composite keys (Account provider+providerAccountId, VerificationToken identifier+token)

### Indexes

- `User.email`: Unique index (automatic via @unique)
- `Session.sessionToken`: Unique index (automatic via @unique)
- `Account.[provider, providerAccountId]`: Unique composite index

### Cascading Deletes

- Deleting User cascades to Account and Session records
- Prevents orphaned records in NextAuth tables

## Security Considerations

### Password Storage

- Passwords stored as bcrypt hashes (never plain text)
- Password field excluded from all API responses (FR-017)
- Password hashing performed before database insertion

### Session Security

- Session tokens are cryptographically secure (generated by NextAuth)
- Sessions expire automatically based on timestamp
- Role changes detected on each request (not stored in session)

### Data Privacy

- Email addresses are PII and must be protected
- User roles are sensitive (used for access control)
- Session data contains user identifiers (must be secured)

## Migration Strategy

1. Add Role enum to schema
2. Add User model with NextAuth-compatible structure
3. Add Account, Session, VerificationToken models (NextAuth required)
4. Run `prisma db push` to apply schema (development)
5. Generate Prisma Client: `prisma generate`

**Note**: Using `db push` during development per existing project setup. Migrations will be introduced after first production release.

## Future Extensions

The User model can be extended in future features with:

- Profile fields (avatar, bio, preferences)
- Relations to Player or Coach profiles
- Additional metadata fields
- Audit trail fields (lastLogin, loginCount, etc.)

All extensions must maintain compatibility with NextAuth schema requirements.

