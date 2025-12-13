# Data Model: Admin Users CRUD

**Feature**: 005-admin-users  
**Date**: 2025-01-27  
**Status**: Complete

## Overview

Data model for Admin Users CRUD feature. Based on existing Prisma schema with User model. No schema changes required - feature uses existing User entity.

## Entities

### User

**Source**: Prisma schema (`prisma/schema.prisma`)

**Description**: Represents a system user with authentication and role information.

**Fields**:

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `id` | String (CUID) | Yes | Primary Key | Unique identifier |
| `name` | String? | No | Optional | User's display name |
| `email` | String | Yes | Unique | User's email address (used for authentication) |
| `emailVerified` | DateTime? | No | Optional | Timestamp when email was verified |
| `password` | String? | No | Optional (Bcrypt) | Hashed password (not used for email/Yandex auth) |
| `role` | Role (enum) | Yes | Default: PLAYER | User role: PLAYER, COACH, AGENT, ADMIN |
| `isActive` | Boolean | Yes | Default: true | Whether user account is active |
| `createdAt` | DateTime | Yes | Auto-set | Account creation timestamp |
| `updatedAt` | DateTime | Yes | Auto-updated | Last update timestamp |

**Relationships**:
- `accounts`: One-to-many with `Account` (OAuth accounts: email, Yandex)
- `sessions`: One-to-many with `Session` (active sessions)

**Validation Rules** (from requirements):
- **FR-005**: Email format must be valid (validated via Zod on client, Prisma on server)
- **FR-006**: Email must be unique (enforced by Prisma `@unique` constraint)
- **FR-008**: Email is immutable (cannot be edited after creation)
- **FR-012**: Role must be one of: PLAYER, COACH, AGENT, ADMIN (enforced by Prisma enum)

**State Transitions**:
- **isActive**: `true` → `false` (deactivation via FR-010)
  - Effect: User cannot log in (FR-011)
  - Reversible: Can be reactivated by setting `isActive = true`
- **role**: Can be changed to any valid Role enum value (FR-007)
  - Effect: Changes user permissions immediately (SC-005)

**Indexes** (from Prisma schema):
- Primary key: `id`
- Unique: `email`

**Constraints**:
- Email uniqueness enforced at database level
- Role enum values enforced at database level
- `isActive` defaults to `true` for new users

---

### Role (Enum)

**Source**: Prisma schema (`prisma/schema.prisma`)

**Description**: User role enumeration defining access levels.

**Values**:
- `PLAYER`: Default role for regular users
- `COACH`: Coach role with team management permissions
- `AGENT`: Agent role with extended search permissions
- `ADMIN`: Administrator role with full system access (required for user management)

**Usage in Feature**:
- **FR-003**: Only ADMIN role can access user management interface
- **FR-012**: Role selection dropdown shows all enum values
- **FR-004**: Role is required when creating new user
- **FR-007**: Role can be edited by admin

---

## Data Operations

### Create User

**Input** (from FR-004):
- `email`: String (required, unique, valid format)
- `name`: String? (optional)
- `role`: Role enum (required)
- `isActive`: Boolean (default: true)

**Process**:
1. Validate email format (FR-005)
2. Check email uniqueness (FR-006)
3. Verify external auth services available (FR-022)
4. Create user record in database
5. Log action for audit (FR-018)

**Output**: Created User entity with generated `id`, `createdAt`, `updatedAt`

**Error Cases**:
- Duplicate email → Error message (FR-006)
- Invalid email format → Validation error (FR-005)
- External auth services unavailable → Block creation with error (FR-023)

---

### Update User

**Input** (from FR-007):
- `id`: String (required, identifies user)
- `name`: String? (optional, can be updated)
- `role`: Role enum (optional, can be updated)
- `isActive`: Boolean (optional, can be updated)
- `email`: NOT updatable (FR-008)

**Process**:
1. Find user by `id`
2. Update allowed fields (`name`, `role`, `isActive`)
3. Prisma auto-updates `updatedAt` timestamp
4. Log action for audit (FR-018)

**Output**: Updated User entity

**Concurrency** (FR-019):
- Last-write-wins strategy
- No optimistic locking
- Last save overwrites previous changes

**Error Cases**:
- User not found → 404 error
- Invalid role value → Validation error

---

### Delete User

**Input** (from FR-009):
- `id`: String (required, identifies user)

**Process**:
1. Find user by `id`
2. Check if user is current admin (FR-016) - prevent self-deletion
3. Delete user record (cascades to `accounts` and `sessions` via Prisma `onDelete: Cascade`)
4. Log action for audit (FR-018)

**Output**: Success confirmation

**Error Cases**:
- User not found → 404 error
- Attempting to delete self → Warning or error (FR-016)

**Note**: No special handling for last admin deletion (per clarification: no restrictions)

---

### List Users (Paginated)

**Input** (from FR-001):
- `page`: Number (default: 1)
- `pageSize`: Number (default: 25, range: 20-50)

**Process**:
1. Calculate `skip = (page - 1) * pageSize`
2. Query users with `skip` and `take: pageSize`
3. Count total users for pagination metadata
4. Order by `createdAt DESC` (newest first)

**Output**:
- `users`: Array of User entities
- `total`: Total count of users
- `page`: Current page number
- `pageSize`: Records per page
- `totalPages`: Calculated from total and pageSize

**Fields Displayed** (FR-002):
- `name` (if provided)
- `email`
- `role`
- `isActive`
- `createdAt` (as "creation date")

---

## Data Validation

### Email Validation

**Client-side**: Zod schema with `.email()` validator
**Server-side**: Prisma unique constraint + format check

**Rules**:
- Must match email regex pattern
- Must be unique across all users
- Cannot be changed after creation (immutable)

### Role Validation

**Client-side**: Enum validation (Zod `z.nativeEnum(Role)`)
**Server-side**: Prisma enum constraint

**Rules**:
- Must be one of: PLAYER, COACH, AGENT, ADMIN
- Cannot be null or undefined

### Name Validation

**Client-side**: Optional string, max length TBD (reasonable limit like 100 chars)
**Server-side**: Optional, no special constraints

---

## Audit Logging

**Requirement**: FR-018 - Log all user management actions

**Actions to Log**:
- User created (with created user data)
- User updated (with before/after values)
- User deleted (with deleted user data)

**Log Format** (to be defined in implementation):
```typescript
{
  action: 'user.created' | 'user.updated' | 'user.deleted',
  userId: string, // ID of user being acted upon
  adminId: string, // ID of admin performing action
  timestamp: DateTime,
  data: { /* relevant data */ }
}
```

**Storage**: To be determined (could be separate AuditLog table or use existing logger)

---

## Schema Changes

**Status**: ✅ No schema changes required

**Rationale**: Existing User model in Prisma schema already contains all required fields:
- `id`, `name`, `email`, `role`, `isActive`, `createdAt`, `updatedAt`
- All relationships (accounts, sessions) already defined
- All constraints (unique email, role enum) already enforced

**Future Considerations** (out of scope for MVP):
- Audit log table for structured audit trail
- Soft delete (deletedAt field) instead of hard delete
- User activity tracking fields

---

## Summary

Data model is complete and ready for implementation. All required fields exist in Prisma schema. No migrations needed. Implementation can proceed with existing User model.

