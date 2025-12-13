# Implementation Plan: NextAuth Setup with User Model, Roles, and Private Routes

**Branch**: `004-auth-roles-setup` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-auth-roles-setup/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement NextAuth.js authentication system with Prisma User model, role-based access control (PLAYER/COACH/AGENT/ADMIN), private route protection, and seed script for test admin user. The system will use database sessions for session management, integrate with existing Prisma + PostgreSQL setup, and provide middleware-based route protection for both page and API routes.

## Technical Context

**Language/Version**: TypeScript 5.5.4 (strict mode)  
**Primary Dependencies**: Next.js 16.0.6, NextAuth.js (v5), Prisma 6.19.0, React 19.0.0, bcrypt  
**Storage**: PostgreSQL (via Prisma ORM), database sessions for NextAuth  
**Testing**: Jest/Vitest (deferred to implementation phase per MVP approach)  
**Target Platform**: Web (Next.js server-side rendering + client-side hydration)  
**Project Type**: Web application (Next.js App Router monorepo)  
**Performance Goals**: Sign-in within 2 seconds (95% of attempts), session validation within 500ms (95% of requests), support 1000 concurrent authenticated sessions  
**Constraints**: Must integrate with existing Prisma + PostgreSQL setup, must work with Next.js App Router structure, database sessions required (not JWT)  
**Scale/Scope**: MVP phase - 4 user roles, single database instance, basic authentication flows

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Pre-Phase 0 Evaluation

✅ **I. MVP First, Extensible Later**: Authentication is foundational and delivers immediate value. User model and roles are minimal but extensible.

✅ **II. Clear Separation of Concerns**: Authentication logic separated into NextAuth configuration, middleware for route protection, utilities for role checks. No mixing of concerns.

✅ **III. API and Data Model Are Source of Truth**: User model defined in Prisma schema, authentication state managed by NextAuth with database sessions.

✅ **IV. Safety and Privacy by Default**: Password hashing (bcrypt), secure session management, role-based access control, no sensitive data exposure in API responses.

✅ **V. Predictable UX & Simple Flows**: Simple sign-in/sign-out flows, clear redirect behavior for protected routes, role-based access clearly enforced.

**Status**: ✅ **PASS** - All constitution principles satisfied. Proceeding to Phase 0 research.

## Project Structure

### Documentation (this feature)

```text
specs/004-auth-roles-setup/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/            # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts        # NextAuth API route handler
│   ├── (auth)/
│   │   └── sign-in/
│   │       └── page.tsx            # Sign-in page
│   ├── (protected)/
│   │   └── dashboard/
│   │       └── page.tsx            # Example protected route
│   ├── middleware.ts                # Next.js middleware for route protection
│   └── layout.tsx                   # Root layout (existing)
├── components/
│   ├── auth/
│   │   ├── sign-in-form.tsx         # Sign-in form component
│   │   └── sign-out-button.tsx      # Sign-out button component
│   └── providers/
│       └── auth-provider.tsx       # Auth context provider (if needed)
├── lib/
│   ├── auth/
│   │   ├── config.ts                # NextAuth configuration
│   │   ├── middleware.ts            # Route protection utilities
│   │   └── roles.ts                 # Role checking utilities
│   ├── db.ts                        # Prisma Client singleton (existing)
│   └── utils.ts                     # General utilities (existing)
├── prisma/
│   ├── schema.prisma                # Prisma schema (User, Session, Account models)
│   └── seed.ts                      # Seed script for test admin user
└── scripts/
    └── seed.ts                      # Alternative seed script location (if needed)
```

**Structure Decision**: Next.js App Router structure with domain-based organization for auth features. Authentication logic separated into:
- **app/api/auth/**: NextAuth API route handler
- **app/(auth)/**: Authentication pages (sign-in)
- **app/(protected)/**: Protected routes (example: dashboard)
- **components/auth/**: Authentication UI components
- **lib/auth/**: Authentication utilities and configuration
- **prisma/**: Database schema and seed script

This structure maintains clear separation of concerns per Constitution Principle II and supports future extensions (e.g., password reset, email verification flows).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected. All complexity is justified by MVP requirements and constitution principles.

## Phase 0: Research Complete

**Status**: ✅ Complete

All research questions resolved. Key decisions documented in [research.md](./research.md):

- NextAuth v5 with App Router and Prisma adapter
- Database sessions strategy (not JWT)
- Prisma schema structure for NextAuth + custom User model
- Credentials provider with bcrypt password hashing
- Next.js middleware for route protection
- Role verification from database on each request
- Idempotent seed script pattern

## Phase 1: Design & Contracts Complete

**Status**: ✅ Complete

### Generated Artifacts

1. **data-model.md**: Complete Prisma schema definition with User, Role enum, Account, Session, and VerificationToken models. Includes validation rules, relationships, security considerations, and migration strategy.

2. **contracts/auth-api.md**: API contracts for NextAuth endpoints and custom authorization utilities. Documents sign-in, sign-out, session management, role verification, and protected route patterns.

3. **quickstart.md**: Complete setup guide with step-by-step instructions, code examples, verification checklist, troubleshooting, and performance expectations.

4. **Agent Context Updated**: Cursor IDE context file updated with NextAuth and authentication technology information.

### Constitution Check (Post-Phase 1)

**Re-evaluation**: ✅ **PASS**

All principles remain satisfied after design phase:

- **I. MVP First**: Authentication delivers immediate value, extensible for future OAuth providers
- **II. Separation of Concerns**: Auth logic separated into config, middleware, utilities, components
- **III. Data Model as Source of Truth**: Prisma schema defines User model, NextAuth integrates with it
- **IV. Safety and Privacy**: Password hashing, secure sessions, role-based access, no sensitive data exposure
- **V. Predictable UX**: Simple sign-in/sign-out flows, clear redirect behavior

**Status**: ✅ **PASS** - Ready for Phase 2 task breakdown.
