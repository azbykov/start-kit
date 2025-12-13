# Quickstart: Admin Users CRUD

**Feature**: 005-admin-users  
**Date**: 2025-01-27

## Overview

Quick reference guide for implementing Admin Users CRUD feature. See [plan.md](./plan.md) for detailed architecture and [spec.md](./spec.md) for requirements.

## Implementation Checklist

### Phase 1: API Endpoints

- [ ] Create `app/api/admin/users/route.ts` (GET list, POST create)
- [ ] Create `app/api/admin/users/[id]/route.ts` (GET single, PATCH update, DELETE)
- [ ] Implement authentication check (NextAuth session + ADMIN role)
- [ ] Implement pagination for GET list (page, pageSize params)
- [ ] Implement email validation (format + uniqueness)
- [ ] Implement external auth service check (FR-022, FR-023)
- [ ] Add error handling with Russian messages (FR-017)
- [ ] Add audit logging (FR-018)

### Phase 2: Frontend Components

- [ ] Create `app/(protected)/admin/users/page.tsx` (Server Component)
- [ ] Create `components/admin/users/users-table.tsx` (TanStack Table)
- [ ] Create `components/admin/users/user-form.tsx` (Create/Edit form)
- [ ] Create `components/admin/users/delete-user-dialog.tsx` (Confirmation)
- [ ] Create `lib/api/admin/users.ts` (API client functions)
- [ ] Create `lib/hooks/use-admin-users.ts` (TanStack Query hooks)

### Phase 3: Integration & Testing

- [ ] Test pagination (20-50 records per page)
- [ ] Test create user (validation, duplicate email, external auth check)
- [ ] Test update user (immutable email, last-write-wins)
- [ ] Test delete user (self-deletion prevention)
- [ ] Test loading states (FR-020)
- [ ] Test empty states (FR-021)
- [ ] Test error handling (all error scenarios)
- [ ] Test authorization (non-ADMIN users blocked)

## Key Files to Create

```
app/
├── (protected)/admin/users/
│   └── page.tsx                    # User list page
└── api/admin/users/
    ├── route.ts                    # GET list, POST create
    └── [id]/
        └── route.ts                # GET, PATCH, DELETE

components/admin/users/
├── users-table.tsx                 # TanStack Table component
├── user-form.tsx                   # Create/edit form
└── delete-user-dialog.tsx          # Delete confirmation

lib/
├── api/admin/users.ts              # API client
└── hooks/use-admin-users.ts        # TanStack Query hooks
```

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users?page=1&pageSize=25` | List users (paginated) |
| GET | `/api/admin/users/[id]` | Get single user |
| POST | `/api/admin/users` | Create user |
| PATCH | `/api/admin/users/[id]` | Update user |
| DELETE | `/api/admin/users/[id]` | Delete user |

See [contracts/admin-users-api.md](./contracts/admin-users-api.md) for detailed API specs.

## Data Model

**Entity**: User (from Prisma schema)

**Editable Fields**:
- `name` (optional)
- `role` (required, enum: PLAYER/COACH/AGENT/ADMIN)
- `isActive` (boolean, default: true)

**Immutable Fields**:
- `email` (cannot be changed after creation)

See [data-model.md](./data-model.md) for complete data model.

## Key Requirements

### Functional Requirements
- ✅ Pagination: 20-50 records per page (FR-001)
- ✅ Email validation: format + uniqueness (FR-005, FR-006)
- ✅ Email immutable: cannot edit after creation (FR-008)
- ✅ External auth check: block creation if services unavailable (FR-022, FR-023)
- ✅ Last-write-wins: concurrent edits (FR-019)
- ✅ Self-deletion prevention: cannot delete yourself (FR-016)
- ✅ Loading states: explicit "Загрузка..." message (FR-020)
- ✅ Empty states: explicit "Пользователи не найдены" message (FR-021)
- ✅ Russian error messages: all errors in Russian (FR-017)
- ✅ Audit logging: log all actions (FR-018)

### Performance Targets
- List page: <2 seconds (SC-001)
- Create user: <1 minute (SC-002)
- Update user: <1 second to reflect changes (SC-003)

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL + Prisma
- **Auth**: NextAuth v5 (ADMIN role required)
- **Data Fetching**: TanStack Query
- **Tables**: TanStack Table
- **UI**: shadcn/ui + TailwindCSS
- **Language**: TypeScript 5.5.4 (strict mode)

## Common Patterns

### API Route Authentication
```typescript
const session = await auth();
if (!session) {
  return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
}

const hasAccess = await verifyUserRole(Role.ADMIN);
if (!hasAccess) {
  return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
}
```

### TanStack Query Hook
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['admin-users', page, pageSize],
  queryFn: () => getUsers(page, pageSize),
});
```

### Form Validation (Zod)
```typescript
const userSchema = z.object({
  email: z.string().email('Некорректный email'),
  name: z.string().optional(),
  role: z.nativeEnum(Role),
  isActive: z.boolean().default(true),
});
```

## Testing Priorities

1. **Critical Paths**:
   - Admin login → view users → create user → edit user → delete user
   - Authorization: non-ADMIN users cannot access

2. **Edge Cases**:
   - Duplicate email creation
   - Invalid email format
   - External auth services unavailable
   - Concurrent edits (last-write-wins)
   - Self-deletion attempt

3. **Performance**:
   - Pagination with 100+ users
   - List load time <2 seconds
   - Create/update response times

## Next Steps

1. Review [plan.md](./plan.md) for architecture details
2. Review [data-model.md](./data-model.md) for data structure
3. Review [contracts/admin-users-api.md](./contracts/admin-users-api.md) for API specs
4. Start with API endpoints (Phase 1)
5. Then build frontend components (Phase 2)
6. Finally integration testing (Phase 3)

## Resources

- [Specification](./spec.md) - Complete feature requirements
- [Plan](./plan.md) - Implementation architecture
- [Research](./research.md) - Technology decisions and patterns
- [Data Model](./data-model.md) - Entity definitions and validation
- [API Contracts](./contracts/admin-users-api.md) - API endpoint specifications

