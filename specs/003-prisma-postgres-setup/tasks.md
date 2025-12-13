# Tasks: Prisma + PostgreSQL Database Setup

**Input**: Design documents from `/specs/003-prisma-postgres-setup/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Manual verification only (no automated tests in this phase)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: Next.js App Router structure
- Prisma schema: `prisma/schema.prisma`
- Database client: `lib/db.ts`
- API routes: `app/api/`
- Scripts: `scripts/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and Prisma installation

- [x] T001 Install Prisma and Prisma Client dependencies in package.json
- [x] T002 [P] Create prisma directory structure at prisma/
- [x] T003 [P] Ensure .env is in .gitignore (verify exclusion from version control)
- [x] T004 [P] Create .env.example file with DATABASE_URL placeholder at .env.example

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Initialize Prisma schema file at prisma/schema.prisma with generator and datasource configuration
- [x] T006 [P] Create utility function for DATABASE_URL format validation at lib/db-utils.ts (basic URL pattern check using regex)
- [x] T007 [P] Create database client singleton module at lib/db.ts with global variable pattern for development (complete implementation)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Developer Can Connect to PostgreSQL Database (Priority: P1) 🎯 MVP

**Goal**: Developer can set up PostgreSQL (locally or via Docker) and configure connection via DATABASE_URL environment variable. Application can establish connection to database.

**Independent Test**: Start PostgreSQL instance, configure DATABASE_URL in .env, verify application can connect to database without errors.

### Implementation for User Story 1

- [ ] T008 [US1] Create docker-compose.yml at docker-compose.yml with PostgreSQL service configuration (SKIPPED - Docker not used)
- [x] T009 [US1] Document local PostgreSQL setup instructions in README or quickstart.md
- [ ] T010 [US1] Configure DATABASE_URL in .env file with connection string format (user action required)
- [x] T011 [US1] Integrate DATABASE_URL validation from lib/db-utils.ts into lib/db.ts (call validation on import)
- [x] T012 [US1] Implement error handling for database connection failures in lib/db.ts with clear error messages
- [x] T013 [US1] Add structured logging for connection establishment and errors in lib/db.ts using existing pino logger

**Checkpoint**: At this point, User Story 1 should be fully functional - developer can connect to PostgreSQL database

---

## Phase 4: User Story 2 - Developer Can Define and Apply Database Schema (Priority: P1)

**Goal**: Developer can define database schema in prisma/schema.prisma and apply changes using `prisma db push` command without migration files.

**Independent Test**: Define a model in schema.prisma, run `npx prisma db push`, verify table exists in database with correct structure.

### Implementation for User Story 2

- [x] T014 [US2] Schema file prisma/schema.prisma is ready for domain models (TestRecord removed)
- [x] T015 [US2] Document schema push workflow in quickstart.md (edit schema.prisma, run prisma db push)
- [x] T016 [US2] Add npm script for schema push in package.json (e.g., "db:push": "prisma db push")
- [x] T017 [US2] Add npm script for Prisma Client generation in package.json (e.g., "db:generate": "prisma generate")
- [x] T018 [US2] Document that migrations are not used during development phase in README or quickstart.md
- [x] T019 [US2] Add schema validation error handling documentation (prisma validate command usage)

**Checkpoint**: At this point, User Story 2 should be fully functional - developer can define and apply schema

---

## Phase 5: User Story 3 - Developer Can Use Database Client in Application Code (Priority: P1)

**Goal**: Developer can import database client from lib/db.ts and use it in route handlers, server functions, and API endpoints to perform CRUD operations.

**Independent Test**: Import prisma client in a route handler, perform database operations, verify operations succeed.

### Implementation for User Story 3

- [x] T020 [US3] Verify Prisma Client singleton implementation in lib/db.ts is complete and working (test import and usage)
- [x] T021 [US3] Ensure Prisma Client is thread-safe and supports concurrent operations (verify singleton pattern prevents multiple instances)
- [ ] T022 [US3] Generate Prisma Client by running `npx prisma generate` after schema is defined (user action required)
- [x] T023 [US3] Create example API route using database client at app/api/example-db/route.ts demonstrating CRUD operations
- [x] T024 [US3] Add error handling for database operations in example route with clear error messages
- [x] T025 [US3] Document database client usage pattern in quickstart.md (import from lib/db.ts, use in routes)

**Checkpoint**: At this point, User Story 3 should be fully functional - developer can use database client in application code

---

## Phase 6: User Story 4 - Developer Can Verify Database Setup Works (Priority: P2)

**Goal**: Developer can run verification script or API endpoint to test database connectivity, schema application, and client functionality by creating and reading a test record.

**Independent Test**: Database client can be imported and used in application code. (Verification scripts removed as TestRecord was removed)

### Implementation for User Story 4

- [ ] T026 [US4] Create verification script at scripts/verify-db.ts that creates TestRecord, reads it back, and confirms success (REMOVED - TestRecord deleted)
- [ ] T027 [US4] Add npm script for verification in package.json (e.g., "db:verify": "tsx scripts/verify-db.ts") (REMOVED - verification script deleted)
- [ ] T028 [P] [US4] Create optional verification API endpoint at app/api/db-test/route.ts with POST handler (REMOVED - TestRecord deleted)
- [ ] T029 [US4] Implement create and read operations in verification script at scripts/verify-db.ts (REMOVED)
- [ ] T030 [US4] Implement create and read operations in verification API endpoint at app/api/db-test/route.ts (REMOVED)
- [ ] T031 [US4] Add cleanup logic in verification script to delete test record after verification (REMOVED)
- [ ] T032 [US4] Add error handling and clear success/failure messages in verification script (REMOVED)
- [x] T033 [US4] Document verification process in quickstart.md (updated - verification removed)

**Checkpoint**: At this point, User Story 4 should be fully functional - developer can verify database setup works

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final documentation

- [x] T034 [P] Update README.md with database setup instructions and quick reference
- [x] T035 [P] Ensure all environment variables are documented in .env.example with comments
- [x] T036 Add troubleshooting section to quickstart.md covering common connection issues
- [ ] T037 Verify application starts successfully even when database is unavailable by: (1) stopping PostgreSQL, (2) starting Next.js app with `npm run dev`, (3) confirming app starts without errors, (4) testing database operation returns clear error message (user verification required)
- [x] T038 [P] Add structured logging for all database connection events (connection, disconnection, errors) in lib/db.ts
- [x] T039 Verify database credentials are not exposed in logs or version control (.env in .gitignore, no credentials in code)
- [ ] T040 Run quickstart.md validation - verify all steps work end-to-end (user verification required)
- [x] T041 [P] Code cleanup and ensure consistent error message formatting across all database operations
- [x] T042 [P] Document performance expectations in quickstart.md: connection < 5 seconds (NFR-001), schema push < 30 seconds for up to 20 tables (NFR-002), with manual verification instructions

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User Stories 1, 2, 3 (P1) can proceed in parallel after Foundational
  - User Story 4 (P2) can start after P1 stories are complete or in parallel if team capacity allows
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - Establishes database connection
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Defines schema, depends on US1 for connection
- **User Story 3 (P1)**: Can start after US2 completes - Needs schema to generate Prisma Client, depends on US1 for connection
- **User Story 4 (P2)**: Can start after US3 completes - Needs working client and schema to verify

### Within Each User Story

- Setup tasks before implementation tasks
- Core implementation before examples/documentation
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks (T002, T003, T004) marked [P] can run in parallel
- Foundational tasks T006 and T007 marked [P] can run in parallel (different files: lib/db-utils.ts and lib/db.ts)
- Once Foundational phase completes:
  - US1 setup tasks can start (T008, T009, T010 can run in parallel)
  - T011 depends on T006 (needs validation utility from lib/db-utils.ts)
  - US2 can start after US1 connection is established
  - US3 can start after US2 (needs generated Prisma Client)
  - US4 can start after US3 (needs working client)
- T028 (API endpoint) marked [P] can be done in parallel with script tasks

---

## Parallel Example: User Story 1

```bash
# Launch setup tasks in parallel:
Task: "Create docker-compose.yml at docker-compose.yml"
Task: "Document local PostgreSQL setup instructions"
Task: "Configure DATABASE_URL in .env file"

# Then implementation tasks sequentially:
Task: "Add connection validation logic in lib/db.ts"
Task: "Implement error handling for database connection failures"
Task: "Add structured logging for connection establishment"
```

---

## Parallel Example: User Story 4

```bash
# Launch verification implementations in parallel:
Task: "Create verification script at scripts/verify-db.ts"
Task: "Create optional verification API endpoint at app/api/db-test/route.ts"

# Then documentation:
Task: "Document verification process in quickstart.md"
```

---

## Implementation Strategy

### MVP First (User Stories 1-3 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Database Connection)
4. Complete Phase 4: User Story 2 (Schema Definition)
5. Complete Phase 5: User Story 3 (Database Client Usage)
6. **STOP and VALIDATE**: Test all three stories independently
7. Deploy/demo if ready

**Note**: User Story 4 (Verification) is P2 and can be deferred if needed for MVP.

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Database connection works
3. Add User Story 2 → Test independently → Schema can be applied
4. Add User Story 3 → Test independently → Client can be used in code
5. Add User Story 4 → Test independently → Verification confirms all works
6. Each story adds value without breaking previous stories

### Sequential Execution (Recommended for Single Developer)

With a single developer, follow this order:

1. **Phase 1**: Setup (T001-T004) - Install Prisma, create structure
2. **Phase 2**: Foundational (T005-T007) - Initialize schema, create validation utility and client singleton
3. **Phase 3**: US1 (T008-T013) - Database connection setup (T011 depends on T006)
4. **Phase 4**: US2 (T014-T019) - Schema definition and push
5. **Phase 5**: US3 (T020-T025) - Client usage in code
6. **Phase 6**: US4 (T026-T033) - Verification
7. **Phase 7**: Polish (T034-T042) - Documentation and cleanup

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Connection)
   - Developer B: Prepares for User Story 2 (waits for US1 connection)
3. After US1 completes:
   - Developer A: User Story 2 (Schema)
   - Developer B: Prepares for User Story 3 (waits for US2 schema)
4. After US2 completes:
   - Developer A: User Story 3 (Client usage)
   - Developer B: User Story 4 (Verification - can start after US3)
5. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Manual verification only (no automated tests in this phase)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- **Important**: Application must start even if database is unavailable (error handling requirement)
- **Important**: Use `prisma db push` only during development (no migrations)
- **Important**: Database credentials must be protected in .env (excluded from git)

