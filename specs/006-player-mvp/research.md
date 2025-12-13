# Research: Player Entity with Admin CRUD and Public Profile Page (MVP)

**Date**: 2025-01-27  
**Feature**: 006-player-mvp  
**Status**: Complete

## Overview

This document consolidates research findings and decisions for the Player MVP feature. All clarifications from the specification phase have been resolved, and technical decisions have been made based on existing project patterns and best practices.

## Resolved Clarifications

### 1. Player Position Field Format

**Question**: What format should the "position" field use - predefined enum, predefined with manual input option, or free text?

**Decision**: Predefined enum with fixed set of positions

**Rationale**: 
- Provides data consistency and enables future filtering/search functionality
- Reduces input errors and validates data at the schema level
- Aligns with Prisma enum best practices
- Common positions in football are well-defined (Goalkeeper, Defender, Midfielder, Forward)

**Alternatives Considered**:
- Free text: Rejected due to inconsistency risks and inability to filter/search effectively
- Enum with manual input: Rejected as premature generalization for MVP

**Implementation Notes**:
- Enum values: `GOALKEEPER`, `DEFENDER`, `MIDFIELDER`, `FORWARD` (English for code, Russian for UI)
- Prisma enum will be added to schema.prisma
- UI will use dropdown/select component from shadcn/ui

---

### 2. Basic Statistics Validation

**Question**: How should the system handle invalid basic statistics values (negative numbers, unrealistically high values)?

**Decision**: Validate and block saving - prevent negative values, set reasonable maximum limits

**Rationale**:
- Ensures data integrity and prevents invalid data entry
- Protects against accidental errors or malicious input
- Clear error messages help administrators correct issues immediately
- Industry standard approach for numeric data validation

**Alternatives Considered**:
- Warning but allow saving: Rejected as it doesn't prevent data corruption
- No validation: Rejected due to data integrity concerns

**Implementation Notes**:
- Maximum limits: matches ≤ 1000, goals ≤ 500, assists ≤ 500, minutes ≤ 100000
- Validation at both client (Zod schema) and server (API route) levels
- Error messages in Russian language (FR-021)

---

### 3. Default Values for Statistics

**Question**: What default values should basic statistics fields have when a new player is created?

**Decision**: Zero (0) - all statistics fields are initialized to zero when a player is created

**Rationale**:
- Standard practice for aggregate/counter fields
- Simplifies calculations and display logic
- Zero is semantically correct (player hasn't played matches yet)
- Consistent with database default value patterns

**Alternatives Considered**:
- NULL/empty: Rejected as it requires null checks in display logic and calculations
- Hide until set: Rejected as it adds unnecessary complexity for MVP

**Implementation Notes**:
- Prisma schema will use `@default(0)` for all statistics fields
- Forms will initialize to 0
- Display logic can safely assume numeric values

---

### 4. Concurrent Editing Strategy

**Question**: How should the system handle concurrent editing of the same player by multiple administrators?

**Decision**: Last-Write-Wins - the last save overwrites previous changes without warnings

**Rationale**:
- Simplest implementation for MVP (no version tracking or conflict resolution needed)
- Acceptable for small admin teams (1-10 administrators)
- Reduces complexity and development time
- Can be enhanced with optimistic locking in future if needed

**Alternatives Considered**:
- Optimistic locking: Rejected as premature complexity for MVP
- Last-Write-Wins with warning: Rejected as it adds UX complexity without significant benefit for small teams

**Implementation Notes**:
- Standard Prisma update operations (no version fields)
- No conflict detection or merging logic required
- Documented in assumptions that this may be enhanced later if team grows

---

### 5. Video Highlights Limit

**Question**: Should there be a limit on the number of video highlight links per player?

**Decision**: Reasonable limit - maximum 10-20 links per player (exact number to be determined during implementation)

**Rationale**:
- Prevents UI overflow and performance issues on public profile page
- Reasonable limit for MVP use cases (players typically have 5-10 highlight videos)
- Can be increased later if needed without schema changes
- Protects against accidental bulk additions

**Alternatives Considered**:
- No limit: Rejected due to UX and performance concerns
- Strict limit (5): Rejected as too restrictive

**Implementation Notes**:
- Exact limit to be set during implementation (likely 10-15)
- Validation in API route and form component
- Error message: "Достигнуто максимальное количество видео-ссылок"

---

## Technical Decisions

### Database Schema

**Decision**: Store video highlight links as JSON array in Player model

**Rationale**:
- Simple MVP approach (no separate VideoLink entity)
- PostgreSQL JSON/JSONB type supports efficient storage and queries
- Can migrate to separate entity later if needed for metadata
- Aligns with "MVP First, Extensible Later" principle

**Implementation Notes**:
- Prisma type: `String[]` or `Json` depending on Prisma version
- Validation: URL format validation via Zod schema
- Maximum array length enforced in validation

---

### Public Route Structure

**Decision**: Public player profiles at `/players/[id]` route (outside protected routes)

**Rationale**:
- Clear separation: admin routes in `(protected)/admin/players/`, public routes at `/players/[id]`
- No authentication middleware needed for public pages
- SEO-friendly URLs
- Consistent with Next.js App Router conventions

**Implementation Notes**:
- Server Component for initial render
- Optional TanStack Query for client-side navigation/caching
- 404 handling for non-existent players

---

### Statistics Display Format

**Decision**: Display statistics as numbers with units (e.g., "5 матчей", "12 голов", "450 минут")

**Rationale**:
- Clear and readable for Russian-speaking users
- Follows Russian grammar rules for pluralization
- Standard format for sports statistics

**Implementation Notes**:
- Helper function for pluralization (матч/матча/матчей)
- Compact display suitable for profile pages

---

## Best Practices Applied

### Prisma Schema Design
- Use enums for fixed value sets (position)
- Default values for statistics fields
- Timestamps (createdAt, updatedAt) for audit trail
- Optional relations (teamId) for future extensibility

### API Design
- RESTful conventions: GET /api/admin/players (list), POST /api/admin/players (create), etc.
- Separate public API route: GET /api/players/[id] (no auth required)
- Consistent error response format
- Pagination using query parameters (page, pageSize)

### Form Validation
- Client-side validation with Zod (immediate feedback)
- Server-side validation in API routes (security)
- Russian language error messages
- Clear field labels and help text

### Component Architecture
- Server Components for pages (automatic auth, SEO)
- Client Components for interactive forms and tables
- Shared UI components from shadcn/ui
- Custom hooks for data fetching (TanStack Query)

## Dependencies

### Existing Infrastructure (Already Available)
- Next.js 16.0.6 with App Router
- Prisma 6.19.0 with PostgreSQL
- NextAuth 5.0.0-beta.30 with role-based access
- TanStack Query 5.90.11 for data fetching
- TanStack Table 8.21.3 for tables
- shadcn/ui components
- Axios for HTTP client
- Zod for validation

### New Requirements
- None - all required dependencies are already in the project

## Open Questions / Future Enhancements

1. **Position Enum Values**: Specific enum values to be finalized during implementation (may include variations like CENTER_BACK, LEFT_WING, etc. depending on domain requirements)

2. **Video Link Validation**: May want to validate video URLs are from specific platforms (YouTube, Vimeo) in future, but for MVP any valid URL is acceptable

3. **Statistics Calculation**: In future, statistics may be calculated from PlayerMatchStats instead of stored aggregates, but this is out of scope for MVP

4. **Team/Club Relation**: teamId is optional for MVP; if Team entity doesn't exist yet, this field can be stored as string or skipped until Team feature is implemented

## References

- Prisma Enum Documentation: https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#enum
- Next.js App Router: https://nextjs.org/docs/app
- TanStack Table: https://tanstack.com/table/latest
- Zod Validation: https://zod.dev/

