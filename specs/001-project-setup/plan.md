# Implementation Plan: Project Setup and Foundation

**Branch**: `001-project-setup` | **Date**: 2025-11-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-project-setup/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This plan establishes the foundational infrastructure for the Youth Football Match & Player Analytics Platform MVP. The goal is to create a working Next.js full-stack monorepo with configured UI components, data fetching, code quality tools, and basic security measures. The setup enables developers to start building features immediately while maintaining code quality and following project conventions. Technical approach: Next.js App Router with TypeScript, TailwindCSS + shadcn/ui for UI, TanStack Query for data fetching, TanStack Table for data grids, and ESLint/Prettier for code quality.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode enabled)  
**Primary Dependencies**:

- Next.js 14+ (App Router)
- React 18+
- TailwindCSS 3.x
- shadcn/ui components
- TanStack Query (React Query) 5.x
- TanStack Table 8.x
- Axios for HTTP client
- ESLint + Prettier for code quality
- Structured logging library (to be selected in research phase)

**Storage**: N/A for this setup phase (Prisma + PostgreSQL will be configured in later tasks)  
**Testing**: Deferred to next phase (per spec clarifications)  
**Target Platform**: Web (desktop and tablet browsers, mobile nice-to-have)  
**Project Type**: Web application (Next.js full-stack monorepo)  
**Performance Goals**:

- Home page loads in under 2 seconds on standard development machine
- Architecture supports at least 100 concurrent users in production
- Development server starts quickly for efficient local development

**Constraints**:

- Must work on Windows, macOS, Linux
- Single repository structure (monorepo)
- TypeScript strict mode required
- All data fetching through TanStack Query (no ad-hoc fetch/axios)
- Code quality tools must catch 95%+ of common violations

**Scale/Scope**:

- MVP for 1-2 tournaments
- Support for 100+ concurrent users
- Clear folder structure for future feature additions

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Principle I: MVP First, Extensible Later

✅ **PASS**: Setup focuses on minimal viable foundation. No premature optimization or over-engineering. Structure allows future extensions (Prisma, NextAuth, etc.) without rewriting.

### Principle II: Clear Separation of Concerns

✅ **PASS**: Plan establishes clear boundaries:

- UI components (shadcn/ui) separate from business logic
- Data fetching (TanStack Query) separate from components
- API routes (Next.js Route Handlers) separate from UI
- Utilities and shared code in dedicated folders

### Principle III: API and Data Model Are the Source of Truth

⚠️ **DEFERRED**: This principle applies when Prisma schema is created in later tasks. For setup phase, we establish structure that will support this principle (API route handlers, type definitions location).

### Principle IV: Safety and Privacy by Default

✅ **PASS**:

- .env files excluded from version control (.gitignore)
- .env.example provided for documentation
- Basic input validation utilities included
- Secrets protection enforced

### Principle V: Predictable UX & Simple Flows

✅ **PASS**: Setup establishes consistent UI components (shadcn/ui) and styling (TailwindCSS) that enable predictable user experience. Simple folder structure aids developer navigation.

**Overall Status**: ✅ **PASS** - All applicable principles satisfied. Principle III will be fully validated when data model is implemented.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   └── api/                     # API route handlers
│       └── (example routes will be added in later tasks)
├── components/                   # React components
│   ├── ui/                      # shadcn/ui components
│   └── (feature components will be added in later tasks)
├── lib/                         # Utilities and shared code
│   ├── api.ts                   # Axios instance with base URL and error handling
│   ├── logger.ts                # Structured logging utility
│   └── utils.ts                 # General utilities (e.g., input validation)
├── public/                      # Static assets
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules (excludes .env)
├── next.config.js               # Next.js configuration
├── tailwind.config.ts           # TailwindCSS configuration
├── tsconfig.json                # TypeScript configuration (strict mode)
├── eslint.config.js             # ESLint configuration
├── .prettierrc                  # Prettier configuration
├── package.json                 # Dependencies and scripts
└── README.md                    # Project documentation
```

**Structure Decision**: Next.js App Router monorepo structure. This follows Next.js 14+ conventions with App Router as the primary routing mechanism. The structure separates:

- **app/**: Server and client components, API routes (Next.js App Router)
- **components/**: Reusable UI components (shadcn/ui and custom)
- **lib/**: Shared utilities, API client, logging (clear separation of concerns)
- **public/**: Static assets

This structure supports future domain-based organization (e.g., `components/players/`, `app/api/players/`) while maintaining clear boundaries per Constitution Principle II.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected. All complexity is justified by MVP requirements and constitution principles.

## Phase 0: Research Complete

**Status**: ✅ Complete

All research questions resolved. Key decisions documented in [research.md](./research.md):

- Structured logging: pino + pino-pretty
- Next.js App Router with TypeScript strict mode
- shadcn/ui + TailwindCSS setup
- TanStack Query v5 configuration
- TanStack Table v8 setup
- Axios HTTP client configuration
- ESLint + Prettier setup

## Phase 1: Design & Contracts Complete

**Status**: ✅ Complete

### Generated Artifacts

1. **data-model.md**: Infrastructure data structures documented (environment config, logging, API client). Domain entities deferred to later tasks.

2. **contracts/example-api.md**: Example API contract for testing data fetching infrastructure. Real domain contracts will be created in later tasks.

3. **quickstart.md**: Complete setup guide with verification steps and troubleshooting.

4. **Agent Context Updated**: Cursor IDE context file updated with TypeScript and project type information.

### Constitution Check (Post-Phase 1)

**Re-evaluation**: ✅ **PASS**

All principles remain satisfied after design phase:

- Structure supports clear separation of concerns
- Security measures in place (.env handling, input validation)
- Foundation ready for future data model implementation
- No violations introduced

## Next Steps

Ready for Phase 2: Task Breakdown

Run `/speckit.tasks` to generate implementation tasks based on this plan.
