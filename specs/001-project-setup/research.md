# Research: Project Setup and Foundation

**Date**: 2025-11-29  
**Feature**: Project Setup and Foundation  
**Phase**: 0 - Outline & Research

## Research Questions

### 1. Structured Logging Library for Next.js

**Question**: What structured logging solution should be used for Next.js with severity levels (error, warn, info)?

**Research Findings**:

- **Decision**: Use `pino` with `pino-pretty` for development
- **Rationale**:
  - Lightweight and performant
  - Structured JSON output in production
  - Pretty printing in development
  - Supports log levels (error, warn, info, debug)
  - Well-maintained and widely used in Node.js ecosystem
  - Works seamlessly with Next.js server-side code
- **Alternatives Considered**:
  - `winston`: More features but heavier, overkill for MVP
  - `console` with custom wrapper: Too basic, lacks structured output
  - `bunyan`: Similar to pino but pino is faster

**Implementation Notes**:

- Create `lib/logger.ts` with pino instance
- Configure different log levels for development vs production
- Use structured logging in API routes and server components
- Client-side can use console for now (structured logging on client deferred)

---

### 2. Next.js App Router Best Practices with TypeScript Strict Mode

**Question**: What are the best practices for setting up Next.js 14+ App Router with TypeScript strict mode?

**Research Findings**:

- **Decision**: Use Next.js 14+ with App Router, TypeScript strict mode enabled
- **Rationale**:
  - App Router is the recommended approach for new Next.js projects
  - Server components by default improve performance
  - TypeScript strict mode catches errors early
  - Aligns with constitution requirements
- **Key Practices**:
  - Use `"strict": true` in tsconfig.json
  - Enable `"noUnusedLocals"` and `"noUnusedParameters"`
  - Use `next/image` for images
  - Prefer server components, use `"use client"` only when needed
  - API routes in `app/api/` directory

**Implementation Notes**:

- Configure tsconfig.json with strict mode
- Set up proper path aliases (@/components, @/lib, etc.)
- Use Next.js built-in TypeScript support

---

### 3. shadcn/ui Setup with TailwindCSS

**Question**: How to properly set up shadcn/ui with TailwindCSS in Next.js App Router?

**Research Findings**:

- **Decision**: Use shadcn/ui CLI for component installation, TailwindCSS 3.x with default config
- **Rationale**:
  - shadcn/ui is component library, not npm package (components copied to project)
  - Full control over component code
  - TailwindCSS integration is seamless
  - Components are accessible and customizable
- **Setup Steps**:
  1. Initialize TailwindCSS with Next.js
  2. Install shadcn/ui CLI: `npx shadcn-ui@latest init`
  3. Configure components.json
  4. Install initial components (Button, Card, Table, etc.)

**Implementation Notes**:

- Install shadcn/ui components as needed (start with Button, Card, Table)
- Configure TailwindCSS theme in tailwind.config.ts
- Use CSS variables for theming (shadcn/ui pattern)

---

### 4. TanStack Query Setup with Next.js App Router

**Question**: How to configure TanStack Query (React Query) with Next.js App Router and server components?

**Research Findings**:

- **Decision**: Use TanStack Query v5 with QueryClientProvider in root layout, React Query DevTools for development
- **Rationale**:
  - TanStack Query v5 supports React 18+ and Next.js App Router
  - Server components can't use hooks directly, but client components can
  - QueryClientProvider must be in client component wrapper
  - DevTools helpful for debugging during development
- **Key Practices**:
  - Create QueryClient in separate file to avoid recreating on each render
  - Wrap root layout with QueryClientProvider (client component)
  - Use `useQuery`, `useMutation` hooks in client components
  - Prefetch data in server components when possible

**Implementation Notes**:

- Create `lib/react-query.ts` with QueryClient configuration
- Create `components/providers/query-provider.tsx` (client component)
- Wrap app in QueryClientProvider in root layout
- Configure default options (staleTime, cacheTime, etc.)

---

### 5. TanStack Table Setup

**Question**: How to set up TanStack Table for data grids with sorting and pagination?

**Research Findings**:

- **Decision**: Use TanStack Table v8 with React, create reusable table component wrapper
- **Rationale**:
  - TanStack Table is headless (no default UI), flexible
  - Works with shadcn/ui components for styling
  - Supports sorting, pagination, filtering out of the box
  - TypeScript support is excellent
- **Key Practices**:
  - Create generic table component that accepts column definitions
  - Use shadcn/ui Table components for styling
  - Implement sorting and pagination as separate features
  - Make table responsive

**Implementation Notes**:

- Create `components/ui/data-table.tsx` as reusable wrapper
- Use shadcn/ui Table, Button, Select components
- Implement column sorting and pagination controls
- Type-safe column definitions

---

### 6. Axios Configuration for Next.js

**Question**: How to configure Axios instance with base URL and error handling for Next.js?

**Research Findings**:

- **Decision**: Create Axios instance in `lib/api.ts` with interceptors for error handling
- **Rationale**:
  - Axios provides better error handling than fetch
  - Interceptors allow centralized error handling
  - Base URL configuration simplifies API calls
  - Can add auth token interceptor later
- **Key Practices**:
  - Create axios instance with baseURL from environment variable
  - Add request interceptor for common headers
  - Add response interceptor for error handling
  - Use TypeScript for type safety

**Implementation Notes**:

- Create `lib/api.ts` with axios instance
- Configure baseURL from `process.env.NEXT_PUBLIC_API_URL` or relative path
- Add error interceptor that logs errors using structured logger
  - Return user-friendly error messages
- Export typed API functions

---

### 7. ESLint and Prettier Configuration

**Question**: What ESLint and Prettier configuration is best for Next.js + TypeScript strict mode?

**Research Findings**:

- **Decision**: Use Next.js ESLint config with TypeScript strict rules, Prettier with standard formatting
- **Rationale**:
  - Next.js provides recommended ESLint config
  - TypeScript ESLint plugin enforces type safety
  - Prettier handles code formatting consistently
  - Pre-commit hooks can enforce formatting (deferred to later)
- **Key Rules**:
  - Disable console.log in production (ESLint rule)
  - Enforce import order
  - Require explicit return types for functions
  - Enforce consistent code style

**Implementation Notes**:

- Use `eslint-config-next` as base
- Add TypeScript-specific rules
- Configure Prettier to work with ESLint (eslint-config-prettier)
- Add scripts: `lint`, `lint:fix`, `format`, `format:check`

---

## Summary of Decisions

| Area          | Decision                      | Key Dependencies                     |
| ------------- | ----------------------------- | ------------------------------------ |
| Logging       | pino + pino-pretty            | pino, pino-pretty                    |
| Next.js       | App Router, TypeScript strict | next@14+, react@18+, typescript@5+   |
| UI Components | shadcn/ui + TailwindCSS       | tailwindcss@3+, @radix-ui/\*         |
| Data Fetching | TanStack Query v5             | @tanstack/react-query@5+             |
| Tables        | TanStack Table v8             | @tanstack/react-table@8+             |
| HTTP Client   | Axios                         | axios                                |
| Code Quality  | ESLint + Prettier             | eslint, prettier, eslint-config-next |

## Unresolved Items

None. All research questions resolved.

## Next Steps

Proceed to Phase 1: Design & Contracts

- Create data-model.md (not applicable for setup, but document structure)
- Create API contracts for example endpoints
- Create quickstart.md with setup instructions
