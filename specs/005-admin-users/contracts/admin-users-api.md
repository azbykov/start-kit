# API Contracts: Admin Users CRUD

**Feature**: 005-admin-users  
**Date**: 2025-01-27  
**Status**: Complete

## Overview

RESTful API contracts for Admin Users CRUD operations. All endpoints require ADMIN role authentication.

**Base Path**: `/api/admin/users`

**Authentication**: NextAuth session with ADMIN role required (FR-003)

**Error Format**: All errors return JSON with `error` field containing Russian message (FR-017)

```typescript
{
  error: string // Russian error message
}
```

---

## Endpoints

### 1. List Users (Paginated)

**Endpoint**: `GET /api/admin/users`

**Description**: Retrieve paginated list of all users in the system (FR-001).

**Query Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number (1-indexed) |
| `pageSize` | number | No | 25 | Records per page (20-50 range) |

**Request Example**:
```
GET /api/admin/users?page=1&pageSize=25
```

**Response** (200 OK):

```typescript
{
  users: Array<{
    id: string;
    name: string | null;
    email: string;
    role: "PLAYER" | "COACH" | "AGENT" | "ADMIN";
    isActive: boolean;
    createdAt: string; // ISO 8601 datetime
    updatedAt: string; // ISO 8601 datetime
  }>;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
```

**Response Example**:
```json
{
  "users": [
    {
      "id": "clx123...",
      "name": "Иван Иванов",
      "email": "ivan@example.com",
      "role": "PLAYER",
      "isActive": true,
      "createdAt": "2025-01-20T10:00:00Z",
      "updatedAt": "2025-01-20T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 25,
    "total": 100,
    "totalPages": 4
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Authenticated but not ADMIN role
- `500 Internal Server Error`: Server error

**Performance**: Must return first page within 2 seconds (SC-001)

---

### 2. Get Single User

**Endpoint**: `GET /api/admin/users/[id]`

**Description**: Retrieve single user by ID.

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | User ID (CUID) |

**Request Example**:
```
GET /api/admin/users/clx123...
```

**Response** (200 OK):

```typescript
{
  id: string;
  name: string | null;
  email: string;
  role: "PLAYER" | "COACH" | "AGENT" | "ADMIN";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

**Error Responses**:
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not ADMIN role
- `404 Not Found`: User not found
- `500 Internal Server Error`: Server error

---

### 3. Create User

**Endpoint**: `POST /api/admin/users`

**Description**: Create new user (FR-004). Validates email format and uniqueness, checks external auth services availability.

**Request Body**:

```typescript
{
  email: string;        // Required, valid email format, unique
  name?: string;        // Optional
  role: "PLAYER" | "COACH" | "AGENT" | "ADMIN"; // Required
  isActive?: boolean;   // Optional, defaults to true
}
```

**Request Example**:
```json
{
  "email": "newuser@example.com",
  "name": "Новый Пользователь",
  "role": "COACH",
  "isActive": true
}
```

**Response** (201 Created):

```typescript
{
  id: string;
  name: string | null;
  email: string;
  role: "PLAYER" | "COACH" | "AGENT" | "ADMIN";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

**Error Responses**:
- `400 Bad Request`: Validation error
  ```json
  {
    "error": "Некорректный формат email"
  }
  ```
- `409 Conflict`: Duplicate email (FR-006)
  ```json
  {
    "error": "Пользователь с таким email уже существует"
  }
  ```
- `503 Service Unavailable`: External auth services unavailable (FR-023)
  ```json
  {
    "error": "Сервисы аутентификации недоступны"
  }
  ```
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not ADMIN role
- `500 Internal Server Error`: Server error

**Validation Rules**:
- Email: Must be valid format (FR-005)
- Email: Must be unique (FR-006)
- Role: Must be valid enum value (FR-012)
- External auth: Must be available (FR-022, FR-023)

**Performance**: Must complete in under 1 minute (SC-002)

---

### 4. Update User

**Endpoint**: `PATCH /api/admin/users/[id]`

**Description**: Update user data (FR-007). Email cannot be updated (FR-008). Uses last-write-wins strategy (FR-019).

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | User ID (CUID) |

**Request Body**:

```typescript
{
  name?: string;        // Optional
  role?: "PLAYER" | "COACH" | "AGENT" | "ADMIN"; // Optional
  isActive?: boolean;  // Optional
  // email is NOT allowed (immutable)
}
```

**Request Example**:
```json
{
  "name": "Обновленное Имя",
  "role": "AGENT",
  "isActive": false
}
```

**Response** (200 OK):

```typescript
{
  id: string;
  name: string | null;
  email: string;
  role: "PLAYER" | "COACH" | "AGENT" | "ADMIN";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

**Error Responses**:
- `400 Bad Request`: Validation error (e.g., invalid role)
  ```json
  {
    "error": "Некорректное значение роли"
  }
  ```
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not ADMIN role
- `404 Not Found`: User not found
- `500 Internal Server Error`: Server error

**Concurrency**: Last-write-wins (FR-019) - no version checking, last save wins

**Performance**: Changes must reflect in list within 1 second (SC-003)

---

### 5. Delete User

**Endpoint**: `DELETE /api/admin/users/[id]`

**Description**: Delete user from system (FR-009). Requires confirmation on frontend (FR-015). Prevents self-deletion (FR-016).

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | User ID (CUID) |

**Request Example**:
```
DELETE /api/admin/users/clx123...
```

**Response** (200 OK):

```typescript
{
  success: true;
  message: string; // "Пользователь успешно удален"
}
```

**Error Responses**:
- `400 Bad Request`: Attempting to delete self (FR-016)
  ```json
  {
    "error": "Нельзя удалить самого себя"
  }
  ```
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not ADMIN role
- `404 Not Found`: User not found
- `500 Internal Server Error`: Server error

**Cascading**: Deletes related `accounts` and `sessions` (Prisma `onDelete: Cascade`)

**Note**: No special handling for last admin deletion (per clarification)

---

## Authentication & Authorization

**All endpoints require**:
1. Valid NextAuth session (cookie-based)
2. User must have `ADMIN` role

**Implementation**:
```typescript
// In each API route handler
const session = await auth();
if (!session) {
  return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
}

const hasAccess = await verifyUserRole(Role.ADMIN);
if (!hasAccess) {
  return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
}
```

---

## Error Handling

**Standard Error Format** (FR-017):
```typescript
{
  error: string; // Russian error message
}
```

**Error Categories**:
- **400 Bad Request**: Validation errors, invalid input
- **401 Unauthorized**: Not authenticated
- **403 Forbidden**: Authenticated but insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Duplicate email, constraint violation
- **503 Service Unavailable**: External services unavailable
- **500 Internal Server Error**: Unexpected server error

**Error Messages** (all in Russian):
- "Не авторизован" (401)
- "Доступ запрещен" (403)
- "Пользователь не найден" (404)
- "Пользователь с таким email уже существует" (409)
- "Некорректный формат email" (400)
- "Сервисы аутентификации недоступны" (503)
- "Внутренняя ошибка сервера" (500)

---

## Audit Logging

**Requirement**: FR-018 - Log all user management actions

**Actions to Log**:
- `POST /api/admin/users` → Log user creation
- `PATCH /api/admin/users/[id]` → Log user update (with before/after values)
- `DELETE /api/admin/users/[id]` → Log user deletion

**Log Format** (to be implemented):
```typescript
logger.info({
  action: 'user.created' | 'user.updated' | 'user.deleted',
  userId: string,
  adminId: string,
  data: object
}, 'User management action');
```

---

## Summary

API contracts defined for all CRUD operations:
- ✅ List users (paginated)
- ✅ Get single user
- ✅ Create user (with validation)
- ✅ Update user (immutable email)
- ✅ Delete user (with self-deletion prevention)

All endpoints require ADMIN role. Error messages in Russian. Performance targets defined. Ready for implementation.

