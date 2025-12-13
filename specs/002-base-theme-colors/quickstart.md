# Quickstart: Base Theme and Core Colors

**Feature**: Base Theme and Core Colors  
**Date**: 2025-11-29

## Overview

This guide explains how to use the unified theme system in the Youth Football Match & Player Analytics Platform. The theme provides consistent colors, spacing, and styling tokens that ensure visual coherence across all UI components.

## Theme Tokens Reference

### Color Tokens

All color tokens are defined as CSS variables in HSL format. Use them via TailwindCSS classes or direct CSS variable references.

#### Primary Colors

- `primary` - Main brand color (blue, 216° hue, 56% lightness)
- `primary-foreground` - Text color for primary backgrounds (white, 100% lightness)
- `primary-hover` - Hover state (darker blue, 51% lightness)
- `primary-focus` - Focus ring color
- `primary-active` - Active/pressed state (darker blue, 46% lightness)
- `primary-disabled` - Disabled state (muted with 50% opacity)

#### Secondary Colors

- `secondary` - Secondary brand color (dark blue, 216° hue, 26% lightness)
- `secondary-foreground` - Text color for secondary backgrounds (white, 100% lightness)
- `secondary-hover` - Hover state
- `secondary-focus` - Focus ring color
- `secondary-active` - Active state
- `secondary-disabled` - Disabled state

#### Background & Foreground

- `background` - Main page background (very light, 98%+ lightness)
- `foreground` - Main text color (very dark, 10% or less lightness)
- `card` - Card background color
- `card-foreground` - Text color for cards
- `muted` - Muted background (light gray-blue, 91% lightness)
- `muted-foreground` - Text color for muted backgrounds

#### Borders & Inputs

- `border` - Border color (light gray, 85% lightness)
- `input` - Input border color
- `ring` - Focus ring color

### Spacing Tokens

Use semantic spacing tokens for consistent spacing across components:

- `spacing-xs` - 4px (0.25rem) - Tight spacing
- `spacing-sm` - 8px (0.5rem) - Small spacing
- `spacing-md` - 16px (1rem) - Medium spacing (default)
- `spacing-lg` - 24px (1.5rem) - Large spacing
- `spacing-xl` - 32px (2rem) - Extra large spacing
- `spacing-2xl` - 48px (3rem) - Section spacing
- `spacing-3xl` - 64px (4rem) - Page-level spacing

### Border Radius

- `radius-sm` - Small border radius (calc(var(--radius) - 4px))
- `radius-md` - Medium border radius (calc(var(--radius) - 2px))
- `radius-lg` - Large border radius (var(--radius), default 0.5rem)

## Usage Examples

### Using Colors in Components

```tsx
// TailwindCSS classes (recommended)
<button className="bg-primary text-primary-foreground hover:bg-primary-hover">
  Click me
</button>

// Direct CSS variable (if needed)
<div style={{ backgroundColor: 'hsl(var(--primary))' }}>
  Content
</div>
```

### Using Spacing Tokens

```tsx
// TailwindCSS spacing utilities
<div className="p-md m-lg">
  Content with medium padding and large margin
</div>

// Custom spacing values
<div className="p-[var(--spacing-md)]">
  Content with medium padding
</div>
```

### Component States

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

### Tables

```tsx
// Table with theme colors
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

### Cards

```tsx
// Card with theme styling
<div className="bg-card text-card-foreground border border-border rounded-lg p-lg">
  <h3 className="text-foreground">Card Title</h3>
  <p className="text-muted-foreground">Card content</p>
</div>
```

### Forms

```tsx
// Form inputs with theme
<input
  className="border-input bg-background text-foreground 
             focus:ring-ring focus:border-primary"
  placeholder="Enter text"
/>

<label className="text-foreground">Label</label>
```

## Accessibility Guidelines

### Contrast Requirements

- **Normal text**: Must meet WCAG AA (4.5:1 contrast ratio)
- **Interactive elements** (buttons, links): Must meet WCAG AAA (7:1 contrast ratio)

### Testing Contrast

Use online tools to verify contrast:
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Ensure all text/background combinations meet requirements

### Focus States

Always include visible focus states for keyboard navigation:
- Use `focus:ring-ring` for focus indicators
- Ensure focus ring is clearly visible (meets contrast requirements)

## Extending the Theme

### Adding New Tokens

1. **Check existing tokens first**: Review `design/tokens.md` to see if existing tokens can be used
2. **Propose new token**: Document the use case and rationale
3. **Get approval**: Follow documented extension process (requires approval)
4. **Update theme**: Add CSS variable to `app/globals.css`
5. **Update Tailwind config**: Add to `tailwind.config.ts` if needed
6. **Update documentation**: Add to `design/tokens.md`

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

## Common Patterns

### Consistent Component Styling

Always use theme tokens instead of hardcoded values:

```tsx
// ✅ Good - uses theme tokens
<div className="bg-card p-md border border-border rounded-lg">

// ❌ Bad - hardcoded values
<div className="bg-white p-4 border border-gray-300 rounded-lg">
```

### Responsive Spacing

Use spacing tokens consistently across breakpoints:

```tsx
<div className="p-sm md:p-md lg:p-lg">
  Responsive padding with theme tokens
</div>
```

## Documentation

For complete token reference, see:
- **Full documentation**: `design/tokens.md`
- **Theme implementation**: `app/globals.css`
- **TailwindCSS config**: `tailwind.config.ts`

## Support

If you need a color or spacing value not defined in the theme:
1. Check `design/tokens.md` for available tokens
2. Consider if existing tokens can be used
3. If new token needed, follow extension process (requires approval)

