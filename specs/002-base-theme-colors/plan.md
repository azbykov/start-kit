# Implementation Plan: Base Theme and Core Colors

**Branch**: `002-base-theme-colors` | **Date**: 2025-11-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-base-theme-colors/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This plan establishes a unified visual theme foundation for the Youth Football Match & Player Analytics Platform. The goal is to create a consistent color palette, spacing system, and design tokens that ensure visual coherence across all UI components (tables, cards, forms, pages). The theme will be implemented using TailwindCSS CSS variables and integrated with shadcn/ui components. Technical approach: Define color palette v0 with WCAG AA/AAA accessibility compliance, implement CSS variables in globals.css, configure TailwindCSS theme extension, create semantic spacing tokens, and document all tokens in Markdown format for developer reference.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode enabled)  
**Primary Dependencies**:
- TailwindCSS 3.4+ (CSS variables support)
- shadcn/ui components (theme integration)
- Next.js 14+ (App Router for globals.css)
- CSS custom properties (native browser support)

**Storage**: N/A (theme is frontend-only, no data persistence)  
**Testing**: Visual regression testing (manual verification), accessibility testing tools (WCAG contrast checkers)  
**Target Platform**: Web browsers (desktop and tablet, mobile nice-to-have)  
**Project Type**: Web application (Next.js full-stack, frontend theme layer)  
**Performance Goals**:
- Theme tokens load instantly (CSS variables, no runtime overhead)
- Zero performance impact on component rendering
- CSS bundle size impact minimal (<5KB additional CSS)

**Constraints**:
- Must work with existing shadcn/ui component library
- Must support existing TailwindCSS configuration
- CSS variables must be compatible with HSL color format (shadcn/ui standard)
- Theme must be extensible for future dark mode support
- All color combinations must meet WCAG AA (normal text) and WCAG AAA (critical interactive elements)

**Scale/Scope**:
- Single theme version (v0) for MVP
- Support for all existing and future UI components
- Documentation accessible to all developers
- Theme structure must support 100+ components without performance degradation

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Principle I: MVP First, Extensible Later

✅ **PASS**: Theme v0 provides minimal viable color palette and spacing system. Structure is extensible for future enhancements (dark mode, additional tokens) without breaking existing components. Focus on core tokens (primary, secondary, background, foreground, border, muted) plus component states.

### Principle II: Clear Separation of Concerns

✅ **PASS**: Theme implementation maintains clear boundaries:
- CSS variables (globals.css) separate from component logic
- Theme tokens (design system) separate from component implementation
- Documentation (Markdown) separate from code
- TailwindCSS configuration separate from component styles

### Principle III: API and Data Model Are the Source of Truth

✅ **N/A**: This principle applies to data entities. Theme is a frontend design system concern and does not involve backend data models.

### Principle IV: Safety and Privacy by Default

✅ **PASS**: Theme does not expose sensitive data. All theme tokens are visual design elements only. Accessibility requirements (WCAG compliance) ensure inclusive design.

### Principle V: Predictable UX & Simple Flows

✅ **PASS**: Unified theme ensures consistent visual experience across all pages and components. Developers can easily reference theme documentation to maintain consistency. Semantic token names (small, medium, large) make usage intuitive.

**Overall Status**: ✅ **PASS** - All applicable principles satisfied. Theme implementation aligns with project architecture and UX guidelines.

## Project Structure

### Documentation (this feature)

```text
specs/002-base-theme-colors/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

<!--
-->

```text
app/
└── globals.css          # CSS variables for theme (updated)

tailwind.config.ts       # TailwindCSS theme extension (updated)

design/
└── tokens.md            # Theme documentation (new file)
```

**Structure Decision**: Web application structure (Next.js App Router). Theme implementation involves:
- CSS variables in `app/globals.css` (existing file, to be updated with new theme tokens)
- TailwindCSS configuration in `tailwind.config.ts` (existing file, to be updated with theme extensions)
- Theme documentation in `design/tokens.md` (new file per spec requirement FR-008)

**Note**: Existing `app/globals.css` already contains `--radius: 0.5rem` and `tailwind.config.ts` already has borderRadius configuration using `var(--radius)`. These will be preserved and aligned with new theme tokens.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
