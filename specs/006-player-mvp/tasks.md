# Tasks: Player Entity with Admin CRUD and Public Profile Page (MVP)

**Input**: Design documents from `/specs/006-player-mvp/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL - not explicitly requested in specification, so test tasks are not included. Focus on implementation tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., [US1], [US2], [US3], [US4], [US5])
- Include exact file paths in descriptions

## Path Conventions

- **Web app (Next.js)**: `app/`, `components/`, `lib/` at repository root
- All paths are relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project structure verification and preparation

- [x] T001 Verify existing project structure matches plan.md requirements
- [x] T002 [P] Verify Prisma schema setup exists and is ready for Player model addition
- [x] T003 [P] Verify NextAuth configuration with ADMIN role support exists
- [x] T004 [P] Verify TanStack Query and TanStack Table dependencies are installed
- [x] T005 [P] Verify shadcn/ui components are available (Button, Dialog, Form, Table components)

**Checkpoint**: Project structure verified - ready for foundational tasks

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Add `Position` enum to Prisma schema in `prisma/schema.prisma` (GOALKEEPER, DEFENDER, MIDFIELDER, FORWARD)
- [x] T007 Add `Player` model to Prisma schema in `prisma/schema.prisma` with all required fields (id, firstName, lastName, position, dateOfBirth, teamId, totalMatches, totalGoals, totalAssists, totalMinutes, videoLinks, createdAt, updatedAt)
- [x] T008 Add indexes to Player model in `prisma/schema.prisma` (teamId, position, firstName+lastName composite)
- [x] T009 Set default values in Player model in `prisma/schema.prisma` (statistics default to 0, videoLinks default to [])
- [x] T010 Run `npm run db:push` to apply Player model schema changes
- [x] T011 Run `npm run db:generate` to regenerate Prisma Client with Player model
- [x] T012 [P] Create Zod validation schema in `lib/validations/player.ts` (firstName, lastName, position enum, dateOfBirth, statistics ranges, videoLinks URL validation)
- [x] T013 [P] Create API client functions for public operations in `lib/api/players.ts` (getPlayersList, getPlayerProfile)
- [x] T014 [P] Create API client functions for admin operations in `lib/api/admin/players.ts` (createPlayer, updatePlayer, deletePlayer)
- [x] T015 [P] Create TanStack Query hooks for public operations in `lib/hooks/use-players.ts` (usePlayersList, usePlayerProfile)
- [x] T016 [P] Create TanStack Query hooks for admin operations in `lib/hooks/use-admin-players.ts` (useCreatePlayer, useUpdatePlayer, useDeletePlayer mutations)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Admin Creates New Player (Priority: P1) 🎯 MVP

**Goal**: Administrator can create new players with required fields (firstName, lastName, position, dateOfBirth) and optional fields (teamId, statistics, videoLinks). System validates all inputs and player appears in list after creation.

**Independent Test**: Admin can open public players list page, see "Создать игрока" button (if admin), open form, fill required fields, submit, and see new player in the list. Testable independently - creates player that appears in US2 list.

### Implementation for User Story 1

- [x] T017 [US1] Implement POST /api/admin/players endpoint in `app/api/admin/players/route.ts` (create player, ADMIN role check)
- [x] T018 [US1] Add firstName, lastName validation in `app/api/admin/players/route.ts` (required, min 1, max 100 chars)
- [x] T019 [US1] Add position enum validation in `app/api/admin/players/route.ts` (must be valid Position enum value, FR-025)
- [x] T020 [US1] Add dateOfBirth validation in `app/api/admin/players/route.ts` (valid date, not in future, FR-003)
- [x] T021 [US1] Add statistics initialization to zero in `app/api/admin/players/route.ts` (default values, FR-027)
- [x] T022 [US1] Add error handling with Russian messages in `app/api/admin/players/route.ts` (FR-021)
- [x] T023 [US1] Add API client function `createPlayer(data)` in `lib/api/admin/players.ts`
- [x] T024 [US1] Add TanStack Query mutation hook `useCreatePlayer()` in `lib/hooks/use-admin-players.ts` with optimistic updates
- [x] T025 [US1] Create PlayerForm component in `components/players/player-form.tsx` (form with firstName, lastName, position dropdown, dateOfBirth, optional fields)
- [x] T026 [US1] Add Zod validation to PlayerForm in `components/players/player-form.tsx` (client-side validation using lib/validations/player.ts)
- [x] T027 [US1] Add position dropdown with enum values to PlayerForm in `components/players/player-form.tsx` (GOALKEEPER, DEFENDER, MIDFIELDER, FORWARD with Russian labels)
- [x] T028 [US1] Integrate PlayerForm with create mutation hook in `components/players/player-form.tsx`
- [x] T029 [US1] Add error handling and Russian error messages in PlayerForm in `components/players/player-form.tsx` (FR-021)
- [x] T030 [US1] Add success feedback and list refresh after creation in PlayerForm in `components/players/player-form.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Admin can create new players that appear in the list.

---

## Phase 4: User Story 2 - View Public Players List (Priority: P1) 🎯 MVP

**Goal**: Anyone can view public paginated list of players. Administrators see additional actions (create, edit, delete buttons) conditionally based on ADMIN role. List shows player information with pagination.

**Independent Test**: User (authenticated or not) can open `/players` page, see table with players (or loading/empty state), navigate pagination. Admin sees additional "Создать игрока" button and edit/delete actions. Testable independently - displays data from database.

### Implementation for User Story 2

- [x] T031 [US2] Implement GET /api/players endpoint in `app/api/players/route.ts` (public list with pagination, no auth required)
- [x] T032 [US2] Implement pagination logic in `app/api/players/route.ts` (page, pageSize params, skip/take calculation)
- [x] T033 [US2] Add API client function `getPlayersList(page, pageSize)` in `lib/api/players.ts`
- [x] T034 [US2] Add TanStack Query hook `usePlayersList(page, pageSize)` in `lib/hooks/use-players.ts` with pagination support
- [x] T035 [US2] Create PlayersTable component in `components/players/players-table.tsx` (TanStack Table with columns: firstName, lastName, position, dateOfBirth, teamId/club)
- [x] T036 [US2] Add pagination controls to PlayersTable component in `components/players/players-table.tsx`
- [x] T037 [US2] Create PlayerActions component in `components/players/player-actions.tsx` (edit, delete buttons - shown conditionally for ADMIN role)
- [x] T038 [US2] Implement conditional rendering of admin actions in PlayerActions in `components/players/player-actions.tsx` (check user session for ADMIN role)
- [x] T039 [US2] Create public players list page in `app/players/page.tsx` (Server Component, no auth required, check session for admin actions)
- [x] T040 [US2] Integrate PlayersTable with TanStack Query hook in `app/players/page.tsx`
- [x] T041 [US2] Add conditional "Создать игрока" button for admins in `app/players/page.tsx` (only shown if user has ADMIN role)
- [x] T042 [US2] Add loading state ("Загрузка...") in PlayersTable in `components/players/players-table.tsx` (FR-007)
- [x] T043 [US2] Add empty state ("Игроки не найдены") in PlayersTable in `components/players/players-table.tsx` (FR-008)
- [x] T044 [US2] Add click handler to navigate to player profile page in PlayersTable in `components/players/players-table.tsx`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Public can view player list, admins can create players and see them in the list.

---

## Phase 5: User Story 3 - View Public Player Profile (Priority: P1) 🎯 MVP

**Goal**: Anyone can view public player profile page at `/players/[id]` without authentication. Page shows player information, basic statistics, placeholder for matches, and video highlights.

**Independent Test**: User (authenticated or not) can open `/players/[player-id]` URL, see player profile with all information, statistics, and video links. Testable independently - displays single player data.

### Implementation for User Story 3

- [x] T045 [US3] Implement GET /api/players/[id] endpoint in `app/api/players/[id]/route.ts` (public player profile, no auth required)
- [x] T046 [US3] Return only public fields in `app/api/players/[id]/route.ts` (exclude internal timestamps if not needed)
- [x] T047 [US3] Handle 404 for non-existent players in `app/api/players/[id]/route.ts` (FR-020)
- [x] T048 [US3] Add API client function `getPlayerProfile(id)` in `lib/api/players.ts`
- [x] T049 [US3] Add TanStack Query hook `usePlayerProfile(id)` in `lib/hooks/use-players.ts`
- [x] T050 [US3] Create PlayerProfile component in `components/players/player-profile.tsx` (main profile display with name, position, date of birth, club)
- [x] T051 [US3] Create PlayerStats component in `components/players/player-stats.tsx` (statistics display: matches, goals, assists, minutes)
- [x] T052 [US3] Create PlayerVideos component in `components/players/player-videos.tsx` (video highlights list with clickable links)
- [x] T053 [US3] Create public player profile page in `app/players/[id]/page.tsx` (Client Component with TanStack Query, no auth required, handle 404)
- [x] T054 [US3] Integrate PlayerProfile, PlayerStats, PlayerVideos components in `app/players/[id]/page.tsx`
- [x] T055 [US3] Add placeholder "Матчи" section in `app/players/[id]/page.tsx` (for future PlayerMatchStats integration, FR-012)
- [x] T056 [US3] Add loading state (indicator) in `app/players/[id]/page.tsx`
- [x] T057 [US3] Add 404 error page handling in `app/players/[id]/page.tsx` (FR-020, show "Игрок не найден" in Russian)

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently. Public can view player list and profiles, admins can create players.

---

## Phase 6: User Story 4 - Admin Edits Player (Priority: P2)

**Goal**: Administrator can edit existing player data (name, position, date of birth, club, statistics, video links) from the public list. Changes appear immediately in list and public profile.

**Independent Test**: Admin can click edit button on player in list, open form with current data, modify fields, save, and see changes reflected in list and profile. Testable independently - updates existing player data.

### Implementation for User Story 4

- [x] T058 [US4] Implement PATCH /api/admin/players/[id] endpoint in `app/api/admin/players/[id]/route.ts` (update player, ADMIN role check)
- [x] T059 [US4] Add validation for all updatable fields in `app/api/admin/players/[id]/route.ts` (reuse validation logic from create)
- [x] T060 [US4] Implement Last-Write-Wins strategy in `app/api/admin/players/[id]/route.ts` (no conflict detection, FR-028)
- [x] T061 [US4] Add error handling with Russian messages in `app/api/admin/players/[id]/route.ts` (FR-021)
- [x] T062 [US4] Add API client function `updatePlayer(id, data)` in `lib/api/admin/players.ts`
- [x] T063 [US4] Add TanStack Query mutation hook `useUpdatePlayer()` in `lib/hooks/use-admin-players.ts` with optimistic updates
- [x] T064 [US4] Extend PlayerForm component in `components/players/player-form.tsx` to support edit mode (pre-fill existing data)
- [x] T065 [US4] Add edit button handler in PlayerActions in `components/players/player-actions.tsx` (opens PlayerForm in edit mode)
- [x] T066 [US4] Integrate PlayerForm with update mutation hook in `components/players/player-form.tsx` (edit mode)
- [x] T067 [US4] Add statistics fields editing in PlayerForm in `components/players/player-form.tsx` (totalMatches, totalGoals, totalAssists, totalMinutes with validation)
- [x] T068 [US4] Add video links management in PlayerForm in `components/players/player-form.tsx` (add/remove video URLs with validation, FR-014, FR-015, FR-029)
- [x] T069 [US4] Add success feedback and list/profile refresh after update in PlayerForm in `components/players/player-form.tsx`
- [x] T070 [US4] Add validation for statistics ranges in PlayerForm in `components/players/player-form.tsx` (min 0, max limits, FR-026)

**Checkpoint**: At this point, User Stories 1-4 should all work independently. Admin can create, view, and edit players. Public can view list and profiles.

---

## Phase 7: User Story 5 - Admin Deletes Player (Priority: P3)

**Goal**: Administrator can delete players from the system. Deletion shows confirmation dialog. After deletion, player disappears from list and profile shows 404.

**Independent Test**: Admin can click delete button on player, see confirmation dialog, confirm deletion, and see player removed from list. Opening deleted player profile shows 404. Testable independently - removes player from system.

### Implementation for User Story 5

- [x] T071 [US5] Implement DELETE /api/admin/players/[id] endpoint in `app/api/admin/players/[id]/route.ts` (delete player, ADMIN role check)
- [x] T072 [US5] Add error handling with Russian messages in `app/api/admin/players/[id]/route.ts` (FR-021)
- [x] T073 [US5] Add API client function `deletePlayer(id)` in `lib/api/admin/players.ts`
- [x] T074 [US5] Add TanStack Query mutation hook `useDeletePlayer()` in `lib/hooks/use-admin-players.ts` with optimistic updates
- [x] T075 [US5] Create DeletePlayerDialog component in `components/players/delete-player-dialog.tsx` (confirmation dialog with player name)
- [x] T076 [US5] Add delete button handler in PlayerActions in `components/players/player-actions.tsx` (opens DeletePlayerDialog)
- [x] T077 [US5] Integrate DeletePlayerDialog with delete mutation hook in `components/players/delete-player-dialog.tsx`
- [x] T078 [US5] Add success feedback and list refresh after deletion in DeletePlayerDialog in `components/players/delete-player-dialog.tsx`
- [x] T079 [US5] Verify 404 handling works for deleted players in `app/players/[id]/page.tsx` (FR-020)

**Checkpoint**: At this point, all User Stories 1-5 should work independently. Complete CRUD functionality available for admins, public can view list and profiles.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T080 [P] Add position enum display name mapping (enum values to Russian labels) in `lib/utils/player.ts`
- [x] T081 [P] Add age calculation helper from dateOfBirth in `lib/utils/player.ts` (if needed for display)
- [x] T082 [P] Add statistics pluralization helper in `lib/utils/player.ts` (матч/матча/матчей for Russian)
- [x] T083 [P] Update navigation/sidebar to include link to `/players` page
- [x] T084 Run quickstart.md validation checklist
- [x] T085 Code cleanup and refactoring (remove console.log, optimize imports)
- [x] T086 Verify all error messages are in Russian (FR-021)
- [x] T087 Verify loading and empty states are explicit (FR-007, FR-008)
- [x] T088 Performance optimization (ensure list loads within 2 seconds, profile within 3 seconds)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Can work with empty list, no dependency on US1
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - Needs at least one player to test, but can be created via US1 or manually
- **User Story 4 (P2)**: Depends on US2 (needs list to edit from) and US3 (updates profile) - Can be tested independently with existing players
- **User Story 5 (P3)**: Depends on US2 (needs list to delete from) - Can be tested independently with existing players

### Within Each User Story

- API endpoints before frontend components
- Validation schemas before forms
- API client functions before hooks
- Hooks before components
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, User Stories 1, 2, 3 (all P1) can start in parallel (if team capacity allows)
- Models and validation schemas can be created in parallel
- API client functions can be created in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 2

```bash
# Launch all foundational pieces for User Story 2 together:
Task: "Implement GET /api/players endpoint in app/api/players/route.ts"
Task: "Add API client function getPlayersList(page, pageSize) in lib/api/players.ts"
Task: "Create PlayersTable component in components/players/players-table.tsx"
Task: "Create PlayerActions component in components/players/player-actions.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1-3 Only - All P1)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Admin Creates Player)
4. Complete Phase 4: User Story 2 (Public Players List)
5. Complete Phase 5: User Story 3 (Public Player Profile)
6. **STOP and VALIDATE**: Test all three stories independently
7. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Can create players
3. Add User Story 2 → Test independently → Can view list → Deploy/Demo (Basic MVP!)
4. Add User Story 3 → Test independently → Can view profiles → Deploy/Demo (Complete MVP!)
5. Add User Story 4 → Test independently → Can edit players
6. Add User Story 5 → Test independently → Can delete players
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Create)
   - Developer B: User Story 2 (List)
   - Developer C: User Story 3 (Profile)
3. Stories 1-3 complete and integrate independently (all P1)
4. Then proceed with User Stories 4-5 sequentially or in parallel

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Public players list page is accessible to everyone, admin actions shown conditionally
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

