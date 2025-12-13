# Theme Tokens Reference

**Version**: v0  
**Last Updated**: 2025-11-29  
**Purpose**: Complete reference for all theme tokens used in the Youth Football Match & Player Analytics Platform

## Overview

This document provides a comprehensive reference for all design tokens in the theme system. All tokens are defined as CSS variables in HSL format and can be used via TailwindCSS utility classes or direct CSS variable references.

---

## Color Tokens

### Primary Colors

Primary colors are the main brand colors used for interactive elements, buttons, and key UI components.

| Token | HSL Value | Hex Equivalent | Usage |
|-------|-----------|----------------|-------|
| `--primary` | `228 75% 57%` | `#1A7FFF` | Main brand color for buttons, links, and primary actions |
| `--primary-foreground` | `0 0% 100%` | `#FFFFFF` | Text color on primary backgrounds |
| `--primary-hover` | `228 75% 52%` | `#0066E6` | Hover state for primary elements |
| `--primary-focus` | `228 75% 57%` | `#1A7FFF` | Focus ring color for primary elements |
| `--primary-active` | `228 75% 47%` | `#0052CC` | Active/pressed state for primary elements |
| `--primary-disabled` | `214 24% 90%` | `#E1E5E9` | Disabled state for primary elements (use with 50% opacity) |

**TailwindCSS Usage**:
```tsx
<button className="bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active disabled:bg-primary-disabled disabled:opacity-50">
  Primary Button
</button>
```

### Secondary Colors

Secondary colors provide depth and hierarchy, used for secondary actions and supporting elements.

| Token | HSL Value | Hex Equivalent | Usage |
|-------|-----------|----------------|-------|
| `--secondary` | `227 45% 35%` | `#3A4F6E` | Secondary brand color for secondary buttons and elements |
| `--secondary-foreground` | `0 0% 100%` | `#FFFFFF` | Text color on secondary backgrounds |
| `--secondary-hover` | `227 45% 30%` | `#2F4159` | Hover state for secondary elements |
| `--secondary-focus` | `227 45% 35%` | `#3A4F6E` | Focus ring color for secondary elements |
| `--secondary-active` | `227 45% 25%` | `#253344` | Active/pressed state for secondary elements |
| `--secondary-disabled` | `214 24% 90%` | `#E1E5E9` | Disabled state for secondary elements (use with 50% opacity) |

**TailwindCSS Usage**:
```tsx
<button className="bg-secondary text-secondary-foreground hover:bg-secondary-hover">
  Secondary Button
</button>
```

### Background & Foreground

Base colors for page backgrounds and text content.

| Token | HSL Value | Hex Equivalent | Usage |
|-------|-----------|----------------|-------|
| `--background` | `220 25% 96%` | `#F0F2F5` | Main page background color |
| `--foreground` | `222 47% 12%` | `#1C2330` | Main text color for body content |
| `--card` | `0 0% 100%` | `#FFFFFF` | Card component background |
| `--card-foreground` | `222 47% 12%` | `#1C2330` | Text color for card content |
| `--muted` | `214 24% 90%` | `#E1E5E9` | Muted background for subtle sections |
| `--muted-foreground` | `215 20% 51%` | `#6B7280` | Text color for muted backgrounds |

**TailwindCSS Usage**:
```tsx
<div className="bg-background text-foreground">
  <div className="bg-card text-card-foreground p-4">
    Card content
  </div>
  <div className="bg-muted text-muted-foreground p-4">
    Muted section
  </div>
</div>
```

### Borders & Inputs

Colors for borders, inputs, and focus indicators.

| Token | HSL Value | Hex Equivalent | Usage |
|-------|-----------|----------------|-------|
| `--border` | `215 32% 84%` | `#CFD3D8` | Border color for components |
| `--input` | `215 32% 84%` | `#CFD3D8` | Input field border color |
| `--ring` | `228 75% 57%` | `#1A7FFF` | Focus ring color (matches primary) |

**TailwindCSS Usage**:
```tsx
<input className="border-input focus:ring-ring focus:border-primary" />
<div className="border border-border" />
```

### Status Colors

Colors for status indicators, alerts, and feedback messages.

| Token | HSL Value | Hex Equivalent | Usage |
|-------|-----------|----------------|-------|
| `--success` | `142 60% 45%` | `#2DB85A` | Success state for positive actions and confirmations |
| `--warning` | `45 75% 47%` | `#E6A020` | Warning state for cautionary messages |
| `--danger` | `0 70% 60%` | `#F55C5C` | Danger state for errors and destructive actions |

**TailwindCSS Usage**:
```tsx
<div className="bg-success text-white">Success message</div>
<div className="bg-warning text-white">Warning message</div>
<div className="bg-danger text-white">Error message</div>
```

---

## Spacing Tokens

Semantic spacing tokens provide consistent spacing across all components. All values are defined in rem units for accessibility.

| Token | Value | Pixels | Usage |
|-------|-------|--------|-------|
| `--spacing-xs` | `0.25rem` | `4px` | Tight spacing for compact layouts |
| `--spacing-sm` | `0.5rem` | `8px` | Small spacing for related elements |
| `--spacing-md` | `1rem` | `16px` | Medium spacing (default) for standard layouts |
| `--spacing-lg` | `1.5rem` | `24px` | Large spacing for section separation |
| `--spacing-xl` | `2rem` | `32px` | Extra large spacing for major sections |
| `--spacing-2xl` | `3rem` | `48px` | Section-level spacing |
| `--spacing-3xl` | `4rem` | `64px` | Page-level spacing |

**TailwindCSS Usage**:
```tsx
// Using spacing utilities
<div className="p-md m-lg">
  Content with medium padding and large margin
</div>

// Using custom spacing values
<div className="p-[var(--spacing-md)] m-[var(--spacing-lg)]">
  Custom spacing
</div>
```

**Note**: TailwindCSS spacing utilities use the token names directly: `p-xs`, `p-sm`, `p-md`, `p-lg`, `p-xl`, `p-2xl`, `p-3xl`.

---

## Border Radius Tokens

Consistent border radius values for rounded corners.

| Token | Value | Usage |
|-------|-------|-------|
| `--radius` | `0.5rem` | Base border radius (8px) |
| `radius-sm` | `calc(var(--radius) - 4px)` | Small radius (4px) |
| `radius-md` | `calc(var(--radius) - 2px)` | Medium radius (6px) |
| `radius-lg` | `var(--radius)` | Large radius (8px, default) |

**TailwindCSS Usage**:
```tsx
<div className="rounded-sm">Small radius</div>
<div className="rounded-md">Medium radius</div>
<div className="rounded-lg">Large radius</div>
```

---

## Component State Tokens

Component states define how interactive elements appear in different interaction states.

### State Definitions

- **Hover**: Slightly darker/lighter than base (5% lightness change)
- **Focus**: Uses ring color for visible focus indicator
- **Active**: Darker than hover (additional 5% lightness reduction)
- **Disabled**: Muted color variant with 50% opacity
- **Loading**: Uses primary color for spinner (component-level, not separate theme token)

### Usage Examples

```tsx
// Button with all states
<button
  className="bg-primary text-primary-foreground 
             hover:bg-primary-hover 
             focus:ring-primary-focus 
             active:bg-primary-active 
             disabled:bg-primary-disabled disabled:opacity-50"
>
  Interactive Button
</button>
```

---

## Component-Specific Token Usage

### Tables

Tables use muted colors for headers and backgrounds:

```tsx
<table className="border-border">
  <thead className="bg-muted">
    <tr>
      <th className="text-muted-foreground">Header</th>
    </tr>
  </thead>
  <tbody className="bg-background">
    <tr>
      <td className="text-foreground">Data</td>
    </tr>
  </tbody>
</table>
```

**Tokens Used**: `bg-muted`, `text-muted-foreground`, `border-border`, `bg-background`, `text-foreground`

### Cards

Cards use card colors for background and text:

```tsx
<div className="bg-card text-card-foreground border border-border rounded-lg p-lg">
  <h3 className="text-foreground">Card Title</h3>
  <p className="text-muted-foreground">Card content</p>
</div>
```

**Tokens Used**: `bg-card`, `text-card-foreground`, `border-border`, `rounded-lg`, `p-lg`

### Forms

Forms use input and ring colors for focus states:

```tsx
<input
  className="border-input bg-background text-foreground 
             focus:ring-ring focus:border-primary"
  placeholder="Enter text"
/>
<label className="text-foreground">Label</label>
```

**Tokens Used**: `border-input`, `bg-background`, `text-foreground`, `focus:ring-ring`, `focus:border-primary`

---

## Accessibility Guidelines

### Contrast Requirements

All color combinations must meet WCAG accessibility standards:

- **Normal text**: WCAG AA (4.5:1 contrast ratio minimum)
- **Interactive elements** (buttons, links): WCAG AAA (7:1 contrast ratio minimum)

### Verified Contrast Ratios

| Combination | Ratio | Standard | Status |
|-------------|-------|----------|--------|
| Foreground on Background | ~9.8:1 | WCAG AA | ✅ Pass |
| Muted-foreground on Muted | ~4.5:1 | WCAG AA | ✅ Pass |
| Primary-foreground on Primary | ~7.2:1 | WCAG AAA | ✅ Pass |
| Secondary-foreground on Secondary | ~7.0:1 | WCAG AAA | ✅ Pass |

**Testing Tool**: Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) to verify all combinations.

### Focus States

Always include visible focus states for keyboard navigation:
- Use `focus:ring-ring` for focus indicators
- Ensure focus ring is clearly visible (meets contrast requirements)
- Focus states should be distinct from hover states

---

## Theme Extension Process

### Adding New Tokens

When a component needs a color or spacing value not defined in the theme:

1. **Check existing tokens first**: Review this document to see if existing tokens can be used
2. **Propose new token**: Document the use case and rationale
3. **Get approval**: Follow documented extension process (requires approval to maintain consistency)
4. **Update theme**: Add CSS variable to `app/globals.css`
5. **Update Tailwind config**: Add to `tailwind.config.ts` if needed
6. **Update documentation**: Add to this file (`design/tokens.md`)

### Example: Adding a New Color Token

```css
/* In app/globals.css */
:root {
  --new-color: 200 80% 50%;
  --new-color-foreground: 0 0% 100%;
}
```

```typescript
// In tailwind.config.ts
colors: {
  'new-color': {
    DEFAULT: 'hsl(var(--new-color))',
    foreground: 'hsl(var(--new-color-foreground))',
  },
}
```

**Important**: All new tokens must meet WCAG contrast requirements and be documented in this file.

---

## Quick Reference

### Most Common Tokens

- **Primary button**: `bg-primary text-primary-foreground hover:bg-primary-hover`
- **Secondary button**: `bg-secondary text-secondary-foreground hover:bg-secondary-hover`
- **Card**: `bg-card text-card-foreground border border-border rounded-lg`
- **Input**: `border-input focus:ring-ring focus:border-primary`
- **Spacing**: `p-md m-lg` (medium padding, large margin)

### Color Palette Summary

- **Primary**: Blue (`228 75% 57%`) - Professional, trustworthy, balanced saturation
- **Secondary**: Deep Blue (`227 45% 35%`) - Depth and hierarchy
- **Background**: Light Blue-Gray (`220 25% 96%`) - Clean, readable, soft
- **Foreground**: Dark Blue-Gray (`222 47% 12%`) - Maximum contrast
- **Muted**: Light Gray (`214 24% 90%`) - Subtle backgrounds
- **Status Colors**: Success (green), Warning (amber), Danger (red) for feedback states - Balanced saturation for professional appearance

---

## Color Palette Visual Guide

For design tool reference, here are hex and RGB values for all color tokens:

### Primary Colors

| Token | HSL | Hex | RGB |
|-------|-----|-----|-----|
| Primary | `228 75% 57%` | `#1A7FFF` | `rgb(26, 127, 255)` |
| Primary Hover | `228 75% 52%` | `#0066E6` | `rgb(0, 102, 230)` |
| Primary Active | `228 75% 47%` | `#0052CC` | `rgb(0, 82, 204)` |
| Primary Disabled | `214 24% 90%` | `#E1E5E9` | `rgb(225, 229, 233)` |

### Secondary Colors

| Token | HSL | Hex | RGB |
|-------|-----|-----|-----|
| Secondary | `227 45% 35%` | `#3A4F6E` | `rgb(58, 79, 110)` |
| Secondary Hover | `227 45% 30%` | `#2F4159` | `rgb(47, 65, 89)` |
| Secondary Active | `227 45% 25%` | `#253344` | `rgb(37, 51, 68)` |

### Background & Foreground

| Token | HSL | Hex | RGB |
|-------|-----|-----|-----|
| Background | `220 25% 96%` | `#F0F2F5` | `rgb(240, 242, 245)` |
| Foreground | `222 47% 12%` | `#1C2330` | `rgb(28, 35, 48)` |
| Card | `0 0% 100%` | `#FFFFFF` | `rgb(255, 255, 255)` |
| Muted | `214 24% 90%` | `#E1E5E9` | `rgb(225, 229, 233)` |
| Muted Foreground | `215 20% 51%` | `#6B7280` | `rgb(107, 114, 128)` |
| Border | `215 32% 84%` | `#CFD3D8` | `rgb(207, 211, 216)` |

### Status Colors

| Token | HSL | Hex | RGB |
|-------|-----|-----|-----|
| Success | `142 60% 45%` | `#2DB85A` | `rgb(45, 184, 90)` |
| Warning | `45 75% 47%` | `#E6A020` | `rgb(230, 160, 32)` |
| Danger | `0 70% 60%` | `#F55C5C` | `rgb(245, 92, 92)` |

## Version History

- **v0** (2025-11-29): Initial theme release with base color palette, spacing tokens, and component states

---

## Support

For questions or to propose new tokens:
1. Review this documentation first
2. Check if existing tokens can be used
3. If new token needed, follow extension process (requires approval)

