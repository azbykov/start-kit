# Tasks: Admin Users CRUD

**Input**: Design documents from `/specs/005-admin-users/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL - not explicitly requested in specification, so test tasks are not included. Focus on implementation tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., [US1], [US2], [US3], [US4])
- Include exact file paths in descriptions

## Path Conventions

- **Web app (Next.js)**: `app/`, `components/`, `lib/` at repository root
- All paths are relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project structure verification and preparation

- [x] T001 Verify existing project structure matches plan.md requirements
- [x] T002 [P] Verify Prisma schema includes User model with all required fields (id, name, email, role, isActive, createdAt, updatedAt)
- [x] T003 [P] Verify NextAuth configuration with ADMIN role support exists
- [x] T004 [P] Verify TanStack Query and TanStack Table dependencies are installed

**Checkpoint**: Project structure verified - ready for foundational tasks

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create API client utility functions in `lib/api/admin/users.ts` (base functions for all API calls)
- [x] T006 Create TanStack Query hooks in `lib/hooks/use-admin-users.ts` (query and mutation hooks)
- [x] T007 Create shared TypeScript types for User entity in `lib/types/admin-users.ts` (derived from API contracts)
- [x] T008 Create validation schema using Zod in `lib/validations/user.ts` (email, role, name validation)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Users List (Priority: P1) 🎯 MVP

**Goal**: Administrator can view paginated list of all users in the system with loading and empty states.

**Independent Test**: Admin can open `/admin/users` page, see table with users (or loading/empty state), and navigate pagination. Testable independently without other stories.

### Implementation for User Story 1

- [x] T009 [US1] Implement GET /api/admin/users endpoint in `app/api/admin/users/route.ts` (list with pagination, auth check)
- [x] T010 [US1] Implement pagination logic in `app/api/admin/users/route.ts` (page, pageSize params, skip/take calculation)
- [x] T011 [US1] Add API client function `getUsers(page, pageSize)` in `lib/api/admin/users.ts`
- [x] T012 [US1] Add TanStack Query hook `useUsers(page, pageSize)` in `lib/hooks/use-admin-users.ts`
- [x] T013 [US1] Create UsersTable component in `components/admin/users/users-table.tsx` (TanStack Table with columns: name, email, role, isActive, createdAt)
- [x] T014 [US1] Add pagination controls to UsersTable component in `components/admin/users/users-table.tsx`
- [x] T015 [US1] Create admin users page in `app/(protected)/admin/users/page.tsx` (Server Component with auth check)
- [x] T016 [US1] Integrate UsersTable with TanStack Query hook in `app/(protected)/admin/users/page.tsx`
- [x] T017 [US1] Add loading state ("Загрузка...") in `components/admin/users/users-table.tsx` (FR-020)
- [x] T018 [US1] Add empty state ("Пользователи не найдены") in `components/admin/users/users-table.tsx` (FR-021)
- [x] T019 [US1] Add authorization check (ADMIN role) in `app/(protected)/admin/users/page.tsx` (FR-003)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Admin can view paginated user list with loading/empty states.

---

## Phase 4: User Story 2 - Create New User (Priority: P1)

**Goal**: Administrator can create new users with email, name, role, and active status. System validates email format/uniqueness and checks external auth services.

**Independent Test**: Admin can open create form, fill required fields (email, role), submit, and see new user in list. Testable independently - creates user that appears in US1 list.

### Implementation for User Story 2

- [x] T020 [US2] Implement POST /api/admin/users endpoint in `app/api/admin/users/route.ts` (create user, auth check)
- [x] T021 [US2] Add email format validation in `app/api/admin/users/route.ts` (FR-005)
- [x] T022 [US2] Add email uniqueness check in `app/api/admin/users/route.ts` (FR-006)
- [x] T023 [US2] Add external auth services availability check in `app/api/admin/users/route.ts` (FR-022, FR-023)
- [x] T024 [US2] Add audit logging for user creation in `app/api/admin/users/route.ts` (FR-018)
- [x] T025 [US2] Add API client function `createUser(data)` in `lib/api/admin/users.ts`
- [x] T026 [US2] Add TanStack Query mutation hook `useCreateUser()` in `lib/hooks/use-admin-users.ts`
- [x] T027 [US2] Create UserForm component in `components/admin/users/user-form.tsx` (form with email, name, role, isActive fields)
- [x] T028 [US2] Add Zod validation to UserForm in `components/admin/users/user-form.tsx` (client-side validation)
- [x] T029 [US2] Add role dropdown (PLAYER/COACH/AGENT/ADMIN) to UserForm in `components/admin/users/user-form.tsx` (FR-012)
- [x] T030 [US2] Add "Создать пользователя" button to users page in `app/(protected)/admin/users/page.tsx`
- [x] T031 [US2] Integrate UserForm with create mutation hook in `components/admin/users/user-form.tsx`
- [x] T032 [US2] Add error handling and Russian error messages in `components/admin/users/user-form.tsx` (FR-017)
- [x] T033 [US2] Add success feedback and list refresh after creation in `components/admin/users/user-form.tsx`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Admin can view users and create new users.

---

## Phase 5: User Story 3 - Edit User (Priority: P2)

**Goal**: Administrator can edit user name, role, and active status. Email is immutable. Uses last-write-wins strategy for concurrent edits.

**Independent Test**: Admin can click edit button, modify user data, save, and see updated data in list. Testable independently - edits existing users from US1.

### Implementation for User Story 3

- [x] T034 [US3] Implement GET /api/admin/users/[id] endpoint in `app/api/admin/users/[id]/route.ts` (get single user, auth check)
- [x] T035 [US3] Implement PATCH /api/admin/users/[id] endpoint in `app/api/admin/users/[id]/route.ts` (update user, auth check)
- [x] T036 [US3] Add email immutability check in `app/api/admin/users/[id]/route.ts` (FR-008 - reject email updates)
- [x] T037 [US3] Add role validation in `app/api/admin/users/[id]/route.ts` (FR-012)
- [x] T038 [US3] Add audit logging for user updates in `app/api/admin/users/[id]/route.ts` (FR-018)
- [x] T039 [US3] Add API client function `getUser(id)` in `lib/api/admin/users.ts`
- [x] T040 [US3] Add API client function `updateUser(id, data)` in `lib/api/admin/users.ts`
- [x] T041 [US3] Add TanStack Query hook `useUser(id)` in `lib/hooks/use-admin-users.ts`
- [x] T042 [US3] Add TanStack Query mutation hook `useUpdateUser()` in `lib/hooks/use-admin-users.ts`
- [x] T043 [US3] Add edit mode to UserForm component in `components/admin/users/user-form.tsx` (pre-fill with existing data)
- [x] T044 [US3] Disable email field in edit mode in `components/admin/users/user-form.tsx` (FR-008)
- [x] T045 [US3] Add edit button to UsersTable in `components/admin/users/users-table.tsx` (action column)
- [x] T046 [US3] Add edit dialog/modal integration in `app/(protected)/admin/users/page.tsx` (open form with user data)
- [x] T047 [US3] Add optimistic updates to update mutation in `lib/hooks/use-admin-users.ts` (FR-019 - last-write-wins)
- [x] T048 [US3] Add error handling and Russian error messages for updates in `components/admin/users/user-form.tsx` (FR-017)

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently. Admin can view, create, and edit users.

---

## Phase 6: User Story 4 - Delete/Deactivate User (Priority: P3)

**Goal**: Administrator can delete users (with confirmation) or deactivate users. Self-deletion is prevented.

**Independent Test**: Admin can click delete button, confirm deletion, and see user removed from list. Or deactivate user and see status change. Testable independently - deletes/deactivates users from US1.

### Implementation for User Story 4

- [x] T049 [US4] Implement DELETE /api/admin/users/[id] endpoint in `app/api/admin/users/[id]/route.ts` (delete user, auth check)
- [x] T050 [US4] Add self-deletion prevention check in `app/api/admin/users/[id]/route.ts` (FR-016)
- [x] T051 [US4] Add audit logging for user deletion in `app/api/admin/users/[id]/route.ts` (FR-018)
- [x] T052 [US4] Add API client function `deleteUser(id)` in `lib/api/admin/users.ts`
- [x] T053 [US4] Add TanStack Query mutation hook `useDeleteUser()` in `lib/hooks/use-admin-users.ts`
- [x] T054 [US4] Create DeleteUserDialog component in `components/admin/users/delete-user-dialog.tsx` (confirmation dialog, FR-015)
- [x] T055 [US4] Add delete button to UsersTable in `components/admin/users/users-table.tsx` (action column)
- [x] T056 [US4] Integrate DeleteUserDialog with delete mutation in `components/admin/users/delete-user-dialog.tsx`
- [x] T057 [US4] Add list refresh after deletion in `components/admin/users/delete-user-dialog.tsx`
- [x] T058 [US4] Add error handling for self-deletion attempt in `components/admin/users/delete-user-dialog.tsx` (FR-016, FR-017)
- [x] T059 [US4] Add deactivate functionality via edit form (isActive toggle) in `components/admin/users/user-form.tsx` (FR-010)
- [x] T060 [US4] Verify deactivated users cannot log in (FR-011) - test with existing auth system

**Checkpoint**: All user stories should now be independently functional. Admin can view, create, edit, delete, and deactivate users.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T061 [P] Add comprehensive error handling across all API endpoints (FR-017 - Russian messages)
- [x] T062 [P] Verify audit logging works for all operations (FR-018) in `app/api/admin/users/route.ts` and `app/api/admin/users/[id]/route.ts`
- [x] T063 [P] Add loading states to all mutations (create, update, delete) in `components/admin/users/user-form.tsx` and `components/admin/users/delete-user-dialog.tsx`
- [x] T064 [P] Optimize pagination performance (SC-001 - <2 seconds) in `app/api/admin/users/route.ts`
- [x] T065 [P] Add TypeScript types validation (ensure no `any` types) across all files
- [x] T066 [P] Verify all UI text is in Russian language (FR-017) across all components
- [x] T067 [P] Test concurrent edit scenarios (last-write-wins, FR-019)
- [x] T068 [P] Test external auth services check (FR-022, FR-023) with unavailable services
- [x] T069 [P] Run quickstart.md validation checklist
- [x] T070 [P] Code cleanup and refactoring (remove unused code, optimize imports)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (US1 → US2 → US3 → US4)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Uses US1 list for display, but independently testable
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Uses US1 list, but independently testable
- **User Story 4 (P3)**: Can start after Foundational (Phase 2) - Uses US1 list, but independently testable

### Within Each User Story

- API endpoints before API client functions
- API client functions before TanStack Query hooks
- Hooks before UI components
- Components before page integration
- Core implementation before error handling and polish
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, user stories can start in parallel (if team capacity allows)
- Different API endpoints within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch API endpoint and client functions in parallel:
Task: "Implement GET /api/admin/users endpoint in app/api/admin/users/route.ts"
Task: "Add API client function getUsers(page, pageSize) in lib/api/admin/users.ts"

# Launch component and hook in parallel (after API ready):
Task: "Add TanStack Query hook useUsers(page, pageSize) in lib/hooks/use-admin-users.ts"
Task: "Create UsersTable component in components/admin/users/users-table.tsx"
```

---

## Parallel Example: User Story 2

```bash
# Launch API endpoint and validation in parallel:
Task: "Implement POST /api/admin/users endpoint in app/api/admin/users/route.ts"
Task: "Add email format validation in app/api/admin/users/route.ts"
Task: "Add email uniqueness check in app/api/admin/users/route.ts"

# Launch client functions and form component in parallel:
Task: "Add API client function createUser(data) in lib/api/admin/users.ts"
Task: "Create UserForm component in components/admin/users/user-form.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (View Users List)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (View List)
   - Developer B: User Story 2 (Create User)
   - Developer C: User Story 3 (Edit User)
   - Developer D: User Story 4 (Delete User)
3. Stories complete and integrate independently

---

## Task Summary

**Total Tasks**: 70

**Tasks per Phase**:
- Phase 1 (Setup): 4 tasks
- Phase 2 (Foundational): 4 tasks
- Phase 3 (User Story 1): 11 tasks
- Phase 4 (User Story 2): 14 tasks
- Phase 5 (User Story 3): 15 tasks
- Phase 6 (User Story 4): 12 tasks
- Phase 7 (Polish): 10 tasks

**Tasks per User Story**:
- User Story 1 (View List): 11 tasks
- User Story 2 (Create): 14 tasks
- User Story 3 (Edit): 15 tasks
- User Story 4 (Delete): 12 tasks

**Parallel Opportunities Identified**:
- Setup tasks: 3 parallel tasks
- Foundational tasks: 4 parallel tasks
- User Story 1: 2-3 parallel task groups
- User Story 2: 2-3 parallel task groups
- User Story 3: 2-3 parallel task groups
- User Story 4: 2-3 parallel task groups
- Polish tasks: 10 parallel tasks

**Independent Test Criteria**:
- **User Story 1**: Admin can open `/admin/users`, see table with pagination, loading/empty states work
- **User Story 2**: Admin can create user via form, see new user in list, validation works
- **User Story 3**: Admin can edit user, see updated data in list, email is immutable
- **User Story 4**: Admin can delete user with confirmation, or deactivate via edit, self-deletion prevented

**Suggested MVP Scope**: User Story 1 (View Users List) - 19 tasks total (Setup + Foundational + US1)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All error messages must be in Russian (FR-017)
- All operations must log for audit (FR-018)
- Performance targets: List <2s (SC-001), Create <1min (SC-002), Edit <1s (SC-003)

