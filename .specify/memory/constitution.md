<!--
Sync Impact Report:
Version change: 0.0.0 → 1.0.0 (MAJOR: Initial constitution creation)
Modified principles: N/A (initial creation)
Added sections: Tech Stack & Conventions, Domain Model, Roles & Permissions, UX & UI Guidelines, Data Import & Admin Flows, Quality Bar & Testing, Collaboration Rules
Removed sections: N/A
Templates requiring updates:
  ✅ plan-template.md - Constitution Check section aligns with principles
  ✅ spec-template.md - Scope/requirements alignment verified
  ✅ tasks-template.md - Task categorization reflects MVP-first approach
Follow-up TODOs: None
-->

# Youth Football Match & Player Analytics Platform (MVP) Constitution

## Core Principles

### I. MVP First, Extensible Later

We prioritize delivering a small, coherent, vertical slice that is actually usable by 1–2 tournaments. We avoid premature generalization but keep code structured for future extensions. Every feature must deliver immediate value to end users while maintaining architectural flexibility for later phases (Veo API integration, ML analytics, subscription systems).

### II. Clear Separation of Concerns

UI components vs. feature logic vs. data-fetching vs. data models must be clearly separated. Do not mix data fetching and complex logic directly inside presentational components. Each layer has a distinct responsibility: components render, hooks/utilities handle business logic, services manage data operations, and models define structure.

### III. API and Data Model Are the Source of Truth

The backend schema (Prisma + Postgres) and API contracts define what exists in the system. Frontend types must be derived from API/Prisma where possible, not re-invented. Any discrepancies between frontend and backend types indicate a design flaw that must be resolved at the source (backend/API), not patched in the frontend.

### IV. Safety and Privacy by Default

We deal with minors: no unnecessary PII, no public exposure of sensitive data. Public pages show only information explicitly allowed in the PRD (name, position, club, basic stats, links to videos). Any additional sensitive fields must be restricted to authorized roles. Privacy violations are non-negotiable and must be caught in code review.

### V. Predictable UX & Simple Flows

Fewer screens and branches, more clarity. Each role has a simple "home" with obvious next actions. Navigation should be intuitive without requiring documentation. Complex workflows must be broken down into clear, linear steps. User confusion is a bug, not a feature.

## Tech Stack & Conventions

### Frontend

- **Framework**: Next.js (App Router preferred, if not stated otherwise)
- **Styling**: TailwindCSS
- **Component library**: shadcn/ui (as the primary UI component source)
- **State management**: Zustand for global client-side state where necessary
- **Data fetching / caching**: TanStack Query (React Query). All server data fetching in React components must go through TanStack Query hooks (or wrappers on top of it), not ad-hoc fetch or axios usage
- **Tables & data grids**: TanStack Table. All complex tables (sorting, pagination, column visibility, etc.) must be built on TanStack Table with shared abstractions
- **HTTP client**: Axios instance with base URL config, interceptors for auth tokens (if needed), and centralized error handling

### Backend

- **Runtime**: Node.js (via Next.js API routes / app router handlers)
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: NextAuth with Yandex provider and Email provider
- **Session & roles**: User entity stored in Postgres. Role mapping: Player, Coach, Agent, Admin. Role-guarded endpoints and pages (authorization layer on top of NextAuth)

### Shared

- **Language**: TypeScript everywhere
- **Linting & formatting**: ESLint + Prettier + TypeScript strict mode
- **Module boundaries**: Group features by domain (e.g. players, teams, matches, tournaments, auth, admin, search). Common/shared utilities in a dedicated shared module/folder

## Domain Model

### Core Entities

- **User**: Authentication identity + role (Player / Coach / Agent / Admin). Optional relation to Player or Coach profile where relevant
- **Player**: Public info (name, surname, position, date of birth, club/team, jersey number, optional physical data). Relations: teamId → Team, stats via PlayerMatchStats, videos via VideoLink
- **Team**: Name, logo, coach, tournament participation. Relations: players (one-to-many), matchesHome, matchesAway
- **Match**: Date, tournament, home team, away team, score, link to match video. Relations: playerStats (PlayerMatchStats)
- **PlayerMatchStats**: Links a player to a match. Fields: minutes played, goals, assists, cards, etc.
- **Tournament**: Name, season/year, location (optional)
- **VideoLink**: URL, type (HIGHLIGHT, FULL_MATCH, etc.), relation to Player or Match
- **ImportJob**: Tracks CSV/JSON imports (status, errors, timestamps)

Exact field-level definitions live in the Prisma schema and API specs. The constitution fixes the conceptual model and relationships, not every single column.

## Roles & Permissions

### Player

- Can view and edit (where allowed) only their own profile (or request edits)
- Can view their own matches, stats, and video links
- Can view public profiles of other players (within allowed scope)

### Coach

- Can view and manage their own team and its players
- Can view match stats for their team
- Cannot see or edit unrelated teams by default

### Agent

- Can use extended search and filtering
- Can save and manage favorites (players lists)
- Has read-only access to public player information and allowed stats

### Admin

- Full CRUD on players, teams, matches, tournaments
- Manages users and roles
- Runs imports and sees import logs

## UX & UI Guidelines

- Use shadcn/ui as the baseline components: buttons, inputs, dialogs, dropdowns, etc.
- Styling via TailwindCSS utility classes; avoid custom CSS files where possible
- **Tables**: Use a shared table implementation based on TanStack Table. Support at least: sorting, basic pagination, column alignment & responsive behavior
- **Loading & error states**: Every TanStack Query call must have explicit loading and error states in UI
- **Responsive layout**: Must work well on desktop and tablet; mobile support is nice-to-have but not blocking for MVP

## Data Import & Admin Flows

- Admin can upload CSV/JSON via admin panel
- System must: validate file format, map columns to entities (at least via simple, documented format), create or update players, teams, matches, stats, log status and errors in ImportJob
- Import logic should be idempotent where possible (re-importing same file should not corrupt data)

## Quality Bar & Testing

- Unit tests for core domain logic and non-trivial utilities
- Integration tests for critical API endpoints (especially auth & imports)
- Simple E2E smoke tests for: login flow, player public profile view, team page, basic player search
- We prefer a "thin but reliable" test layer that covers main flows over exhaustive coverage

## Collaboration Rules

- All tasks should be described via SpecKit specs (feature-level) before implementation
- Non-trivial changes to: data model, auth/roles, public pages must be discussed and recorded as decisions
- **PRs**: Small, focused, with clear description. Include any required schema/API changes and migrations. Must not break existing key flows
- **Documentation**: Keep a short README for each feature/domain folder describing: purpose, main components/hooks, API contracts used

## Governance

This constitution supersedes all other development practices and decisions. Amendments require:

1. Documentation of the proposed change and rationale
2. Impact assessment on existing code and principles
3. Update to this file with version increment
4. Propagation to dependent templates and documentation

**Compliance**: All PRs/reviews must verify compliance with constitution principles. Complexity must be justified. Violations of Core Principles (especially IV - Safety and Privacy) are grounds for immediate rejection.

**Versioning Policy**:

- MAJOR: Backward incompatible governance/principle removals or redefinitions
- MINOR: New principle/section added or materially expanded guidance
- PATCH: Clarifications, wording, typo fixes, non-semantic refinements

**Version**: 1.0.0 | **Ratified**: 2025-11-29 | **Last Amended**: 2025-11-29
