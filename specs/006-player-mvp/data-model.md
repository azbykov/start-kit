# Data Model: Player Entity with Admin CRUD and Public Profile Page (MVP)

**Date**: 2025-01-27  
**Feature**: 006-player-mvp  
**Status**: Complete

## Overview

This document defines the database schema for the Player entity with admin CRUD operations and public profile pages. The Player model includes profile information, basic statistics (stored as aggregates), and video highlight links.

## Entities

### Player

Represents a player in the system with profile information, statistics, and video links.

**Fields**:

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `id` | String (CUID) | Yes | Primary Key | Unique identifier |
| `firstName` | String | Yes | Min length: 1, Max length: 100 | Player's first name |
| `lastName` | String | Yes | Min length: 1, Max length: 100 | Player's last name |
| `position` | Position (enum) | Yes | Must be one of: GOALKEEPER, DEFENDER, MIDFIELDER, FORWARD | Player's position on the field |
| `dateOfBirth` | DateTime | Yes | Must be valid date, cannot be in future | Player's date of birth |
| `teamId` | String? | No | Optional, foreign key to Team | Reference to player's team/club (optional for MVP) |
| `totalMatches` | Int | Yes | Default: 0, Min: 0, Max: 1000 | Total number of matches played |
| `totalGoals` | Int | Yes | Default: 0, Min: 0, Max: 500 | Total number of goals scored |
| `totalAssists` | Int | Yes | Default: 0, Min: 0, Max: 500 | Total number of assists |
| `totalMinutes` | Int | Yes | Default: 0, Min: 0, Max: 100000 | Total minutes played |
| `videoLinks` | String[] (JSON) | Yes | Default: [], Max length: 15-20, Each URL validated | Array of video highlight URLs |
| `createdAt` | DateTime | Yes | Auto-set | Player creation timestamp |
| `updatedAt` | DateTime | Yes | Auto-updated | Last update timestamp |

**Relationships**:
- `team`: Optional many-to-one relation with `Team` entity (via `teamId` - future relation)
- Future: `matchStats`: One-to-many with `PlayerMatchStats` (future feature)

**Validation Rules** (from requirements):
- **FR-001**: firstName, lastName, position, dateOfBirth are required
- **FR-025**: Position must be from predefined enum values
- **FR-003**: dateOfBirth must be valid date and not in future
- **FR-026**: Statistics values must be non-negative and within maximum limits
- **FR-027**: Statistics fields initialize to zero (0) on creation
- **FR-016**: videoLinks must contain valid URLs
- **FR-029**: videoLinks array has maximum length limit (10-20)

**State Transitions**:
- **Creation**: All fields set (required fields validated, statistics default to 0, videoLinks default to [])
- **Update**: Any field can be updated (except id), validation applied
- **Deletion**: Player removed from system (cascade behavior depends on future relations)

**Indexes**:
- Primary key on `id`
- Index on `teamId` (for future team queries)
- Index on `position` (for filtering/sorting)
- Composite index on `(firstName, lastName)` for search (future)

---

### Position (Enum)

Represents player positions on the field.

**Values**:

- `GOALKEEPER` - Вратарь
- `DEFENDER` - Защитник
- `MIDFIELDER` - Полузащитник
- `FORWARD` - Нападающий

**Display Names** (Russian):
- GOALKEEPER → "Вратарь"
- DEFENDER → "Защитник"
- MIDFIELDER → "Полузащитник"
- FORWARD → "Нападающий"

**Note**: Enum values in code are English (UPPER_SNAKE_CASE), display names are Russian for UI.

---

## Prisma Schema Definition

```prisma
enum Position {
  GOALKEEPER
  DEFENDER
  MIDFIELDER
  FORWARD
}

model Player {
  id           String    @id @default(cuid())
  firstName    String    @db.VarChar(100)
  lastName     String    @db.VarChar(100)
  position     Position
  dateOfBirth  DateTime
  teamId       String?   // Optional for MVP, will be foreign key to Team in future
  totalMatches Int       @default(0)
  totalGoals   Int       @default(0)
  totalAssists Int       @default(0)
  totalMinutes Int       @default(0)
  videoLinks   String[]  @default([]) // Array of URLs, max length enforced in application
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  // Future relations
  // team        Team?      @relation(fields: [teamId], references: [id])
  // matchStats  PlayerMatchStats[]

  @@index([teamId])
  @@index([position])
  @@index([firstName, lastName])
  @@map("players")
}
```

---

## Data Type Decisions

### Video Links Storage

**Decision**: Store as `String[]` array in Prisma (PostgreSQL array type)

**Rationale**:
- Simple MVP approach (no separate VideoLink entity)
- PostgreSQL natively supports array types
- Efficient storage and querying
- Can migrate to separate entity later if metadata needed

**Limitations**:
- Maximum array length enforced in application code (not database constraint)
- URL validation in application layer (Zod schema)

---

### Statistics as Aggregates

**Decision**: Store statistics as integer fields in Player model

**Rationale**:
- MVP approach - simple and fast
- No need to query/match PlayerMatchStats for basic display
- Can be recalculated from PlayerMatchStats later if needed
- Aligns with FR-023: "stored as aggregate fields in player entity"

**Future Migration Path**:
- When PlayerMatchStats is implemented, statistics can be computed from match data
- Migration script can backfill aggregates from match stats
- Display logic can switch to computed values

---

## Validation Constraints

### Application-Level Validation (Zod Schema)

```typescript
const playerSchema = z.object({
  firstName: z.string().min(1, "Имя обязательно").max(100, "Имя слишком длинное"),
  lastName: z.string().min(1, "Фамилия обязательна").max(100, "Фамилия слишком длинная"),
  position: z.nativeEnum(Position, { errorMap: () => ({ message: "Неверная позиция" }) }),
  dateOfBirth: z.date()
    .max(new Date(), "Дата рождения не может быть в будущем")
    .refine(date => {
      const age = new Date().getFullYear() - date.getFullYear();
      return age >= 5 && age <= 50; // Reasonable age range for youth football
    }, "Неверный возраст игрока"),
  teamId: z.string().optional(),
  totalMatches: z.number().int().min(0).max(1000),
  totalGoals: z.number().int().min(0).max(500),
  totalAssists: z.number().int().min(0).max(500),
  totalMinutes: z.number().int().min(0).max(100000),
  videoLinks: z.array(z.string().url("Неверный URL"))
    .max(15, "Максимум 15 видео-ссылок")
});
```

### Database-Level Constraints

- Primary key: `id` (unique, not null)
- Foreign key: `teamId` references `Team.id` (optional, null allowed)
- Not null: All fields except `teamId`
- Default values: Statistics default to 0, videoLinks default to []

---

## Migration Notes

### Schema Changes Required

1. Add `Position` enum to Prisma schema
2. Add `Player` model to Prisma schema
3. Create indexes on `teamId`, `position`, and `(firstName, lastName)`

### Migration Command

```bash
# Apply schema changes (development - db push)
npm run db:push

# After schema stabilization, use migrations for production
# npx prisma migrate dev --name add_player_entity
```

### Data Migration

- No data migration required (new entity)
- Seed data can be added via Prisma seed script

---

## Notes

- Team relation is optional for MVP - `teamId` can be stored as string or null until Team entity is implemented
- Video links validation happens at application level (Zod) and API level
- Statistics aggregates are manually maintained by admins - no automatic calculation from matches yet
- Future enhancements: PlayerMatchStats relation, computed statistics, VideoLink entity with metadata

