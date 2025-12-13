# Quickstart: Player Entity with Admin CRUD and Public Profile Page (MVP)

**Feature**: 006-player-mvp  
**Date**: 2025-01-27

## Overview

Quick reference guide for implementing Player entity with admin CRUD and public profile pages. See [plan.md](./plan.md) for detailed architecture and [spec.md](./spec.md) for requirements.

## Implementation Checklist

### Phase 1: Database Schema

- [ ] Add `Position` enum to Prisma schema (`prisma/schema.prisma`)
- [ ] Add `Player` model to Prisma schema with all required fields
- [ ] Configure indexes on `teamId`, `position`, and `(firstName, lastName)`
- [ ] Set default values for statistics fields (0) and videoLinks ([])
- [ ] Run `npm run db:push` to apply schema changes
- [ ] Run `npm run db:generate` to regenerate Prisma Client

### Phase 2: API Endpoints - Public

- [ ] Create `app/api/players/route.ts` (GET public list - paginated, no auth required)
- [ ] Create `app/api/players/[id]/route.ts` (GET public player profile, no auth required)
- [ ] Implement pagination for GET list (page, pageSize params)
- [ ] Return only public fields (exclude internal timestamps if not needed)
- [ ] Handle 404 for non-existent players (FR-020)
- [ ] Implement performance optimization (must load within 2 seconds for list)

### Phase 3: API Endpoints - Admin

- [ ] Create `app/api/admin/players/route.ts` (POST create - ADMIN role required)
- [ ] Create `app/api/admin/players/[id]/route.ts` (PATCH update, DELETE - ADMIN role required)
- [ ] Implement authentication check (NextAuth session + ADMIN role)
- [ ] Implement position enum validation
- [ ] Implement date of birth validation (not in future)
- [ ] Implement statistics validation (ranges, non-negative)
- [ ] Implement video links validation (URL format, max length)
- [ ] Add error handling with Russian messages (FR-021)
- [ ] Implement Last-Write-Wins strategy for concurrent edits (FR-028)

### Phase 4: Validation Schemas

- [ ] Create `lib/validations/player.ts` with Zod schemas
- [ ] Add validation for firstName, lastName (min/max length)
- [ ] Add validation for position (enum)
- [ ] Add validation for dateOfBirth (not in future, reasonable age range)
- [ ] Add validation for statistics (ranges, non-negative)
- [ ] Add validation for videoLinks (URL format, max array length)

### Phase 5: API Client Functions

- [ ] Create `lib/api/admin/players.ts` (API client functions for admin operations - create, update, delete)
- [ ] Create `lib/api/players.ts` (API client functions for public operations - list, get profile)
- [ ] Implement functions for all operations
- [ ] Add TypeScript types derived from API contracts

### Phase 6: TanStack Query Hooks

- [ ] Create `lib/hooks/use-admin-players.ts` (mutation hooks for admin - create, update, delete)
- [ ] Create `lib/hooks/use-players.ts` (query hooks for public - list, get profile)
- [ ] Implement pagination support in list query hook
- [ ] Implement optimistic updates for admin mutations
- [ ] Add error handling and loading states

### Phase 7: Frontend Components - Public List & Profile

- [ ] Create `app/players/page.tsx` (Server Component - public player list page, no auth required)
- [ ] Create `components/players/players-table.tsx` (TanStack Table wrapper with conditional admin actions)
- [ ] Create `components/players/player-actions.tsx` (Action buttons - edit, delete, shown only for ADMIN role)
- [ ] Implement loading state ("Загрузка...")
- [ ] Implement empty state ("Игроки не найдены")
- [ ] Implement pagination UI
- [ ] Implement conditional rendering of admin actions based on user role check

### Phase 8: Frontend Components - Admin Forms & Dialogs

- [ ] Create `components/players/player-form.tsx` (Create/Edit form - Client Component)
- [ ] Create `components/players/delete-player-dialog.tsx` (Confirmation dialog)
- [ ] Implement form validation with Zod schemas
- [ ] Implement form submission with error handling

### Phase 9: Frontend Components - Public Profile

- [ ] Create `app/players/[id]/page.tsx` (Server Component - public player profile page)
- [ ] Create `components/players/player-profile.tsx` (Main profile component)
- [ ] Create `components/players/player-stats.tsx` (Statistics display component)
- [ ] Create `components/players/player-videos.tsx` (Video highlights component)
- [ ] Implement loading state
- [ ] Implement 404 error page
- [ ] Add placeholder "Матчи" section for future PlayerMatchStats integration

### Phase 9: Integration & Testing

- [ ] Test pagination (20-50 records per page)
- [ ] Test create player (validation, all required fields)
- [ ] Test update player (validation, statistics updates)
- [ ] Test delete player (confirmation dialog, 404 after deletion)
- [ ] Test loading states (FR-007)
- [ ] Test empty states (FR-008)
- [ ] Test error handling (all error scenarios, Russian messages)
- [ ] Test authorization (non-ADMIN users blocked from admin routes)
- [ ] Test public access (no authentication required for public profile)
- [ ] Test position enum validation
- [ ] Test date of birth validation (future dates blocked)
- [ ] Test statistics validation (negative values, max limits)
- [ ] Test video links validation (invalid URLs, max length)

## Key Files to Create

```
app/
├── players/
│   ├── page.tsx                    # Public player list page (no auth required)
│   └── [id]/
│       └── page.tsx                # Public player profile page
└── api/
    ├── admin/players/
    │   ├── route.ts                # POST create (ADMIN only)
    │   └── [id]/
    │       └── route.ts            # PATCH update, DELETE (ADMIN only)
    └── players/
        ├── route.ts                # GET public list (no auth required)
        └── [id]/
            └── route.ts            # GET public profile (no auth required)

components/
├── players/
│   ├── players-table.tsx           # TanStack Table component (shows admin actions conditionally)
│   ├── player-actions.tsx          # Action buttons (edit, delete - shown only for ADMIN)
│   ├── player-form.tsx             # Create/edit form
│   ├── delete-player-dialog.tsx    # Confirmation dialog
│   ├── player-profile.tsx          # Public profile component
│   ├── player-stats.tsx            # Statistics component
│   └── player-videos.tsx           # Videos component

lib/
├── api/
│   ├── admin/players.ts            # Admin API client (create, update, delete)
│   └── players.ts                  # Public API client (list, get profile)
├── hooks/
│   ├── use-admin-players.ts        # Admin TanStack Query hooks (mutations)
│   └── use-players.ts              # Public TanStack Query hooks (queries)
└── validations/
    └── player.ts                   # Zod validation schemas

prisma/
└── schema.prisma                   # Add Player model and Position enum
```

## Key Implementation Notes

### Position Enum

- Enum values in code: `GOALKEEPER`, `DEFENDER`, `MIDFIELDER`, `FORWARD`
- Display names in UI: "Вратарь", "Защитник", "Полузащитник", "Нападающий"
- Use shadcn/ui Select component for position dropdown

### Statistics Defaults

- All statistics fields default to 0 when player is created
- Admins can update statistics manually
- Validation: non-negative, within max limits (matches ≤ 1000, goals ≤ 500, assists ≤ 500, minutes ≤ 100000)

### Video Links

- Store as string array in database
- Maximum 15-20 links per player (enforced in validation)
- Each URL must be valid (validated via Zod)
- Display as clickable links on public profile

### Public Player List

- No authentication required
- Accessible at `/players`
- Shows: paginated table with player information
- Admin actions (create, edit, delete buttons) shown conditionally based on ADMIN role
- Same table for all users, but admins see additional actions

### Public Profile

- No authentication required
- Accessible at `/players/[id]`
- Shows: name, position, date of birth, club, statistics, video links
- Placeholder "Матчи" section for future integration

### Error Messages

- All error messages in Russian language
- User-friendly, clear messages
- Field-specific validation errors when possible

## Testing Focus Areas

1. **Validation**: All validation rules (position, dates, statistics, URLs)
2. **Authorization**: ADMIN role required for admin routes
3. **Public Access**: No auth required for public profiles
4. **Pagination**: Proper pagination handling (20-50 records)
5. **Error Handling**: All error scenarios with Russian messages
6. **Loading States**: Explicit loading messages
7. **Empty States**: Explicit empty state messages

## References

- [Plan](./plan.md) - Detailed implementation plan
- [Spec](./spec.md) - Feature specification
- [Data Model](./data-model.md) - Database schema details
- [API Contracts](./contracts/players-api.md) - API endpoint specifications
- [Research](./research.md) - Technical decisions and rationale

