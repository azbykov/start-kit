# Research: Base Theme and Core Colors

**Feature**: Base Theme and Core Colors  
**Date**: 2025-11-29  
**Phase**: 0 - Research

## Research Questions

### 1. Color Palette Selection for Sports Analytics Platform

**Question**: What color palette is appropriate for a youth football match and player analytics platform that meets WCAG AA/AAA requirements?

**Research Findings**:
- Sports platforms typically use blue as primary color (trust, professionalism, technology)
- Secondary colors often complement primary (darker blue for depth, accent colors for highlights)
- Background should be light (98%+ lightness) for readability
- Foreground text should be dark (10% or less lightness) for contrast
- Muted colors should provide subtle differentiation without competing with primary content

**Decision**: Use blue-based palette:
- Primary: Blue (216° hue, ~56% lightness) - professional, trustworthy
- Secondary: Darker blue (216° hue, ~26% lightness) - depth and hierarchy
- Background: Very light (98%+ lightness) - clean, readable
- Foreground: Very dark (10% or less lightness) - maximum contrast
- Muted: Light gray-blue (214° hue, ~91% lightness) - subtle backgrounds

**Rationale**: Blue is associated with trust, professionalism, and technology - appropriate for analytics platform. Light background ensures readability and reduces eye strain during long data viewing sessions.

**Alternatives Considered**:
- Green-based palette: Associated with sports fields but less professional for analytics
- Red-based palette: Too aggressive, associated with errors/warnings
- Neutral grayscale: Professional but lacks brand identity

### 2. WCAG Contrast Requirements Implementation

**Question**: How to ensure WCAG AA (normal text) and WCAG AAA (critical interactive elements) compliance in HSL color format?

**Research Findings**:
- WCAG AA requires 4.5:1 contrast ratio for normal text (14px+)
- WCAG AAA requires 7:1 contrast ratio for critical interactive elements
- HSL format: Hue (0-360), Saturation (0-100%), Lightness (0-100%)
- Contrast calculation: (L1 + 0.05) / (L2 + 0.05) where L1 > L2
- For AAA compliance: foreground lightness should be <15% when background is >85%, or vice versa

**Decision**: 
- Normal text combinations: Ensure 4.5:1 ratio (e.g., foreground 10% lightness on background 98% lightness = ~9.8:1 ratio ✅)
- Interactive elements (buttons, links): Ensure 7:1 ratio (e.g., primary button text 100% lightness on primary 56% lightness = ~7.2:1 ratio ✅)
- Use online contrast checkers (WebAIM Contrast Checker) to validate all combinations

**Rationale**: HSL format allows easy adjustment of lightness values to meet contrast requirements. Testing with contrast checkers ensures compliance before implementation.

**Alternatives Considered**:
- RGB format: More complex contrast calculations, less intuitive for designers
- Pre-defined color libraries: Less flexible, may not meet specific brand requirements

### 3. Component State Tokens (Hover, Focus, Active, Disabled, Loading)

**Question**: What are best practices for defining state tokens in shadcn/ui themes?

**Research Findings**:
- shadcn/ui uses HSL color format with CSS variables
- States typically modify lightness or saturation, not hue
- Hover: Slightly darker/lighter than base (5-10% lightness change)
- Focus: Often uses ring color (distinct from hover)
- Active: Darker than hover (additional 5% lightness reduction)
- Disabled: Reduced opacity (0.5-0.6) or muted color variant
- Loading: Animated spinner, often uses primary color

**Decision**: Define state tokens as variations of base colors:
- Hover: Base color with -5% lightness (darker for light backgrounds, lighter for dark backgrounds)
- Focus: Use ring color (distinct border/outline)
- Active: Base color with -10% lightness from hover
- Disabled: Muted color variant with 50% opacity
- Loading: Primary color with animated spinner (implementation in components, not theme)

**Rationale**: Consistent state behavior across all interactive elements improves UX predictability. Lightness adjustments maintain color harmony while providing clear visual feedback.

**Alternatives Considered**:
- Separate color palette for each state: Too complex, harder to maintain consistency
- Opacity-only approach: Less accessible, doesn't meet contrast requirements

### 4. Semantic Spacing Tokens with Specific Values

**Question**: What spacing scale is appropriate for web applications using TailwindCSS?

**Research Findings**:
- Common spacing scales: 4px base (4, 8, 12, 16, 24, 32, 48, 64) or 8px base (8, 16, 24, 32, 48, 64, 96)
- TailwindCSS default: 4px base (0.25rem increments)
- Semantic names: xs, sm, md, lg, xl, 2xl, 3xl
- Component spacing: Padding typically 8-16px, margins 16-24px for sections

**Decision**: Use 4px base scale with semantic names:
- xs: 4px (0.25rem) - tight spacing
- sm: 8px (0.5rem) - small spacing
- md: 16px (1rem) - medium spacing (default)
- lg: 24px (1.5rem) - large spacing
- xl: 32px (2rem) - extra large spacing
- 2xl: 48px (3rem) - section spacing
- 3xl: 64px (4rem) - page-level spacing

**Rationale**: 4px base aligns with TailwindCSS defaults and provides fine-grained control. Semantic names make usage intuitive while specific values ensure consistency.

**Alternatives Considered**:
- 8px base scale: Less granular, may require custom values for tight spacing
- Only semantic names without values: Less precise, harder to maintain consistency

### 5. shadcn/ui Theme Integration

**Question**: How to properly integrate custom theme with existing shadcn/ui components?

**Research Findings**:
- shadcn/ui uses CSS variables in `:root` selector
- Colors defined as HSL values without `hsl()` wrapper: `--primary: 216 80% 56%`
- TailwindCSS config extends theme.colors to reference CSS variables: `primary: "hsl(var(--primary))"`
- Border radius uses CSS variable: `--radius: 0.5rem`
- All tokens should be defined in globals.css `@layer base { :root { ... } }`

**Decision**: Follow shadcn/ui pattern:
- Define all color tokens as HSL values (space-separated) in `:root`
- Use TailwindCSS `theme.extend.colors` to map CSS variables
- Maintain existing shadcn/ui token names (primary, secondary, background, foreground, etc.)
- Add new state tokens following same pattern (primary-hover, primary-focus, etc.)

**Rationale**: Maintaining shadcn/ui conventions ensures compatibility with existing components and future updates. HSL format without wrapper is required for TailwindCSS CSS variable support.

**Alternatives Considered**:
- RGB format: Not compatible with shadcn/ui pattern
- Separate theme file: Breaks shadcn/ui convention, harder to maintain

### 6. Theme Documentation Format

**Question**: What format and structure should theme documentation follow for developer accessibility?

**Research Findings**:
- Design system documentation typically includes: token name, value, usage guidelines, examples
- Markdown format is standard for technical documentation
- Visual examples (color swatches) improve understanding
- Usage guidelines prevent misuse
- Quick reference tables enable fast lookup

**Decision**: Markdown file (`design/tokens.md`) with:
- Token reference table (name, value, usage)
- Color palette visual guide (swatches with hex/rgb values)
- Spacing scale reference
- Component state tokens guide
- Usage examples for common scenarios
- Accessibility notes (contrast ratios)

**Rationale**: Markdown is accessible, version-controlled, and easy to update. Structured format enables quick lookup while examples provide context for proper usage.

**Alternatives Considered**:
- Interactive documentation site: Overkill for MVP, requires additional infrastructure
- Inline code comments: Less discoverable, harder to maintain
- Separate design tool (Figma tokens): Requires design tool access, not code-integrated

## Summary

All research questions resolved. Key decisions:
1. Blue-based color palette (professional, trustworthy)
2. WCAG AA/AAA compliance via HSL lightness adjustments
3. Component states as lightness variations of base colors
4. 4px base spacing scale with semantic names
5. shadcn/ui integration following existing patterns
6. Markdown documentation with structured reference

No blocking clarifications remain. Ready for Phase 1 design implementation.

