# Implementation Plan: Player Entity with Admin CRUD and Public Profile Page (MVP)

**Branch**: `006-player-mvp` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-player-mvp/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement Player entity with public player list table and profile pages. Player list table is publicly accessible - anyone can view the paginated list of players. Administrators have additional capabilities to create, edit, and delete players directly from the public table (edit actions shown conditionally based on ADMIN role). Players have profile information (name, surname, position enum, date of birth, optional club/team), basic statistics (matches, goals, assists, minutes - stored as aggregates), and video highlight links. Public player profiles are accessible to anyone at `/players/[id]` without authentication. System validates position enum, date of birth, statistics ranges, and video URLs. Uses Last-Write-Wins strategy for concurrent edits. Basic statistics initialize to zero on player creation.

## Technical Context

**Language/Version**: TypeScript 5.5.4 (strict mode)  
**Primary Dependencies**: Next.js 16.0.6, React 19.0.0, Prisma 6.19.0, NextAuth 5.0.0-beta.30, TanStack Query 5.90.11, TanStack Table 8.21.3, shadcn/ui, TailwindCSS, Axios, Zod  
**Storage**: PostgreSQL (via Prisma ORM)  
**Testing**: Jest/Vitest (unit), Playwright (E2E) - to be configured  
**Target Platform**: Web (Next.js App Router, Server Components + Client Components)  
**Project Type**: Web application (full-stack Next.js)  
**Performance Goals**: 
- Player list page loads in <2 seconds (SC-002)
- Player creation completes in <2 minutes (SC-001)
- Edit operations reflect changes within 1 second (SC-003)
- Public player profile page loads in <3 seconds (SC-004)
- Support pagination with 20-50 records per page (FR-005)  
**Constraints**: 
- Must work on desktop and tablet (mobile nice-to-have)
- All UI text in Russian language (FR-021)
- Strict TypeScript mode (no `any` types)
- Server Components by default, Client Components only when needed
- Public pages accessible without authentication (FR-009)  
**Scale/Scope**: 
- Expected player base: up to 1000 players (SC-009)
- Admin users: typically 1-10 administrators
- Pagination handles up to 1000 players efficiently (SC-009)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Core Principles Compliance

✅ **I. MVP First, Extensible Later**
- Feature delivers immediate value: admin can manage players and display public profiles
- No premature generalization: simple CRUD, basic statistics as aggregates, simple video links list
- Code structured for future extensions (PlayerMatchStats integration, VideoLink entity, search/filtering can be added later)

✅ **II. Clear Separation of Concerns**
- UI components: `components/admin/players/` and `components/players/` (presentational)
- Business logic: API routes in `app/api/admin/players/` and `app/api/players/`
- Data fetching: TanStack Query hooks in components
- Data models: Prisma schema (source of truth)

✅ **III. API and Data Model Are the Source of Truth**
- Prisma Player model defines structure
- API contracts define request/response shapes
- Frontend types derived from API responses (no duplicate type definitions)

✅ **IV. Safety and Privacy by Default**
- ADMIN role required for all management operations (authorization layer)
- Public pages show only allowed information (name, position, date of birth, club, basic stats, video links)
- Date of birth validation prevents future dates
- Statistics validation prevents invalid values
- No exposure of sensitive data

✅ **V. Predictable UX & Simple Flows**
- Public player list table accessible to everyone
- Edit actions (create, edit, delete) shown conditionally for ADMIN role only
- Simple forms with validation feedback
- Explicit loading and empty states
- Confirmation dialogs for destructive actions
- Public profile page with clear sections

### Tech Stack Compliance

✅ **Frontend Stack**
- Next.js App Router: ✅ Using App Router
- TanStack Query: ✅ All data fetching via React Query hooks
- TanStack Table: ✅ Player list table built on TanStack Table
- shadcn/ui: ✅ Forms, dialogs, buttons from shadcn/ui
- TailwindCSS: ✅ Styling via utility classes

✅ **Backend Stack**
- Next.js API routes: ✅ API endpoints in `app/api/admin/players/` and `app/api/players/`
- Prisma: ✅ Player model to be added to schema
- NextAuth: ✅ Authentication and role verification already configured
- PostgreSQL: ✅ Database already set up

### Quality Bar Compliance

✅ **Testing Strategy**
- Unit tests: Core validation logic, utility functions (position enum, statistics validation, date validation)
- Integration tests: API endpoints (create, update, delete, list, public read)
- E2E tests: Admin login → view players → create player → view public profile flow

**GATE STATUS**: ✅ **PASSED** - All constitution principles satisfied. No violations detected.

## Project Structure

### Documentation (this feature)

```text
specs/006-player-mvp/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── players-api.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/
├── players/
│   ├── page.tsx                      # Public players list page (Server Component)
│   └── [id]/
│       └── page.tsx                  # Public player profile page (Server Component)
├── api/
│   ├── admin/
│   │   └── players/
│   │       ├── route.ts              # POST (create)
│   │       └── [id]/
│   │           └── route.ts          # PATCH (update), DELETE
│   └── players/
│       ├── route.ts                  # GET (public list - paginated)
│       └── [id]/
│           └── route.ts              # GET (public player profile)
components/
├── players/
│   ├── players-table.tsx             # TanStack Table wrapper (shows edit actions for admins)
│   ├── player-actions.tsx            # Action buttons (edit, delete) - shown only for ADMIN
│   ├── player-form.tsx               # Create/edit form (Client Component)
│   ├── delete-player-dialog.tsx      # Confirmation dialog
│   ├── player-profile.tsx            # Public player profile component
│   ├── player-stats.tsx              # Statistics display component
│   └── player-videos.tsx             # Video highlights component
lib/
├── api/
│   ├── admin/
│   │   └── players.ts                # API client functions for admin operations (create, update, delete)
│   └── players.ts                    # API client functions for public operations (list, get profile)
├── hooks/
│   ├── use-admin-players.ts          # TanStack Query hooks for admin operations (mutations)
│   └── use-players.ts                # TanStack Query hooks for public operations (list, profile)
└── validations/
    └── player.ts                     # Zod validation schemas for player data
prisma/
└── schema.prisma                     # Player model to be added
```

**Structure Decision**: Using Next.js App Router structure with:
- Public pages: `app/players/page.tsx` (list) and `app/players/[id]/page.tsx` (profile) - no authentication required
- Server Components for pages (check user session to conditionally show admin actions)
- Client Components for interactive UI (forms, dialogs, tables with conditional admin actions)
- API routes: 
  - Public: `app/api/players/route.ts` (GET list) and `app/api/players/[id]/route.ts` (GET profile)
  - Admin: `app/api/admin/players/route.ts` (POST create) and `app/api/admin/players/[id]/route.ts` (PATCH, DELETE)
- Shared components in `components/players/` with conditional rendering based on user role
- API client utilities in `lib/api/admin/players.ts` (admin operations) and `lib/api/players.ts` (public operations)
- Custom hooks in `lib/hooks/` for TanStack Query integration
- Admin actions (create/edit/delete buttons) shown conditionally based on ADMIN role check in components

## Complexity Tracking

> **No violations detected** - All complexity is justified by feature requirements and aligns with constitution principles.
