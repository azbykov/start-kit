# API Contracts: Authentication and Authorization

**Date**: 2025-01-27  
**Feature**: NextAuth Setup with User Model, Roles, and Private Routes  
**Base URL**: `/api/auth`

## Overview

This document defines API contracts for authentication endpoints provided by NextAuth.js and custom authorization utilities. NextAuth handles most authentication endpoints automatically, but we document the key interactions and custom endpoints.

## NextAuth Endpoints

NextAuth.js provides standard authentication endpoints at `/api/auth/*`. These are handled automatically by NextAuth route handler.

### Sign In

**Endpoint**: `POST /api/auth/callback/credentials`

**Description**: Authenticates user with email and password credentials.

**Request Body**:
```json
{
  "email": "string",
  "password": "string",
  "callbackUrl": "string (optional)"
}
```

**Success Response** (302 Redirect):
- Redirects to `callbackUrl` or default destination
- Sets session cookie

**Error Response** (302 Redirect to sign-in):
- Redirects to `/sign-in` with error parameter
- Error types: `CredentialsSignin`, `AccessDenied`

**Validation Rules**:
- Email must be valid email format
- Password must not be empty
- User must exist and be active (`isActive=true`)
- Password must match stored hash

**Security**:
- Generic error messages (doesn't reveal if email exists)
- Rate limiting recommended (NFR-005)
- Password never returned in response

---

### Sign Out

**Endpoint**: `POST /api/auth/signout`

**Description**: Destroys user session and signs out.

**Request Body**: None (or CSRF token)

**Success Response** (302 Redirect):
- Redirects to sign-in page or home
- Clears session cookie
- Deletes session from database

---

### Get Session

**Endpoint**: `GET /api/auth/session`

**Description**: Returns current user session information.

**Headers**:
- Cookie: Session cookie (set by NextAuth)

**Success Response** (200):
```json
{
  "user": {
    "id": "string",
    "email": "string",
    "name": "string | null",
    "role": "PLAYER" | "COACH" | "AGENT" | "ADMIN",
    "image": "string | null"
  },
  "expires": "ISO 8601 datetime string"
}
```

**Unauthenticated Response** (200):
```json
{
  "user": null,
  "expires": null
}
```

**Security**:
- Password hash never included in response (FR-017)
- Role included for authorization checks

---

## Custom Authorization Utilities

These are TypeScript utilities (not HTTP endpoints) used in route handlers and middleware.

### Check Authentication Status

**Function**: `auth()` from `@/lib/auth/config`

**Description**: Server-side function to get current session.

**Returns**:
```typescript
{
  user: {
    id: string
    email: string
    name: string | null
    role: Role
  } | null
}
```

**Usage**:
```typescript
import { auth } from "@/lib/auth/config"

export async function GET() {
  const session = await auth()
  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }
  // Process request
}
```

---

### Verify User Role

**Function**: `verifyUserRole(requiredRole: Role)` from `@/lib/auth/roles`

**Description**: Verifies user has required role by checking database (not session).

**Parameters**:
- `requiredRole`: Role enum value (PLAYER, COACH, AGENT, ADMIN)

**Returns**: `Promise<boolean>`

**Behavior**:
- Returns `false` if user not authenticated
- Returns `false` if user is inactive (`isActive=false`)
- Returns `false` if user role doesn't match (logs mismatch for security)
- Returns `true` if user has required role

**Usage**:
```typescript
import { verifyUserRole } from "@/lib/auth/roles"
import { Role } from "@prisma/client"

export async function GET() {
  const hasAccess = await verifyUserRole(Role.ADMIN)
  if (!hasAccess) {
    return new Response("Forbidden", { status: 403 })
  }
  // Process admin request
}
```

---

### Check Role in Session

**Function**: `hasRole(session: Session, requiredRole: Role)` from `@/lib/auth/roles`

**Description**: Client-side or server-side check if session has required role (doesn't verify from database).

**Parameters**:
- `session`: Session object from `auth()` or `useSession()`
- `requiredRole`: Role enum value

**Returns**: `boolean`

**Usage**:
```typescript
import { hasRole } from "@/lib/auth/roles"
import { auth } from "@/lib/auth/config"

export async function GET() {
  const session = await auth()
  if (!session || !hasRole(session, Role.ADMIN)) {
    return new Response("Forbidden", { status: 403 })
  }
  // Process request
}
```

**Note**: For security-critical operations, use `verifyUserRole()` which checks database.

---

## Protected Route Patterns

### Page Route Protection

**Pattern**: Middleware + Server Component Check

**Middleware** (`app/middleware.ts`):
- Checks authentication status
- Redirects unauthenticated users to `/sign-in`
- Preserves `callbackUrl` parameter

**Server Component**:
```typescript
import { auth } from "@/lib/auth/config"
import { redirect } from "next/navigation"

export default async function ProtectedPage() {
  const session = await auth()
  if (!session) {
    redirect("/sign-in")
  }
  // Render page
}
```

---

### API Route Protection

**Pattern**: Route Handler Check

**Example**:
```typescript
import { auth } from "@/lib/auth/config"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }
  // Process request
  return NextResponse.json({ data: "..." })
}
```

---

### Role-Based API Route Protection

**Pattern**: Role Verification

**Example**:
```typescript
import { verifyUserRole } from "@/lib/auth/roles"
import { Role } from "@prisma/client"
import { NextResponse } from "next/server"

export async function GET() {
  const hasAccess = await verifyUserRole(Role.ADMIN)
  if (!hasAccess) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    )
  }
  // Process admin request
  return NextResponse.json({ data: "..." })
}
```

---

## Error Responses

### Standard Error Format

```json
{
  "error": "string",
  "message": "string (optional)"
}
```

### Error Codes

- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: User authenticated but lacks required role/permission
- `400 Bad Request`: Invalid request data
- `500 Internal Server Error`: Server error (logged, not exposed to user)

### Security Considerations

- Generic error messages for authentication failures (FR-019)
- No information leakage about user existence
- Detailed errors logged server-side (NFR-006)
- Rate limiting on authentication endpoints (NFR-005)

---

## Session Management

### Session Lifecycle

1. **Creation**: On successful sign-in, session created in database
2. **Validation**: Middleware/route handlers verify session on each request
3. **Expiration**: Sessions expire based on `expires` timestamp
4. **Revocation**: Sessions deleted on sign-out or role mismatch

### Session Cookie

- Set by NextAuth automatically
- HttpOnly, Secure (in production), SameSite=Lax
- Contains session token (not user data)

---

## Type Definitions

### Role Enum

```typescript
enum Role {
  PLAYER = "PLAYER",
  COACH = "COACH",
  AGENT = "AGENT",
  ADMIN = "ADMIN"
}
```

### Session Type

```typescript
type Session = {
  user: {
    id: string
    email: string
    name: string | null
    role: Role
    image: string | null
  }
  expires: string
} | null
```

---

## Testing Contracts

### Test Scenarios

1. **Sign In Success**: Valid credentials → Session created → Redirect to destination
2. **Sign In Failure**: Invalid credentials → Generic error → Redirect to sign-in
3. **Sign In Inactive User**: Valid credentials but `isActive=false` → Access denied
4. **Sign Out**: Authenticated user → Session destroyed → Redirect to sign-in
5. **Protected Route Access**: Unauthenticated → Redirect to sign-in with callbackUrl
6. **Role-Based Access**: Wrong role → 403 Forbidden
7. **Role Change During Session**: Role changed → Next request detects mismatch → Logout

### Contract Validation

- All endpoints return documented response formats
- Error codes match specification
- Security requirements enforced (no password in responses, generic errors)
- Session management works as documented

