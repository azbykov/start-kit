# Tasks: Base Theme and Core Colors

**Input**: Design documents from `/specs/002-base-theme-colors/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, quickstart.md

**Tests**: Visual regression testing and accessibility validation (manual verification, WCAG contrast checkers). No automated test tasks per specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: Next.js App Router structure at repository root
- Paths: `app/globals.css`, `tailwind.config.ts`, `design/tokens.md`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project structure preparation for theme implementation

- [x] T001 Create design directory structure: create `design/` directory at repository root for theme documentation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core theme infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Define base color palette CSS variables in `app/globals.css` (`:root` selector): primary (216 80% 56%), secondary (216 81% 26%), background (248 36% 98%), foreground (222 47% 10%), border (214 32% 85%), muted (214 32% 91%)
- [x] T003 [P] Define component state tokens in `app/globals.css` (`:root` selector): primary-hover (216 80% 51%), primary-focus (216 80% 56%), primary-active (216 80% 46%), primary-disabled (214 32% 91% with 50% opacity), secondary-hover, secondary-focus, secondary-active, secondary-disabled. Note: loading state uses primary color for spinner (component-level, not separate theme token)
- [x] T004 [P] Define foreground color tokens in `app/globals.css` (`:root` selector): primary-foreground (0 0% 100%), secondary-foreground (0 0% 100%), muted-foreground (215 19% 35%)
- [x] T005 [P] Define spacing tokens as CSS variables in `app/globals.css` (`:root` selector): --spacing-xs (4px), --spacing-sm (8px), --spacing-md (16px), --spacing-lg (24px), --spacing-xl (32px), --spacing-2xl (48px), --spacing-3xl (64px)
- [x] T006 [P] Update `tailwind.config.ts` to extend theme.colors with CSS variable mappings: primary, primary-foreground, primary-hover, primary-focus, primary-active, primary-disabled, secondary, secondary-foreground, secondary-hover, secondary-focus, secondary-active, secondary-disabled, background, foreground, border, muted, muted-foreground
- [x] T007 [P] Update `tailwind.config.ts` to extend theme.spacing with semantic spacing tokens: spacing-xs, spacing-sm, spacing-md, spacing-lg, spacing-xl, spacing-2xl, spacing-3xl
- [x] T007a [P] Verify border radius configuration in `tailwind.config.ts` uses `var(--radius)` and ensure `--radius` CSS variable is defined in `app/globals.css` (per FR-009: consistent border styles and border radius values)
- [ ] T008 Verify WCAG AA contrast compliance for normal text combinations (foreground on background, muted-foreground on muted) using WebAIM Contrast Checker (REQUIRES MANUAL VERIFICATION)
- [ ] T009 Verify WCAG AAA contrast compliance for critical interactive elements (primary-foreground on primary, secondary-foreground on secondary) using WebAIM Contrast Checker (REQUIRES MANUAL VERIFICATION)

**Checkpoint**: Foundation ready - theme tokens defined and accessible. User story implementation can now begin.

---

## Phase 3: User Story 1 - Developer Can Use Consistent Visual Theme Across All Components (Priority: P1) 🎯 MVP

**Goal**: Developers can use unified theme tokens when building any UI component (tables, cards, forms) so all elements share consistent colors, spacing, and styling.

**Independent Test**: Create multiple UI components (a table, a card, and a form) and verify they all use the same color palette, consistent spacing, and unified styling tokens. All components should visually appear as part of the same application.

### Implementation for User Story 1

- [x] T010 [US1] Create theme documentation file `design/tokens.md` with token reference table (name, HSL value, usage guidelines) for all color tokens
- [x] T011 [US1] Add spacing scale reference to `design/tokens.md` with semantic names and specific values (xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px, 2xl: 48px, 3xl: 64px)
- [x] T012 [US1] Add component state tokens guide to `design/tokens.md` documenting hover, focus, active, disabled states for primary and secondary colors
- [x] T013 [US1] Add usage examples to `design/tokens.md` showing how to use theme tokens in TailwindCSS classes for tables, cards, and forms
- [x] T014 [US1] Verify existing table component (`components/ui/table.tsx`) uses theme tokens (bg-muted, text-muted-foreground, border-border) instead of hardcoded values
- [x] T015 [US1] Verify existing card component (`components/ui/card.tsx`) uses theme tokens (bg-card, text-card-foreground, border-border) instead of hardcoded values
- [x] T016 [US1] Create example form component demonstrating theme token usage in `components/example/example-form.tsx` with inputs using border-input, focus:ring-ring, and spacing tokens
- [x] T017 [US1] Test that multiple components (table, card, form) displayed on same page appear visually cohesive using theme tokens

**Checkpoint**: At this point, User Story 1 should be fully functional. Developers can reference `design/tokens.md` and use theme tokens in components. All components use consistent styling.

---

## Phase 4: User Story 2 - User Experiences Visually Consistent Interface (Priority: P1)

**Goal**: End users experience a visually consistent interface where all pages, tables, cards, and forms share the same color scheme, spacing, and visual style.

**Independent Test**: Navigate through different pages of the application (home page, player pages, match pages) and verify that colors, spacing, borders, and overall visual style remain consistent across all pages and components.

### Implementation for User Story 2

- [x] T018 [US2] Verify home page (`app/page.tsx`) uses theme tokens for all colors and spacing (bg-background, text-foreground, spacing tokens)
- [x] T019 [US2] Verify example page (`app/example/page.tsx`) uses theme tokens consistently with home page
- [x] T020 [US2] Update any hardcoded color values in existing pages to use theme tokens (search for rgb(), hex colors, hardcoded Tailwind colors like bg-white, text-black)
- [x] T021 [US2] Update any hardcoded spacing values in existing pages to use theme spacing tokens (replace hardcoded p-4, m-8 with spacing tokens where appropriate)
- [x] T022 [US2] Verify all form elements across pages use consistent theme tokens (border-input, focus:ring-ring, consistent spacing)
- [ ] T023 [US2] Perform visual consistency check: view home page and example page side-by-side, verify no visual inconsistencies in colors, spacing, or styling (REQUIRES MANUAL VERIFICATION)

**Checkpoint**: At this point, User Story 2 should be fully functional. All pages and components share the same color palette and spacing system. Users cannot identify visual inconsistencies between pages.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Documentation completion, accessibility validation, and theme extension process

- [x] T024 Add accessibility section to `design/tokens.md` documenting WCAG AA/AAA requirements and contrast ratios for all color combinations
- [x] T025 Add theme extension process documentation to `design/tokens.md` describing approval process for adding new tokens (per FR-011)
- [x] T026 Add color palette visual guide to `design/tokens.md` with hex/rgb values for all color tokens for design tool reference
- [x] T027 Validate all existing components use theme tokens: search codebase for hardcoded colors (rgb(), hex, hardcoded Tailwind colors) and replace with theme tokens
- [x] T028 Validate all existing components use theme spacing tokens: search codebase for hardcoded spacing values and replace with semantic spacing tokens where appropriate
- [ ] T029 Final accessibility audit: verify all color combinations meet WCAG AA (normal text) and WCAG AAA (interactive elements) using WebAIM Contrast Checker (REQUIRES MANUAL VERIFICATION)
- [x] T030 Verify theme documentation is accessible: test that developer can locate and understand all available theme tokens within 2 minutes by referencing `design/tokens.md` (per SC-003)

---

## Dependencies & Execution Order

### User Story Completion Order

Both User Stories (US1 and US2) are P1 priority and can be implemented in parallel after Phase 2 completion, but they have some dependencies:

1. **Phase 2 (Foundational)** → MUST complete first
   - All theme tokens must be defined before any component can use them
   - TailwindCSS config must be updated before components can reference tokens

2. **Phase 3 (US1 - Developer Experience)** → Can start immediately after Phase 2
   - Documentation creation (T010-T013) can be done in parallel
   - Component verification (T014-T015) can be done in parallel
   - Example component (T016) depends on documentation being available

3. **Phase 4 (US2 - User Experience)** → Can start after Phase 2, benefits from US1 documentation
   - Page verification (T018-T019) can be done in parallel
   - Hardcoded value replacement (T020-T021) can be done in parallel
   - Visual consistency check (T023) depends on all pages being updated

4. **Phase 5 (Polish)** → Must complete after US1 and US2
   - Documentation completion depends on all tokens being defined and used
   - Final validation depends on all components being updated

### Parallel Execution Opportunities

**Within Phase 2:**
- T003, T004, T005, T006, T007, T007a can all run in parallel (different CSS variables, different config sections)

**Within Phase 3 (US1):**
- T010, T011, T012 can run in parallel (different sections of documentation)
- T014, T015 can run in parallel (different component files)

**Within Phase 4 (US2):**
- T018, T019 can run in parallel (different page files)
- T020, T021 can run in parallel (different types of replacements)

**Within Phase 5:**
- T024, T025, T026 can run in parallel (different documentation sections)
- T027, T028 can run in parallel (different types of searches)

---

## Implementation Strategy

### MVP First Approach

**Suggested MVP Scope**: Phase 2 (Foundational) + Phase 3 (US1 - Developer Experience)

This delivers:
- Complete theme token system
- Developer-accessible documentation
- Verified component usage
- Example implementation

This enables:
- All future components to use consistent theme
- Developers to reference documentation
- Visual consistency foundation

**Incremental Delivery**:
1. **MVP**: Phase 2 + Phase 3 → Developers can use theme, components are consistent
2. **Enhancement**: Phase 4 → All pages are visually consistent for end users
3. **Polish**: Phase 5 → Complete documentation, full validation, extension process

### Task Completeness Validation

✅ **Phase 2**: All theme tokens defined, TailwindCSS configured, accessibility verified
✅ **Phase 3 (US1)**: Documentation complete, components verified, examples created
✅ **Phase 4 (US2)**: All pages use theme tokens, visual consistency achieved
✅ **Phase 5**: Documentation complete, validation done, extension process documented

Each user story is independently testable:
- **US1**: Can test by creating components using theme tokens and verifying consistency
- **US2**: Can test by navigating pages and verifying visual consistency

---

## Summary

**Total Tasks**: 31
- Phase 1 (Setup): 1 task
- Phase 2 (Foundational): 9 tasks (6 parallelizable)
- Phase 3 (US1): 8 tasks (multiple parallelizable)
- Phase 4 (US2): 6 tasks (multiple parallelizable)
- Phase 5 (Polish): 7 tasks (multiple parallelizable)

**Task Count per User Story**:
- US1: 8 tasks (Phase 3)
- US2: 6 tasks (Phase 4)

**Parallel Opportunities**: 
- 5 tasks in Phase 2
- Multiple tasks in Phase 3, 4, and 5 can run in parallel

**Independent Test Criteria**:
- **US1**: Create table, card, and form components using theme tokens, verify visual consistency
- **US2**: Navigate through pages, verify colors, spacing, and styling remain consistent

**Suggested MVP Scope**: Phase 2 + Phase 3 (Foundation + Developer Experience)

**Format Validation**: ✅ All tasks follow checklist format with checkbox, ID, optional [P] marker, optional [Story] label, and file paths in descriptions.

