# Tasks: NextAuth Setup with User Model, Roles, and Private Routes

**Input**: Design documents from `/specs/004-auth-roles-setup/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are deferred to next phase per MVP approach.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: Next.js App Router structure at repository root
- Paths: `app/`, `components/`, `lib/`, `prisma/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency installation

- [x] T001 Install NextAuth.js and required dependencies: `npm install next-auth@beta @auth/prisma-adapter bcryptjs`
- [x] T002 [P] Install development dependencies: `npm install -D @types/bcryptjs tsx`
- [x] T003 [P] Create directory structure: `app/api/auth/[...nextauth]/`, `app/(auth)/sign-in/`, `app/(protected)/dashboard/`, `components/auth/`, `lib/auth/`
- [x] T004 [P] Add NEXTAUTH_URL and NEXTAUTH_SECRET to `.env` file (generate secret with `openssl rand -base64 32`)
- [x] T005 [P] Update `.env.example` with NextAuth placeholder variables

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core database schema and models that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 [US2] Add Role enum to `prisma/schema.prisma` with values: PLAYER, COACH, AGENT, ADMIN
- [x] T007 [US2] Add User model to `prisma/schema.prisma` with fields: id, name, email, emailVerified, password, role, isActive, createdAt, updatedAt, and relations to Account and Session
- [x] T008 [US2] Add Account model to `prisma/schema.prisma` (NextAuth required) with all required fields and relation to User
- [x] T009 [US2] Add Session model to `prisma/schema.prisma` (NextAuth required for database sessions) with sessionToken, userId, expires, and relation to User
- [x] T010 [US2] Add VerificationToken model to `prisma/schema.prisma` (NextAuth required) with identifier, token, expires, and unique constraint
- [x] T011 [US2] Apply Prisma schema to database: `npm run db:push`
- [x] T012 [US2] Generate Prisma Client: `npm run db:generate`

**Checkpoint**: Foundation ready - User model and NextAuth schema tables exist in database. User story implementation can now begin.

---

## Phase 3: User Story 1 - Developer Can Authenticate Users (Priority: P1) 🎯 MVP

**Goal**: Working authentication system that allows users to sign in and sign out with database session management.

**Independent Test**: Configure authentication, create a test user manually in database, sign in with credentials, verify session exists, sign out, verify session destroyed.

### Implementation for User Story 1

- [x] T013 [P] [US1] Create NextAuth configuration file `lib/auth/config.ts` with PrismaAdapter, Credentials provider, and database session strategy
- [x] T014 [US1] Implement credentials authorization function in `lib/auth/config.ts` that validates email/password, checks isActive, and returns user object with role
- [x] T015 [US1] Configure NextAuth callbacks in `lib/auth/config.ts` to include user role in session (session callback)
- [x] T016 [US1] Create NextAuth API route handler at `app/api/auth/[...nextauth]/route.ts` that exports GET and POST handlers
- [x] T017 [P] [US1] Create sign-in page at `app/(auth)/sign-in/page.tsx` with basic layout
- [x] T018 [US1] Create sign-in form component at `components/auth/sign-in-form.tsx` with email/password inputs and form submission handling
- [x] T019 [US1] Implement sign-in form submission in `components/auth/sign-in-form.tsx` using NextAuth signIn function with credentials provider
- [x] T020 [US1] Add error handling and generic error messages in `components/auth/sign-in-form.tsx` (doesn't reveal if email exists)
- [x] T021 [P] [US1] Create sign-out button component at `components/auth/sign-out-button.tsx` using NextAuth signOut function
- [ ] T022 [US1] Test authentication flow: sign in with valid credentials, verify session, sign out, verify session destroyed

**Checkpoint**: At this point, User Story 1 should be fully functional. Users can sign in and sign out, sessions are stored in database.

---

## Phase 4: User Story 2 - System Can Store and Retrieve User Data with Roles (Priority: P1)

**Goal**: User model in database with roles that can be created, read, updated, and filtered by role.

**Independent Test**: Create user with role via Prisma, retrieve user with role, update user role, filter users by role, verify all operations work correctly.

**Note**: User model schema is already created in Phase 2. This story focuses on verifying CRUD operations work correctly.

### Implementation for User Story 2

- [x] T023 [US2] Verify User model CRUD operations: Create user with role using Prisma Client in test script or API route
- [x] T024 [US2] Verify User model retrieval: Query user by email and verify role is included in response
- [x] T025 [US2] Verify User model update: Update user role and verify change persists in database
- [x] T026 [US2] Verify User model filtering: Query users filtered by role and verify only matching roles returned
- [x] T027 [US2] Verify password hashing: Create user with password, verify password is hashed (not plain text) in database
- [x] T028 [US2] Verify password exclusion: Query user and verify password field is never returned in API responses (test via Prisma select)

**Checkpoint**: At this point, User Story 2 should be fully functional. User model supports all CRUD operations with roles, passwords are hashed and excluded from responses.

---

## Phase 5: User Story 3 - Developer Can Protect Routes Based on Authentication Status (Priority: P1)

**Goal**: Mechanism to mark routes as private and automatically redirect unauthenticated users to sign-in page, working for both page routes and API routes.

**Independent Test**: Mark route as private, attempt access while unauthenticated (should redirect), access while authenticated (should succeed), test both page and API routes.

### Implementation for User Story 3

- [x] T029 [US3] Create Next.js middleware at `app/middleware.ts` using NextAuth auth() helper
- [x] T030 [US3] Implement route protection logic in `app/middleware.ts` that checks authentication status for protected routes
- [x] T031 [US3] Add redirect logic in `app/middleware.ts` that redirects unauthenticated users to `/sign-in` with callbackUrl parameter
- [x] T032 [US3] Configure middleware matcher in `app/middleware.ts` to exclude static files and public API routes
- [x] T033 [P] [US3] Create example protected page route at `app/(protected)/dashboard/page.tsx`
- [x] T034 [US3] Implement server-side authentication check in `app/(protected)/dashboard/page.tsx` using auth() from NextAuth config
- [x] T035 [US3] Add redirect for unauthenticated users in `app/(protected)/dashboard/page.tsx` using Next.js redirect()
- [x] T036 [P] [US3] Create example protected API route at `app/api/protected/route.ts`
- [x] T037 [US3] Implement authentication check in `app/api/protected/route.ts` using auth() helper
- [x] T038 [US3] Return 401 Unauthorized response in `app/api/protected/route.ts` for unauthenticated requests
- [ ] T039 [US3] Test protected page route: Access while unauthenticated (should redirect), access while authenticated (should succeed)
- [ ] T040 [US3] Test protected API route: Make request while unauthenticated (should return 401), make request while authenticated (should succeed)

**Checkpoint**: At this point, User Story 3 should be fully functional. Protected routes redirect unauthenticated users, authenticated users can access protected content.

---

## Phase 6: User Story 4 - Developer Can Seed Test Admin User (Priority: P2)

**Goal**: Seed script that creates test admin user with predefined credentials, idempotent (can run multiple times safely).

**Independent Test**: Run seed script, verify admin user exists in database with ADMIN role, sign in with admin credentials, verify authentication succeeds with ADMIN role, run seed script again, verify no errors.

### Implementation for User Story 4

- [x] T041 [US4] Create seed script at `prisma/seed.ts` with PrismaClient initialization
- [x] T042 [US4] Implement bcrypt password hashing in `prisma/seed.ts` for admin user password
- [x] T043 [US4] Implement upsert logic in `prisma/seed.ts` that creates admin user if not exists, skips if exists (idempotent)
- [x] T044 [US4] Configure admin user in `prisma/seed.ts` with email: admin@test.com, role: ADMIN, isActive: true, emailVerified: current date
- [x] T045 [US4] Add error handling and logging in `prisma/seed.ts` for success and failure cases
- [x] T046 [US4] Add prisma.seed configuration to `package.json` with tsx execution: `"prisma": { "seed": "tsx prisma/seed.ts" }`
- [x] T047 [US4] Add db:seed script to `package.json`: `"db:seed": "prisma db seed"`
- [x] T048 [US4] Test seed script: Run `npm run db:seed`, verify admin user created, verify can sign in with credentials
- [x] T049 [US4] Test idempotency: Run seed script multiple times, verify no errors, verify user still exists

**Checkpoint**: At this point, User Story 4 should be fully functional. Seed script creates test admin user, can be run multiple times safely, admin user can sign in.

---

## Phase 7: User Story 5 - System Can Enforce Role-Based Access Control (Priority: P2)

**Goal**: Ability to restrict access to routes or functionality based on user roles, with role verification from database on each request.

**Independent Test**: Create users with different roles, attempt to access role-protected routes with each user, verify only users with correct role can access, verify role changes are detected on next request.

### Implementation for User Story 5

- [x] T050 [P] [US5] Create role utilities file at `lib/auth/roles.ts` with verifyUserRole function
- [x] T051 [US5] Implement verifyUserRole function in `lib/auth/roles.ts` that checks authentication, queries user from database, verifies isActive, and checks role match
- [x] T052 [US5] Add role mismatch logging in `lib/auth/roles.ts` for security monitoring when role doesn't match
- [x] T053 [P] [US5] Create hasRole helper function in `lib/auth/roles.ts` for client-side or session-based role checks (doesn't verify from database)
- [x] T054 [US5] Create example role-protected page route at `app/(protected)/admin/page.tsx` that requires ADMIN role
- [x] T055 [US5] Implement role verification in `app/(protected)/admin/page.tsx` using verifyUserRole function with ADMIN role
- [x] T056 [US5] Add redirect or error for unauthorized roles in `app/(protected)/admin/page.tsx`
- [x] T057 [P] [US5] Create example role-protected API route at `app/api/admin/route.ts` that requires ADMIN role
- [x] T058 [US5] Implement role verification in `app/api/admin/route.ts` using verifyUserRole function with ADMIN role
- [x] T059 [US5] Return 403 Forbidden response in `app/api/admin/route.ts` for users without required role
- [ ] T060 [US5] Test role-based access: Create users with different roles, attempt to access admin routes, verify only ADMIN users can access
- [ ] T061 [US5] Test role change detection: Change user role in database, attempt to access role-protected route, verify access is denied (role verified from database)

**Checkpoint**: At this point, User Story 5 should be fully functional. Role-based access control works for both page and API routes, roles are verified from database on each request.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories, documentation, and validation

- [x] T062 [P] Update README.md with authentication setup instructions and test admin credentials
- [x] T063 [P] Add authentication error logging in `lib/auth/config.ts` for security monitoring (without exposing sensitive data)
- [x] T064 [P] Verify all password fields are excluded from API responses across all endpoints
- [x] T065 [P] Add session expiration handling: Verify expired sessions are automatically invalidated (handled by NextAuth with database sessions)
- [x] T066 [P] Test edge cases: isActive=false blocks sign-in, invalid credentials show generic error, non-existent email shows generic error
- [x] T067 [P] Verify quickstart.md steps work end-to-end: Follow all steps, verify authentication flow works
- [x] T068 [P] Code cleanup: Remove any console.log statements, ensure consistent error handling patterns
- [x] T069 [P] Verify performance targets (NFR-001, NFR-002, NFR-003, NFR-007): Measure sign-in response time (target: <2s in 95% of attempts), session validation time (target: <500ms in 95% of requests), seed script completion time (target: <5s), document concurrent session capacity (target: 1000+ sessions)
- [x] T070 [P] Documentation: Add inline comments for complex authentication logic, document role verification strategy
- [x] T071 [P] Document security measures: Rate limiting and CSRF protection are deferred to production hardening phase (NFR-005 partially addressed via error logging and secure session management)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User Story 1 (Authentication) can start after Phase 2
  - User Story 2 (User Model CRUD) is mostly complete in Phase 2, verification tasks can run in parallel with US1
  - User Story 3 (Route Protection) depends on US1 (needs authentication working)
  - User Story 4 (Seed Script) can start after Phase 2 (needs User model)
  - User Story 5 (RBAC) depends on US1 and US2 (needs authentication and role model)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Mostly complete in Phase 2, verification tasks can run in parallel with US1
- **User Story 3 (P1)**: Depends on US1 (needs authentication system working)
- **User Story 4 (P2)**: Can start after Phase 2 (needs User model) - Can run in parallel with US1/US3
- **User Story 5 (P2)**: Depends on US1 and US2 (needs authentication and role verification) - Can start after US1 complete

### Within Each User Story

- Configuration before implementation
- Core functionality before UI components
- Server-side logic before client-side components
- Basic flow before error handling
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- Foundational tasks T006-T010 (schema models) can run in sequence (same file)
- User Story 1: T013, T017, T021 can run in parallel (different files)
- User Story 3: T033, T036 can run in parallel (different routes)
- User Story 4: Can run in parallel with US1/US3 (different files, no dependencies)
- User Story 5: T050, T053, T054, T057 can run in parallel (different files)
- All Polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch these tasks in parallel (different files):
Task: "Create NextAuth configuration file lib/auth/config.ts"
Task: "Create sign-in page at app/(auth)/sign-in/page.tsx"
Task: "Create sign-out button component at components/auth/sign-out-button.tsx"
```

---

## Parallel Example: User Story 3

```bash
# Launch these tasks in parallel (different routes):
Task: "Create example protected page route at app/(protected)/dashboard/page.tsx"
Task: "Create example protected API route at app/api/protected/route.ts"
```

---

## Implementation Strategy

### MVP First (User Stories 1, 2, 3 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Authentication)
4. Complete Phase 4: User Story 2 (User Model verification)
5. Complete Phase 5: User Story 3 (Route Protection)
6. **STOP and VALIDATE**: Test all three stories independently
7. Deploy/demo if ready

**MVP delivers**: Working authentication with sign-in/sign-out, protected routes, user model with roles.

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (Basic auth working!)
3. Add User Story 2 → Test independently → Deploy/Demo (User model verified)
4. Add User Story 3 → Test independently → Deploy/Demo (Protected routes working!)
5. Add User Story 4 → Test independently → Deploy/Demo (Seed script ready)
6. Add User Story 5 → Test independently → Deploy/Demo (RBAC complete!)
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Authentication)
   - Developer B: User Story 2 (User Model verification) + User Story 4 (Seed Script)
   - Developer C: User Story 3 (Route Protection) - starts after US1 complete
3. After US1 and US3 complete:
   - Developer A: User Story 5 (RBAC)
   - Developer B: Polish tasks
   - Developer C: Additional testing and validation

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- User Story 2 is mostly foundational (schema in Phase 2), verification tasks ensure CRUD works correctly
- User Story 4 (Seed Script) can be developed in parallel with US1/US3 as it only needs User model
- User Story 5 (RBAC) requires authentication working, so depends on US1 completion

---

## Task Summary

- **Total Tasks**: 71
- **Phase 1 (Setup)**: 5 tasks
- **Phase 2 (Foundational)**: 7 tasks
- **Phase 3 (US1 - Authentication)**: 10 tasks
- **Phase 4 (US2 - User Model)**: 6 tasks
- **Phase 5 (US3 - Route Protection)**: 12 tasks
- **Phase 6 (US4 - Seed Script)**: 9 tasks
- **Phase 7 (US5 - RBAC)**: 12 tasks
- **Phase 8 (Polish)**: 10 tasks

**MVP Scope**: Phases 1-5 (Setup, Foundational, US1, US2, US3) = 40 tasks

**Independent Test Criteria**:
- **US1**: Sign in, verify session, sign out, verify session destroyed
- **US2**: Create/read/update user with role, filter by role, verify password hashing
- **US3**: Access protected route unauthenticated (redirect), authenticated (success)
- **US4**: Run seed script, verify admin user exists, sign in with admin credentials
- **US5**: Access role-protected route with different roles, verify only correct role can access

