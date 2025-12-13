# API Contracts: Player Entity with Admin CRUD and Public Profile

**Feature**: 006-player-mvp  
**Date**: 2025-01-27  
**Status**: Complete

## Overview

RESTful API contracts for Player entity operations. Two API groups:
1. **Public API** (`/api/players`) - No authentication required for read operations (list players, get player profile)
2. **Admin API** (`/api/admin/players`) - Requires ADMIN role for write operations (create, update, delete players)

**Authentication**: 
- Admin endpoints: NextAuth session with ADMIN role required (FR-004)
- Public endpoints: No authentication required (FR-009)

**Error Format**: All errors return JSON with `error` field containing Russian message (FR-021)

```typescript
{
  error: string // Russian error message
}
```

---

## Public API Endpoints

**Base Path**: `/api/players`

### 1. List Players (Paginated)

**Endpoint**: `GET /api/players`

**Description**: Retrieve paginated list of all players in the system (public access, no authentication required).

**Query Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number (1-indexed) |
| `pageSize` | number | No | 25 | Records per page (20-50 range) |

**Request Example**:
```
GET /api/players?page=1&pageSize=25
```

**Response** (200 OK):

```typescript
{
  players: Array<{
    id: string;
    firstName: string;
    lastName: string;
    position: "GOALKEEPER" | "DEFENDER" | "MIDFIELDER" | "FORWARD";
    dateOfBirth: string; // ISO 8601 date
    teamId: string | null;
    totalMatches: number;
    totalGoals: number;
    totalAssists: number;
    totalMinutes: number;
    videoLinks: string[];
    // Note: createdAt and updatedAt may be omitted from public list
  }>;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
```

**Authentication**: Not required (public access)

**Error Responses**:
- `500 Internal Server Error`: Server error

**Performance**: Must return first page within 2 seconds (SC-002)

---

### 2. Get Public Player Profile

**Endpoint**: `GET /api/players/[id]`

**Description**: Retrieve public player profile (FR-009, FR-010, FR-011, FR-012, FR-013).

**Path Parameters**:
- `id`: string (required) - Player CUID

**Authentication**: Not required (FR-009)

**Response** (200 OK):

```typescript
{
  id: string;
  firstName: string;
  lastName: string;
  position: string; // Display name in Russian
  dateOfBirth: string; // ISO 8601 date
  teamId: string | null;
  statistics: {
    totalMatches: number;
    totalGoals: number;
    totalAssists: number;
    totalMinutes: number;
  };
  videoLinks: string[];
}
```

**Response Example**:
```json
{
  "id": "clx123...",
  "firstName": "Иван",
  "lastName": "Петров",
  "position": "Нападающий",
  "dateOfBirth": "2010-05-15",
  "teamId": null,
  "statistics": {
    "totalMatches": 25,
    "totalGoals": 12,
    "totalAssists": 5,
    "totalMinutes": 1850
  },
  "videoLinks": [
    "https://youtube.com/watch?v=example1",
    "https://youtube.com/watch?v=example2"
  ]
}
```

**Error Responses**:
- `404 Not Found`: Player not found (FR-020)
- `500 Internal Server Error`: Server error

**Performance**: Must load within 3 seconds (SC-004)

---

## Admin API Endpoints

**Base Path**: `/api/admin/players`

### 1. Create Player

**Endpoint**: `POST /api/admin/players`

**Description**: Create a new player (FR-001).

**Request Body**:

```typescript
{
  firstName: string; // Required, min 1, max 100 chars
  lastName: string; // Required, min 1, max 100 chars
  position: "GOALKEEPER" | "DEFENDER" | "MIDFIELDER" | "FORWARD"; // Required
  dateOfBirth: string; // Required, ISO 8601 date, cannot be in future
  teamId?: string | null; // Optional
  totalMatches?: number; // Optional, default 0, min 0, max 1000
  totalGoals?: number; // Optional, default 0, min 0, max 500
  totalAssists?: number; // Optional, default 0, min 0, max 500
  totalMinutes?: number; // Optional, default 0, min 0, max 100000
  videoLinks?: string[]; // Optional, default [], max 15, each must be valid URL
}
```

**Request Example**:
```json
{
  "firstName": "Иван",
  "lastName": "Петров",
  "position": "FORWARD",
  "dateOfBirth": "2010-05-15",
  "teamId": null,
  "totalMatches": 0,
  "totalGoals": 0,
  "totalAssists": 0,
  "totalMinutes": 0,
  "videoLinks": []
}
```

**Response** (201 Created):

```typescript
{
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  dateOfBirth: string;
  teamId: string | null;
  totalMatches: number;
  totalGoals: number;
  totalAssists: number;
  totalMinutes: number;
  videoLinks: string[];
  createdAt: string;
  updatedAt: string;
}
```

**Error Responses**:
- `400 Bad Request`: Validation error (e.g., "Некорректная дата рождения", "Неверная позиция")
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Authenticated but not ADMIN role
- `500 Internal Server Error`: Server error

**Validation Rules**:
- FR-001: firstName, lastName, position, dateOfBirth required
- FR-025: position must be valid enum value
- FR-003: dateOfBirth must be valid date, not in future
- FR-026: Statistics values must be within valid ranges
- FR-016: videoLinks must contain valid URLs
- FR-029: videoLinks array length must not exceed maximum

**Performance**: Must complete in under 2 minutes (SC-001)

---

### 4. Update Player

**Endpoint**: `PATCH /api/admin/players/[id]`

**Description**: Update an existing player (FR-017, FR-018).

**Path Parameters**:
- `id`: string (required) - Player CUID

**Request Body** (all fields optional, only include fields to update):

```typescript
{
  firstName?: string;
  lastName?: string;
  position?: "GOALKEEPER" | "DEFENDER" | "MIDFIELDER" | "FORWARD";
  dateOfBirth?: string; // ISO 8601 date
  teamId?: string | null;
  totalMatches?: number;
  totalGoals?: number;
  totalAssists?: number;
  totalMinutes?: number;
  videoLinks?: string[];
}
```

**Request Example**:
```json
{
  "totalGoals": 12,
  "totalAssists": 5,
  "videoLinks": ["https://youtube.com/watch?v=example1"]
}
```

**Response** (200 OK):

```typescript
{
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  dateOfBirth: string;
  teamId: string | null;
  totalMatches: number;
  totalGoals: number;
  totalAssists: number;
  totalMinutes: number;
  videoLinks: string[];
  createdAt: string;
  updatedAt: string;
}
```

**Error Responses**:
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Authenticated but not ADMIN role
- `404 Not Found`: Player not found
- `500 Internal Server Error`: Server error

**Concurrency**: Uses Last-Write-Wins strategy (FR-028) - no conflict detection

**Performance**: Changes must reflect within 1 second (SC-003)

---

### 5. Delete Player

**Endpoint**: `DELETE /api/admin/players/[id]`

**Description**: Delete a player from the system (FR-019).

**Path Parameters**:
- `id`: string (required) - Player CUID

**Response** (200 OK):

```typescript
{
  success: true;
  message: string; // "Игрок удалён"
}
```

**Error Responses**:
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Authenticated but not ADMIN role
- `404 Not Found`: Player not found
- `500 Internal Server Error`: Server error

**Note**: Hard delete - player is permanently removed. Future relations (PlayerMatchStats) will need cascade handling.

---

## Public API Endpoints

**Base Path**: `/api/players`

### 1. Get Public Player Profile

**Endpoint**: `GET /api/players/[id]`

**Description**: Retrieve public player profile (FR-009, FR-010, FR-011, FR-012, FR-013).

**Path Parameters**:
- `id`: string (required) - Player CUID

**Authentication**: Not required (FR-009)

**Response** (200 OK):

```typescript
{
  id: string;
  firstName: string;
  lastName: string;
  position: string; // Display name in Russian
  dateOfBirth: string; // ISO 8601 date
  teamId: string | null;
  statistics: {
    totalMatches: number;
    totalGoals: number;
    totalAssists: number;
    totalMinutes: number;
  };
  videoLinks: string[];
  // Note: createdAt and updatedAt may be omitted from public profile
}
```

**Response Example**:
```json
{
  "id": "clx123...",
  "firstName": "Иван",
  "lastName": "Петров",
  "position": "Нападающий",
  "dateOfBirth": "2010-05-15",
  "teamId": null,
  "statistics": {
    "totalMatches": 25,
    "totalGoals": 12,
    "totalAssists": 5,
    "totalMinutes": 1850
  },
  "videoLinks": [
    "https://youtube.com/watch?v=example1",
    "https://youtube.com/watch?v=example2"
  ]
}
```

**Error Responses**:
- `404 Not Found`: Player not found (FR-020)
- `500 Internal Server Error`: Server error

**Performance**: Must load within 3 seconds (SC-004)

---

## Common Response Types

### Error Response

All error responses follow this format:

```typescript
{
  error: string; // Russian error message
}
```

**Example**:
```json
{
  "error": "Игрок не найден"
}
```

### Validation Error Response

When validation fails (400 Bad Request):

```typescript
{
  error: string; // General error message
  details?: Array<{
    field: string;
    message: string;
  }>; // Optional field-specific errors
}
```

**Example**:
```json
{
  "error": "Ошибка валидации",
  "details": [
    {
      "field": "dateOfBirth",
      "message": "Дата рождения не может быть в будущем"
    },
    {
      "field": "totalGoals",
      "message": "Количество голов не может быть отрицательным"
    }
  ]
}
```

---

## Type Definitions

### Player Position Enum

```typescript
enum Position {
  GOALKEEPER = "GOALKEEPER",    // Вратарь
  DEFENDER = "DEFENDER",        // Защитник
  MIDFIELDER = "MIDFIELDER",    // Полузащитник
  FORWARD = "FORWARD"           // Нападающий
}
```

### Player Statistics

```typescript
interface PlayerStatistics {
  totalMatches: number;  // Min: 0, Max: 1000
  totalGoals: number;    // Min: 0, Max: 500
  totalAssists: number;  // Min: 0, Max: 500
  totalMinutes: number;  // Min: 0, Max: 100000
}
```

---

## Notes

- All date fields use ISO 8601 format (YYYY-MM-DD for dates, full datetime for timestamps)
- Position enum values in API are English, but display names in UI are Russian
- Video links array has maximum length (15-20) enforced at API level
- Statistics validation happens at both client (Zod) and server (API route) levels
- Public API does not expose internal timestamps (createdAt, updatedAt) unless needed

