# Quick Start: NextAuth Setup with User Model, Roles, and Private Routes

**Feature**: NextAuth Setup with User Model, Roles, and Private Routes  
**Date**: 2025-01-27

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database running (from feature 003)
- Project dependencies installed (`npm install`)
- Prisma Client generated (`npm run db:generate`)

## Step 1: Install Dependencies

Install NextAuth.js and required packages:

```bash
npm install next-auth@beta @auth/prisma-adapter bcryptjs
npm install -D @types/bcryptjs tsx
```

**Packages**:
- `next-auth@beta`: NextAuth v5 (Auth.js) for App Router
- `@auth/prisma-adapter`: Prisma adapter for NextAuth
- `bcryptjs`: Password hashing library
- `@types/bcryptjs`: TypeScript types for bcryptjs
- `tsx`: TypeScript execution for seed script

## Step 2: Update Prisma Schema

Add authentication models to `prisma/schema.prisma`:

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
  password      String?
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

## Step 3: Apply Schema to Database

```bash
npm run db:push
npm run db:generate
```

This creates the User, Account, Session, and VerificationToken tables in your database.

## Step 4: Configure Environment Variables

Add NextAuth configuration to `.env`:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl-rand-base64-32
```

**Generate NEXTAUTH_SECRET**:
```bash
openssl rand -base64 32
```

**Important**: 
- Use different secrets for development and production
- Never commit `.env` file to version control
- Update `.env.example` with placeholder values

## Step 5: Create NextAuth Configuration

Create `lib/auth/config.ts`:

```typescript
import { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { Role } from "@prisma/client"

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        })

        if (!user || !user.password) {
          return null
        }

        // Block inactive users
        if (!user.isActive) {
          return null
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    })
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        session.user.role = user.role as Role
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    }
  },
  pages: {
    signIn: "/sign-in"
  },
  session: {
    strategy: "database"
  }
} satisfies NextAuthConfig
```

## Step 6: Create NextAuth API Route

Create `app/api/auth/[...nextauth]/route.ts`:

```typescript
import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth/config"

const handler = NextAuth(authConfig)

export { handler as GET, handler as POST }
```

## Step 7: Create Middleware for Route Protection

Create `app/middleware.ts`:

```typescript
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

## Step 8: Create Sign-In Page

Create `app/(auth)/sign-in/page.tsx`:

```typescript
import { SignInForm } from "@/components/auth/sign-in-form"

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignInForm />
    </div>
  )
}
```

Create `components/auth/sign-in-form.tsx`:

```typescript
"use client"

import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
// Add form components as needed

export function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false
    })

    if (result?.error) {
      setError("Invalid email or password")
    } else {
      router.push(callbackUrl)
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Add email and password inputs */}
      {error && <p className="text-red-500">{error}</p>}
      <Button type="submit">Sign In</Button>
    </form>
  )
}
```

## Step 9: Create Role Utilities

Create `lib/auth/roles.ts`:

```typescript
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth/config"
import { Role } from "@prisma/client"

export async function verifyUserRole(requiredRole: Role): Promise<boolean> {
  const session = await auth()
  if (!session?.user?.id) {
    return false
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, isActive: true }
  })

  if (!user || !user.isActive) {
    return false
  }

  if (user.role !== requiredRole) {
    // Role mismatch - log for security monitoring
    console.warn(`Role mismatch for user ${session.user.id}: expected ${requiredRole}, got ${user.role}`)
    return false
  }

  return true
}

export function hasRole(session: { user?: { role?: Role } } | null, requiredRole: Role): boolean {
  return session?.user?.role === requiredRole
}
```

## Step 10: Create Seed Script

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10)

  const admin = await prisma.user.upsert({
    where: { email: "admin@test.com" },
    update: {}, // Skip update if exists (idempotent)
    create: {
      email: "admin@test.com",
      name: "Test Admin",
      password: hashedPassword,
      role: "ADMIN",
      emailVerified: new Date(),
      isActive: true
    }
  })

  console.log("✅ Seed completed:", admin.email)
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

Add to `package.json`:

```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  },
  "scripts": {
    "db:seed": "prisma db seed"
  }
}
```

## Step 11: Run Seed Script

```bash
npm run db:seed
```

This creates a test admin user:
- **Email**: `admin@test.com`
- **Password**: `admin123`
- **Role**: `ADMIN`

## Step 12: Create Example Protected Route

Create `app/(protected)/dashboard/page.tsx`:

```typescript
import { auth } from "@/lib/auth/config"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect("/sign-in")
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {session.user.email}!</p>
      <p>Role: {session.user.role}</p>
    </div>
  )
}
```

## Step 13: Test Authentication Flow

1. **Start development server**:
   ```bash
   npm run dev
   ```

2. **Access protected route**: Navigate to `http://localhost:3000/dashboard`
   - Should redirect to `/sign-in`

3. **Sign in**: Use test admin credentials
   - Email: `admin@test.com`
   - Password: `admin123`

4. **Verify access**: Should redirect to `/dashboard` and display user info

5. **Test sign out**: Create sign-out button or use NextAuth signOut function

## Verification Checklist

- [ ] NextAuth dependencies installed
- [ ] Prisma schema updated and applied
- [ ] Environment variables configured
- [ ] NextAuth configuration created
- [ ] API route handler created
- [ ] Middleware configured
- [ ] Sign-in page created
- [ ] Role utilities created
- [ ] Seed script created and run
- [ ] Protected route created
- [ ] Authentication flow tested

## Troubleshooting

### NextAuth Route Not Found

- Verify route handler at `app/api/auth/[...nextauth]/route.ts`
- Check that handler exports GET and POST
- Restart dev server after creating route

### Database Connection Errors

- Verify DATABASE_URL in `.env`
- Ensure PostgreSQL is running
- Run `npm run db:push` to apply schema

### Session Not Persisting

- Check NEXTAUTH_SECRET is set
- Verify session strategy is "database" in config
- Check browser cookies (should see `next-auth.session-token`)

### Role Not in Session

- Verify callbacks in auth config include role
- Check that user.role is included in authorize return
- Ensure Prisma schema has role field

### Seed Script Fails

- Verify Prisma Client is generated (`npm run db:generate`)
- Check database connection
- Ensure User model exists in schema

## Next Steps

After successful setup:

1. ✅ Authentication system configured
2. ✅ User model with roles in database
3. ✅ Protected routes working
4. ✅ Test admin user created

**Ready for**: 
- Building role-specific dashboards
- Implementing role-based API endpoints
- Adding user registration flows
- Extending User model with profile fields

## Performance Expectations

The system is designed to meet the following performance targets:

- **Sign-in**: Completes within 2 seconds in 95% of attempts (NFR-001)
- **Session Validation**: Completes within 500ms in 95% of requests (NFR-002)
- **Concurrent Sessions**: Supports at least 1000 concurrent authenticated sessions (NFR-003)

**Manual Verification**:
- Time sign-in requests in browser DevTools Network tab
- Monitor session validation in middleware logs
- Test with multiple concurrent sign-ins

## Important Notes

- **Database Sessions**: Sessions are stored in database (not JWT) for management and revocation
- **Password Security**: Passwords are hashed with bcrypt before storage
- **Role Verification**: Roles are verified from database on each protected request (not just session)
- **Idempotent Seed**: Seed script can be run multiple times safely (skips if user exists)
- **Test Credentials**: Admin credentials are for development only, document in README (not production)

