# Implementation Plan: Admin Users CRUD

**Branch**: `005-admin-users` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-admin-users/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement admin dashboard for user management (CRUD operations). Administrators can view paginated user list, create new users, edit user data (name, role, active status), and delete/deactivate users. All operations require ADMIN role. New users can authenticate via email magic link or Yandex OAuth. System validates email uniqueness and format, handles concurrent edits with last-write-wins strategy, and provides explicit loading/empty states.

## Technical Context

**Language/Version**: TypeScript 5.5.4 (strict mode)  
**Primary Dependencies**: Next.js 16.0.6, React 19.0.0, Prisma 6.19.0, NextAuth 5.0.0-beta.30, TanStack Query 5.90.11, TanStack Table 8.21.3, shadcn/ui, TailwindCSS  
**Storage**: PostgreSQL (via Prisma ORM)  
**Testing**: Jest/Vitest (unit), Playwright (E2E) - to be configured  
**Target Platform**: Web (Next.js App Router, Server Components + Client Components)  
**Project Type**: Web application (full-stack Next.js)  
**Performance Goals**: 
- List page loads in <2 seconds (SC-001)
- User creation completes in <1 minute (SC-002)
- Edit operations reflect changes within 1 second (SC-003)
- Support pagination with 20-50 records per page  
**Constraints**: 
- Must work on desktop and tablet (mobile nice-to-have)
- All UI text in Russian language
- Strict TypeScript mode (no `any` types)
- Server Components by default, Client Components only when needed  
**Scale/Scope**: 
- Expected user base: hundreds to low thousands of users
- Admin users: typically 1-10 administrators
- Pagination handles up to thousands of users efficiently

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Core Principles Compliance

✅ **I. MVP First, Extensible Later**
- Feature delivers immediate value: admin can manage users without manual DB access
- No premature generalization: simple CRUD, no bulk operations, no advanced filtering
- Code structured for future extensions (search, filters, bulk operations can be added later)

✅ **II. Clear Separation of Concerns**
- UI components: `components/admin/users/` (presentational)
- Business logic: API routes in `app/api/admin/users/`
- Data fetching: TanStack Query hooks in components
- Data models: Prisma schema (source of truth)

✅ **III. API and Data Model Are the Source of Truth**
- Prisma User model defines structure
- API contracts define request/response shapes
- Frontend types derived from API responses (no duplicate type definitions)

✅ **IV. Safety and Privacy by Default**
- ADMIN role required for all operations (authorization layer)
- Email validation prevents invalid data
- Audit logging for all user management actions (FR-018)
- No exposure of sensitive data beyond what's necessary

✅ **V. Predictable UX & Simple Flows**
- Single page for user list with clear actions (create, edit, delete)
- Simple forms with validation feedback
- Explicit loading and empty states
- Confirmation dialogs for destructive actions

### Tech Stack Compliance

✅ **Frontend Stack**
- Next.js App Router: ✅ Using App Router
- TanStack Query: ✅ All data fetching via React Query hooks
- TanStack Table: ✅ User list table built on TanStack Table
- shadcn/ui: ✅ Forms, dialogs, buttons from shadcn/ui
- TailwindCSS: ✅ Styling via utility classes

✅ **Backend Stack**
- Next.js API routes: ✅ API endpoints in `app/api/admin/users/`
- Prisma: ✅ User model already exists in schema
- NextAuth: ✅ Authentication and role verification already configured
- PostgreSQL: ✅ Database already set up

### Quality Bar Compliance

✅ **Testing Strategy**
- Unit tests: Core validation logic, utility functions
- Integration tests: API endpoints (create, update, delete, list)
- E2E tests: Admin login → view users → create user → edit user flow

**GATE STATUS**: ✅ **PASSED** - All constitution principles satisfied. No violations detected.

## Project Structure

### Documentation (this feature)

```text
specs/005-admin-users/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── admin-users-api.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/
├── (protected)/
│   └── admin/
│       └── users/
│           └── page.tsx              # Admin users list page (Server Component)
├── api/
│   └── admin/
│       └── users/
│           ├── route.ts              # GET (list), POST (create)
│           └── [id]/
│               ├── route.ts          # GET (single), PATCH (update), DELETE
│               └── route.ts
components/
├── admin/
│   └── users/
│       ├── users-table.tsx           # TanStack Table wrapper for user list
│       ├── user-form.tsx             # Create/edit form (Client Component)
│       ├── delete-user-dialog.tsx    # Confirmation dialog
│       └── user-actions.tsx          # Action buttons (edit, delete)
lib/
├── api/
│   └── admin/
│       └── users.ts                  # API client functions (wrappers around axios)
└── hooks/
    └── use-admin-users.ts            # TanStack Query hooks for user operations
```

**Structure Decision**: Using Next.js App Router structure with:
- Server Components for pages (automatic auth check, data fetching)
- Client Components for interactive UI (forms, dialogs, tables)
- API routes in `app/api/admin/users/` following RESTful conventions
- Shared components in `components/admin/users/`
- API client utilities in `lib/api/admin/users.ts`
- Custom hooks in `lib/hooks/` for TanStack Query integration

## Complexity Tracking

> **No violations detected** - All complexity is justified by feature requirements and aligns with constitution principles.
