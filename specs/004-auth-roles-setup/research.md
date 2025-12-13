# Research: NextAuth Setup with User Model, Roles, and Private Routes

**Date**: 2025-01-27  
**Feature**: NextAuth Setup with User Model, Roles, and Private Routes  
**Phase**: 0 - Outline & Research

## Research Questions

### 1. NextAuth.js Version and App Router Integration

**Question**: Which version of NextAuth.js should be used with Next.js 16 App Router, and how to integrate it with Prisma?

**Research Findings**:

- **Decision**: Use NextAuth.js v5 (Auth.js) with App Router support
- **Rationale**:
  - NextAuth v5 (Auth.js) is the modern version designed for App Router
  - Better TypeScript support and improved API
  - Native support for Next.js App Router route handlers
  - Prisma adapter available via `@auth/prisma-adapter`
  - Database sessions supported out of the box
- **Key Implementation Points**:
  - API route handler at `app/api/auth/[...nextauth]/route.ts`
  - Configuration file at `lib/auth/config.ts` (separated for reusability)
  - Use `@auth/prisma-adapter` for Prisma integration
  - Session strategy: database (required per spec)
- **Alternatives Considered**:
  - NextAuth v4: Older version, Pages Router focused, less TypeScript support
  - Custom auth solution: Too complex for MVP, reinventing the wheel
  - Clerk/Auth0: External service, adds dependency and cost

**Implementation Notes**:

- Install: `npm install next-auth@beta @auth/prisma-adapter`
- Create route handler in App Router structure
- Configure Prisma adapter with existing Prisma Client instance
- Use database session strategy (not JWT)

---

### 2. Prisma Schema for NextAuth with User Roles

**Question**: What Prisma schema structure is required for NextAuth database sessions with User model and roles?

**Research Findings**:

- **Decision**: Use NextAuth Prisma adapter schema + custom User model with Role enum
- **Rationale**:
  - NextAuth requires specific models: User, Account, Session, VerificationToken
  - Custom fields (role, name, emailVerified, isActive) added to User model
  - Role enum defined separately for type safety
  - Database sessions require Session model (not needed for JWT)
- **Schema Structure**:
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
    password      String?   // Hashed with bcrypt
    role          Role      @default(PLAYER)
    isActive      Boolean   @default(true)
    accounts      Account[]
    sessions      Session[]
    createdAt     DateTime  @default(now())
    updatedAt     DateTime  @updatedAt
  }

  model Account {
    // NextAuth required fields
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
  }

  model Session {
    // NextAuth required for database sessions
    id           String   @id @default(cuid())
    sessionToken String   @unique
    userId       String
    expires      DateTime
    user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  }

  model VerificationToken {
    // NextAuth required
    identifier String
    token      String   @unique
    expires    DateTime
    @@unique([identifier, token])
  }
  ```
- **Alternatives Considered**:
  - Separate User and AuthUser models: Unnecessary complexity, NextAuth expects single User model
  - JWT sessions: Doesn't meet requirement for database sessions and session management

**Implementation Notes**:

- Add NextAuth models to existing Prisma schema
- Use `@auth/prisma-adapter` to ensure schema compatibility
- Role enum must match spec requirements (PLAYER, COACH, AGENT, ADMIN)
- Password field optional (for credentials provider only)

---

### 3. Credentials Provider with Bcrypt Password Hashing

**Question**: How to implement credentials provider (email/password) with bcrypt password hashing in NextAuth v5?

**Research Findings**:

- **Decision**: Use NextAuth Credentials provider with bcrypt for password hashing
- **Rationale**:
  - Credentials provider is standard for email/password authentication
  - Bcrypt is industry-standard secure hashing algorithm (NFR-004)
  - Works seamlessly with Prisma User model
  - Supports custom validation logic (isActive check)
- **Implementation Pattern**:
  ```typescript
  import Credentials from "next-auth/providers/credentials"
  import bcrypt from "bcryptjs"
  import { prisma } from "@/lib/db"

  Credentials({
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null
      
      const user = await prisma.user.findUnique({
        where: { email: credentials.email }
      })
      
      if (!user || !user.password) return null
      if (!user.isActive) return null // Block inactive users
      
      const isValid = await bcrypt.compare(credentials.password, user.password)
      if (!isValid) return null
      
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    }
  })
  ```
- **Alternatives Considered**:
  - Argon2: More secure but slower, overkill for MVP
  - SHA-256: Not suitable for passwords (no salt, fast hashing)
  - Plain text: Security violation, unacceptable

**Implementation Notes**:

- Install: `npm install bcryptjs @types/bcryptjs`
- Hash passwords on user creation (seed script, future registration)
- Never return password hash in API responses (FR-017)
- Validate isActive field during authorize (FR-026)
- Generic error messages to prevent user enumeration (FR-019)

---

### 4. Next.js Middleware for Route Protection

**Question**: How to implement route protection using Next.js middleware in App Router?

**Research Findings**:

- **Decision**: Use Next.js middleware with NextAuth middleware helper
- **Rationale**:
  - Middleware runs before request reaches route handler
  - Supports both page routes and API routes
  - Can redirect unauthenticated users to sign-in
  - Preserves intended destination URL (FR-008)
  - Role-based checks can be done in middleware or route handlers
- **Implementation Pattern**:
  ```typescript
  // app/middleware.ts
  import { auth } from "@/lib/auth/config"
  import { NextResponse } from "next/server"

  export default auth((req) => {
    const { pathname } = req.nextUrl
    
    // Protected routes
    if (pathname.startsWith("/dashboard")) {
      if (!req.auth) {
        const signInUrl = new URL("/sign-in", req.url)
        signInUrl.searchParams.set("callbackUrl", pathname)
        return NextResponse.redirect(signInUrl)
      }
    }
    
    return NextResponse.next()
  })

  export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
  }
  ```
- **Role-Based Protection**:
  - Middleware can check basic authentication
  - Role checks done in route handlers or page components (more flexible)
  - API routes: Check role in route handler before processing
  - Page routes: Use server component checks or client-side guards
- **Alternatives Considered**:
  - Higher-order components: Client-side only, doesn't protect API routes
  - Route-level checks only: More code duplication, less centralized
  - External auth service: Adds dependency, not needed for MVP

**Implementation Notes**:

- Create `app/middleware.ts` at root level
- Use NextAuth `auth()` helper for session access
- Configure matcher to exclude static files and API routes that don't need protection
- Preserve callbackUrl for redirect after sign-in (FR-008)
- Role checks can be utility functions in `lib/auth/roles.ts`

---

### 5. Role Verification on Each Request

**Question**: How to implement role verification on each request to handle role changes during active sessions?

**Research Findings**:

- **Decision**: Verify role from database in middleware/route handlers, not rely solely on session
- **Rationale**:
  - Session data may be stale if role changes
  - Database is source of truth (Constitution Principle III)
  - Enables automatic logout on role mismatch (FR-030)
  - Supports real-time role updates
- **Implementation Pattern**:
  ```typescript
  // lib/auth/roles.ts
  import { prisma } from "@/lib/db"
  import { auth } from "@/lib/auth/config"

  export async function verifyUserRole(requiredRole: Role) {
    const session = await auth()
    if (!session?.user?.id) return false
    
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, isActive: true }
    })
    
    if (!user || !user.isActive) return false
    if (user.role !== requiredRole) {
      // Role mismatch - invalidate session
      // NextAuth handles session invalidation
      return false
    }
    
    return true
  }
  ```
- **Session Invalidation**:
  - NextAuth provides session management
  - Can delete session from database to force re-authentication
  - Middleware can detect role mismatch and redirect to sign-in
- **Alternatives Considered**:
  - Trust session role: Doesn't handle role changes, security risk
  - Polling for role changes: Inefficient, adds complexity
  - WebSocket updates: Overkill for MVP, adds infrastructure

**Implementation Notes**:

- Create utility functions in `lib/auth/roles.ts`
- Use in route handlers and middleware for role checks
- Verify isActive status as well (FR-026)
- Log role mismatches for security monitoring (NFR-006)

---

### 6. Seed Script for Test Admin User

**Question**: How to create an idempotent seed script that creates test admin user?

**Research Findings**:

- **Decision**: Use Prisma seed script with upsert pattern for idempotency
- **Rationale**:
  - Prisma supports seed scripts via `prisma.seed` in package.json
  - Upsert pattern ensures idempotent behavior (FR-012, FR-031)
  - Can be run multiple times safely
  - Integrates with existing Prisma setup
- **Implementation Pattern**:
  ```typescript
  // prisma/seed.ts
  import { PrismaClient } from "@prisma/client"
  import bcrypt from "bcryptjs"

  const prisma = new PrismaClient()

  async function main() {
    const hashedPassword = await bcrypt.hash("admin123", 10)
    
    const admin = await prisma.user.upsert({
      where: { email: "admin@test.com" },
      update: {}, // Skip update if exists (idempotent skip)
      create: {
        email: "admin@test.com",
        name: "Test Admin",
        password: hashedPassword,
        role: "ADMIN",
        emailVerified: new Date(),
        isActive: true
      }
    })
    
    console.log("Seed completed:", admin)
  }

  main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
  ```
- **Package.json Configuration**:
  ```json
  {
    "prisma": {
      "seed": "tsx prisma/seed.ts"
    }
  }
  ```
- **Alternatives Considered**:
  - Always create new user: Not idempotent, creates duplicates
  - Delete and recreate: Loses data, not graceful
  - Separate migration: Overkill for test data

**Implementation Notes**:

- Install: `npm install -D tsx` for TypeScript execution
- Use bcrypt to hash password (same as production)
- Document credentials in development README (not production)
- Run via: `npx prisma db seed` or `npm run db:seed` (if script added)

---

## Summary of Key Decisions

1. **NextAuth v5** with App Router and Prisma adapter
2. **Database sessions** (not JWT) for session management
3. **Prisma schema** with NextAuth required models + custom User fields
4. **Bcrypt** for password hashing (bcryptjs for Node.js compatibility)
5. **Next.js middleware** for route protection with role verification
6. **Role verification** from database on each protected request
7. **Idempotent seed script** using Prisma upsert pattern

All research questions resolved. Ready for Phase 1 design.

