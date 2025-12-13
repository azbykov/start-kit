# Research: Admin Users CRUD

**Feature**: 005-admin-users  
**Date**: 2025-01-27  
**Status**: Complete

## Overview

Research phase for Admin Users CRUD feature. All technologies are already established in the project, so research focused on implementation patterns, best practices, and integration approaches.

## Research Topics

### 1. TanStack Table Integration with Next.js App Router

**Decision**: Use TanStack Table v8 with Server Components for data fetching and Client Components for table rendering.

**Rationale**:
- TanStack Table v8 supports React 19 and works well with Next.js App Router
- Server Components fetch data, pass to Client Component table
- TanStack Table provides built-in pagination, sorting, column management
- Aligns with constitution requirement: "All complex tables must be built on TanStack Table"

**Alternatives Considered**:
- Manual table implementation: Rejected - violates constitution, more code to maintain
- React Table v7: Rejected - older version, v8 has better TypeScript support

**Implementation Pattern**:
```typescript
// Server Component (page.tsx)
const users = await getUsers(page, pageSize);

// Client Component (users-table.tsx)
"use client";
import { useReactTable } from "@tanstack/react-table";
```

**References**:
- TanStack Table v8 docs: https://tanstack.com/table/latest
- Next.js App Router patterns: Server Components + Client Components separation

---

### 2. Pagination Strategy for User List

**Decision**: Server-side pagination with cursor-based or offset-based approach using Prisma.

**Rationale**:
- FR-001 requires pagination (20-50 records per page)
- Server-side pagination is more efficient for large datasets
- Prisma supports both `skip/take` (offset) and cursor-based pagination
- Offset-based is simpler for MVP, can upgrade to cursor-based later if needed

**Alternatives Considered**:
- Client-side pagination: Rejected - doesn't scale, violates performance requirements
- Infinite scroll: Rejected - not specified in requirements, pagination is clearer UX for admin

**Implementation Pattern**:
```typescript
// API route
const page = parseInt(searchParams.get('page') || '1');
const pageSize = parseInt(searchParams.get('pageSize') || '25');
const skip = (page - 1) * pageSize;

const users = await prisma.user.findMany({
  skip,
  take: pageSize,
  orderBy: { createdAt: 'desc' }
});

const total = await prisma.user.count();
```

**References**:
- Prisma pagination: https://www.prisma.io/docs/concepts/components/prisma-client/pagination

---

### 3. Form Validation and Error Handling

**Decision**: Client-side validation with Zod schema, server-side validation with Prisma constraints.

**Rationale**:
- Email format validation: Use Zod email() validator
- Email uniqueness: Check via Prisma `findUnique` before create
- Provides immediate feedback to users (better UX)
- Server-side validation as security layer (never trust client)

**Alternatives Considered**:
- Server-only validation: Rejected - poor UX, users see errors only after submit
- No validation: Rejected - violates FR-005, FR-006

**Implementation Pattern**:
```typescript
// Client-side (Zod)
const userSchema = z.object({
  email: z.string().email('Некорректный email'),
  name: z.string().optional(),
  role: z.nativeEnum(Role),
  isActive: z.boolean().default(true)
});

// Server-side (Prisma)
const existing = await prisma.user.findUnique({ where: { email } });
if (existing) throw new Error('Email уже существует');
```

**References**:
- Zod validation: https://zod.dev/
- Prisma unique constraints: https://www.prisma.io/docs/concepts/components/prisma-schema/data-model#unique-constraints

---

### 4. Concurrent Edit Handling (Last-Write-Wins)

**Decision**: Implement last-write-wins strategy with optimistic UI updates via TanStack Query.

**Rationale**:
- Clarification confirmed: last-write-wins (last save overwrites previous)
- TanStack Query provides optimistic updates out of the box
- Simple to implement, no need for complex locking mechanisms
- Acceptable for MVP (admins rarely edit same user simultaneously)

**Alternatives Considered**:
- Optimistic locking (version field): Rejected - adds complexity, not required for MVP
- Pessimistic locking (block edits): Rejected - poor UX, blocks legitimate concurrent access

**Implementation Pattern**:
```typescript
// TanStack Query mutation with optimistic update
const mutation = useMutation({
  mutationFn: updateUser,
  onMutate: async (newData) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['users', id] });
    // Snapshot previous value
    const previous = queryClient.getQueryData(['users', id]);
    // Optimistically update
    queryClient.setQueryData(['users', id], newData);
    return { previous };
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(['users', id], context.previous);
  }
});
```

**References**:
- TanStack Query optimistic updates: https://tanstack.com/query/latest/docs/react/guides/optimistic-updates

---

### 5. External Authentication Service Validation

**Decision**: Check email provider and Yandex OAuth availability during user creation, block creation if unavailable.

**Rationale**:
- Clarification confirmed: block user creation if external services unavailable
- Prevents creating users who cannot authenticate
- Better to fail early than create broken user accounts
- Can check by attempting to send test email or verify OAuth config

**Alternatives Considered**:
- Allow creation, validate later: Rejected - violates clarification, creates broken state
- No validation: Rejected - violates FR-022, FR-023

**Implementation Pattern**:
```typescript
// Check email provider (NextAuth email provider)
// Check Yandex OAuth (NextAuth providers config)
// If either unavailable, throw error before creating user

// Note: Actual implementation depends on NextAuth configuration
// For MVP, we can check if providers are configured in env vars
const emailProviderConfigured = !!process.env.EMAIL_SERVER;
const yandexConfigured = !!process.env.AUTH_YANDEX_ID;

if (!emailProviderConfigured && !yandexConfigured) {
  throw new Error('Сервисы аутентификации недоступны');
}
```

**References**:
- NextAuth providers: https://next-auth.js.org/configuration/providers

---

### 6. Loading and Empty States

**Decision**: Explicit loading spinner/message and empty state message in Russian.

**Rationale**:
- Clarification confirmed: explicit messages for both states
- Better UX than blank screens
- All UI text must be in Russian (project requirement)

**Alternatives Considered**:
- Skeleton loaders: Considered but not required - simple loading message is sufficient for MVP
- No empty state: Rejected - violates FR-021, poor UX

**Implementation Pattern**:
```typescript
// Loading state
if (isLoading) return <div>Загрузка...</div>;

// Empty state
if (!data || data.length === 0) {
  return <div>Пользователи не найдены</div>;
}
```

**References**:
- TanStack Query loading states: https://tanstack.com/query/latest/docs/react/guides/queries

---

## Summary

All research topics resolved. Implementation patterns align with:
- Constitution principles (MVP first, clear separation, API as source of truth)
- Existing tech stack (Next.js, Prisma, TanStack Query, shadcn/ui)
- Project requirements (Russian UI, TypeScript strict mode, Server Components)

No blocking unknowns remain. Ready for Phase 1 (Design & Contracts).

