import { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Yandex from "next-auth/providers/yandex"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { Role } from "@prisma/client"

export const authConfig = {
  // Note: PrismaAdapter removed - NextAuth v5 Credentials provider requires JWT strategy
  // User data is still stored in database, but sessions use JWT
  // Role is verified from database on each request (FR-029) to detect role changes
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

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string }
          })

          if (!user || !user.password) {
            // Log authentication failure without exposing sensitive data (NFR-006)
            console.warn("Authentication failed: User not found or no password set")
            return null
          }

          // Block inactive users (FR-026)
          if (!user.isActive) {
            console.warn(`Authentication blocked: User ${user.email} is inactive`)
            return null
          }

          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          )

          if (!isValid) {
            // Log authentication failure without exposing sensitive data (NFR-006)
            console.warn("Authentication failed: Invalid password")
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            teamId: user.teamId || null
          }
        } catch (error) {
          // Log authentication errors for security monitoring (NFR-006)
          console.error("Authentication error:", error instanceof Error ? error.message : "Unknown error")
          return null
        }
      }
    }),
    Yandex({
      clientId: process.env.YANDEX_CLIENT_ID,
      clientSecret: process.env.YANDEX_CLIENT_SECRET,
    })
  ],
  callbacks: {
    async signIn({ user, account, profile: _profile }) {
      // Handle OAuth sign-in (e.g., Yandex)
      if (account?.provider === "yandex" && user.email) {
        try {
          // Check if user exists in database - only allow sign-in for existing users
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email }
          })

          if (!dbUser) {
            // User doesn't exist - deny sign-in
            console.warn(`OAuth sign-in denied: User ${user.email} not found in database`)
            return false
          }

          // User exists, link account if not already linked
          const existingAccount = await prisma.account.findFirst({
            where: {
              userId: dbUser.id,
              provider: account.provider,
              providerAccountId: account.providerAccountId
            }
          })

          if (!existingAccount) {
            await prisma.account.create({
              data: {
                userId: dbUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                session_state:
                  typeof account.session_state === "string"
                    ? account.session_state
                    : null,
              }
            })
          }

          // Block inactive users (FR-026)
          if (!dbUser.isActive) {
            console.warn(`OAuth sign-in blocked: User ${dbUser.email} is inactive`)
            return false
          }

          // Update user object with database user data
          user.id = dbUser.id
          user.role = dbUser.role
          user.teamId = dbUser.teamId || null
          return true
        } catch (error) {
          console.error("Error during OAuth sign-in:", error)
          return false
        }
      }
      // For credentials provider, user is already validated
      return true
    },
    async jwt({ token, user, account }) {
      if (process.env.NODE_ENV === "development") {
        console.log("[JWT] Callback called:", {
          hasUser: !!user,
          hasToken: !!token,
          tokenId: token?.id,
          tokenEmail: token?.email,
          accountProvider: account?.provider,
        })
      }
      
      // When user signs in, add user data to token
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.role = user.role
        token.teamId = (user as any).teamId || null
        if (process.env.NODE_ENV === "development") {
          console.log("[JWT] User signed in:", { id: user.id, email: user.email })
        }
      }
      // On subsequent requests, verify role from database (FR-029)
      // This ensures role changes are detected even with JWT sessions
      if (token.id && !user) {
        // This is a subsequent request (not initial sign-in)
        if (process.env.NODE_ENV === "development") {
          console.log("[JWT] Verifying user in database:", { id: token.id, email: token.email })
        }
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { role: true, isActive: true, teamId: true }
          })
          if (dbUser) {
            // Update token with latest role and teamId from database
            token.role = dbUser.role
            token.teamId = dbUser.teamId || null
            if (process.env.NODE_ENV === "development") {
              console.log("[JWT] User verified:", { id: token.id, role: dbUser.role, isActive: dbUser.isActive })
            }
            // If user is inactive, invalidate token
            if (!dbUser.isActive) {
              if (process.env.NODE_ENV === "development") {
                console.log("[JWT] User inactive, invalidating token:", token.id)
              }
              return null
            }
          } else {
            // User not found in database - invalidate token
            if (process.env.NODE_ENV === "development") {
              console.warn(`[JWT] User ${token.id} not found in database, invalidating token`)
            }
            return null
          }
        } catch (error) {
          // On database error, log but don't invalidate token to avoid breaking sessions
          // This allows sessions to work even if database is temporarily unavailable
          console.error("[JWT] Error verifying user role from database:", error)
          // Return token as-is to maintain session during temporary DB issues
        }
      }
      if (process.env.NODE_ENV === "development" && !user) {
        console.log("[JWT] Returning token:", { id: token.id, email: token.email, role: token.role })
      }
      return token
    },
    async session({ session, token }) {
      if (process.env.NODE_ENV === "development") {
        console.log("[Session] Called with:", {
          hasToken: !!token,
          tokenId: token?.id,
          tokenEmail: token?.email,
          tokenRole: token?.role,
          hasSession: !!session,
          sessionUserEmail: session?.user?.email,
        })
      }
      
      // If token is null or missing required fields, return empty session
      // This will cause middleware to redirect to sign-in
      if (!token || !token.id || !token.email) {
        if (process.env.NODE_ENV === "development") {
          console.log("[Session] Token invalid or missing fields, returning empty session")
        }
        return session
      }
      
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string | null
        session.user.role = token.role as Role
        session.user.teamId = (token.teamId as string | null) || null
        if (process.env.NODE_ENV === "development") {
          console.log("[Session] Session created for user:", session.user.email)
        }
      }
      return session
    }
  },
  pages: {
    signIn: "/sign-in"
  },
  session: {
    strategy: "jwt", // Required for Credentials provider in NextAuth v5
    maxAge: 30 * 24 * 60 * 60, // 30 days - session lifetime in seconds
    updateAge: 24 * 60 * 60, // 24 hours - how often to update session (not used with JWT, but kept for consistency)
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days - JWT token lifetime in seconds (should match session.maxAge)
  },
  cookies: {
    sessionToken: {
      // Use __Secure- prefix only in production (requires secure: true)
      // In development, use regular name without prefix
      name: 'start-session',
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production", // Only secure in production (HTTPS)
        maxAge: 30 * 24 * 60 * 60, // 30 days - cookie lifetime in seconds (should match session.maxAge)
      },
    },
  }
} satisfies NextAuthConfig

