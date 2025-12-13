# Tasks: Project Setup and Foundation

**Input**: Design documents from `/specs/001-project-setup/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are deferred to next phase per specification clarifications.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: Next.js App Router structure at repository root
- Paths: `app/`, `components/`, `lib/`, `public/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create project directory structure (app/, components/, lib/, public/) per implementation plan
- [x] T002 Initialize Next.js project with TypeScript and App Router: `npx create-next-app@latest . --typescript --app --no-src-dir`
- [x] T003 [P] Create .gitignore file excluding .env, node_modules, .next, and other build artifacts
- [x] T004 [P] Create .env.example file with placeholder environment variables
- [x] T005 [P] Create README.md with project overview and setup instructions

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Configure TypeScript strict mode in tsconfig.json (strict: true, noUnusedLocals, noUnusedParameters)
- [x] T007 [P] Configure path aliases in tsconfig.json (@/components, @/lib, @/app)
- [x] T008 [P] Install and configure TailwindCSS: install dependencies, create tailwind.config.ts, configure globals.css
- [x] T009 [P] Install and configure ESLint: install eslint-config-next, create eslint.config.js
- [x] T010 [P] Install and configure Prettier: install prettier, eslint-config-prettier, create .prettierrc
- [x] T011 [P] Add npm scripts to package.json (dev, build, lint, lint:fix, format, format:check)
- [x] T012 Create lib/logger.ts with pino instance and structured logging (error, warn, info levels)
- [x] T013 Create lib/api.ts with Axios instance, baseURL configuration, and error interceptors
- [x] T014 Create lib/utils.ts with basic input validation utilities

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Developer Can Start and Run the Project Locally (Priority: P1) 🎯 MVP

**Goal**: Developer can clone repository, install dependencies, start dev server, and see working application

**Independent Test**: Clone repository, run `npm install`, run `npm run dev`, verify page loads at http://localhost:3000 without errors

### Implementation for User Story 1

- [x] T015 [US1] Create app/layout.tsx with root layout structure
- [x] T016 [US1] Create app/page.tsx with basic home page content
- [x] T017 [US1] Configure next.config.js with basic settings
- [x] T018 [US1] Verify development server starts: run `npm run dev` and confirm server starts on port 3000
- [x] T019 [US1] Verify production build works: run `npm run build` and confirm build succeeds without errors
- [x] T020 [US1] Test cross-platform compatibility: verify project works on Windows, macOS, Linux (or document known issues)

**Checkpoint**: At this point, User Story 1 should be fully functional - developers can clone, install, and run the project

---

## Phase 4: User Story 2 - Developer Can Use UI Components and Styling System (Priority: P1)

**Goal**: Developer can import and use shadcn/ui components with TailwindCSS styling

**Independent Test**: Import a shadcn/ui component (e.g., Button) in app/page.tsx, render it, verify it displays with correct styling

### Implementation for User Story 2

- [x] T021 [US2] Initialize shadcn/ui: run `npx shadcn-ui@latest init` and configure components.json
- [x] T022 [US2] Install shadcn/ui Button component: `npx shadcn-ui@latest add button`
- [x] T023 [US2] Install shadcn/ui Card component: `npx shadcn-ui@latest add card`
- [x] T024 [US2] Create components/ui directory structure
- [x] T025 [US2] Update app/page.tsx to demonstrate Button and Card components with TailwindCSS styling
- [x] T026 [US2] Verify components render correctly: check browser, verify no console errors, verify styles apply
- [x] T027 [US2] Test styling utilities: add TailwindCSS utility classes and verify they work correctly

**Checkpoint**: At this point, User Story 2 should be complete - developers can use UI components and styling system

---

## Phase 5: User Story 3 - Developer Can Fetch Data and Display Tables (Priority: P2)

**Goal**: Developer can fetch data from API endpoints and display it in interactive tables with sorting and pagination

**Independent Test**: Create test API endpoint, fetch data using TanStack Query, display in table, verify sorting and pagination work

### Implementation for User Story 3

- [x] T028 [US3] Install TanStack Query: `npm install @tanstack/react-query @tanstack/react-query-devtools`
- [x] T029 [US3] Create lib/react-query.ts with QueryClient configuration
- [x] T030 [US3] Create components/providers/query-provider.tsx as client component wrapper for QueryClientProvider
- [x] T031 [US3] Update app/layout.tsx to wrap application with QueryClientProvider
- [x] T032 [US3] Create app/api/example/route.ts as test API endpoint returning sample data
- [x] T033 [US3] Install TanStack Table: `npm install @tanstack/react-table`
- [x] T034 [US3] Install shadcn/ui Table component: `npx shadcn-ui@latest add table`
- [x] T035 [US3] Create components/ui/data-table.tsx as reusable table wrapper with TanStack Table
- [x] T036 [US3] Implement sorting functionality in components/ui/data-table.tsx
- [x] T037 [US3] Implement pagination functionality in components/ui/data-table.tsx
- [x] T038 [US3] Create example page demonstrating data fetching and table: create app/example/page.tsx with useQuery hook and DataTable component
- [x] T039 [US3] Verify data fetching works: check network tab, verify data loads, verify loading/error states display
- [x] T040 [US3] Verify table functionality: test sorting, test pagination, verify responsive behavior

**Checkpoint**: At this point, User Story 3 should be complete - developers can fetch data and display it in tables

---

## Phase 6: User Story 4 - Developer Has Code Quality Tools Configured (Priority: P2)

**Goal**: Developer has automated code quality checks and formatting that enforce project standards

**Independent Test**: Write code with style violations, run `npm run lint`, verify violations are reported. Run `npm run format`, verify code is formatted.

### Implementation for User Story 4

- [x] T041 [US4] Configure ESLint rules: add TypeScript-specific rules, disable console.log in production, enforce import order
- [x] T042 [US4] Configure Prettier: set formatting rules, ensure compatibility with ESLint
- [x] T043 [US4] Add ESLint script to package.json: `lint` and `lint:fix`
- [x] T044 [US4] Add Prettier scripts to package.json: `format` and `format:check`
- [x] T045 [US4] Test linting: create test file with violations, run `npm run lint`, verify errors are reported
- [x] T046 [US4] Test formatting: create test file with formatting issues, run `npm run format`, verify code is formatted
- [x] T047 [US4] Verify TypeScript strict mode: create test file with type errors, verify TypeScript reports errors
- [x] T048 [US4] Document code quality workflow in README.md: explain how to run linting and formatting

**Checkpoint**: At this point, User Story 4 should be complete - code quality tools are configured and working

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

- [x] T049 [P] Update README.md with complete setup instructions from quickstart.md
- [x] T050 [P] Add structured logging usage examples in lib/logger.ts comments
- [x] T051 [P] Add API client usage examples in lib/api.ts comments
- [x] T052 [P] Verify all environment variables are documented in .env.example
- [x] T053 [P] Verify .gitignore excludes all sensitive files (.env, node_modules, .next, etc.)
- [x] T054 Run quickstart.md validation: follow all steps, verify everything works as documented
- [x] T055 Verify project structure matches plan.md: check all directories exist, verify file organization
- [x] T056 Final verification: run `npm run build`, verify no errors, verify all user stories can be tested independently

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Independent, can run parallel with US1
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Uses lib/api.ts from Phase 2, otherwise independent
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Independent, can run parallel with other stories

### Within Each User Story

- Core setup before implementation
- Implementation before verification
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1**: T003, T004, T005 can run in parallel
- **Phase 2**: T007, T008, T009, T010, T011 can run in parallel
- **Phase 2**: T012, T013, T014 can run in parallel (after T006)
- **User Stories**: US1, US2, US3, US4 can start in parallel after Phase 2 (if team capacity allows)
- **Phase 7**: T049, T050, T051, T052, T053 can run in parallel

---

## Parallel Example: User Story 3

```bash
# Install dependencies in parallel:
Task: "Install TanStack Query: npm install @tanstack/react-query @tanstack/react-query-devtools"
Task: "Install TanStack Table: npm install @tanstack/react-table"
Task: "Install shadcn/ui Table component: npx shadcn-ui@latest add table"

# Create components in parallel (after dependencies):
Task: "Create lib/react-query.ts with QueryClient configuration"
Task: "Create components/providers/query-provider.tsx as client component wrapper"
Task: "Create app/api/example/route.ts as test API endpoint"
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Project runs locally)
4. Complete Phase 4: User Story 2 (UI components work)
5. **STOP and VALIDATE**: Test both stories independently
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (Basic MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo (UI MVP!)
4. Add User Story 3 → Test independently → Deploy/Demo (Data MVP!)
5. Add User Story 4 → Test independently → Deploy/Demo (Quality MVP!)
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Project setup)
   - Developer B: User Story 2 (UI components)
   - Developer C: User Story 3 (Data fetching) - can start after lib/api.ts is ready
   - Developer D: User Story 4 (Code quality) - can start in parallel
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Testing infrastructure is deferred to next phase per specification
