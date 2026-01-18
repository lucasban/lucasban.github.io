# Shared Styles

This directory contains shared stylesheets for common components across the site.

## detector-base.css

Base styles for day detector pages. Provides consistent navigation and theme toggle structure while preserving each detector's unique personality.

### Usage

1. Import the base stylesheet in your detector's HTML:
```html
<link rel="stylesheet" href="../shared/detector-base.css?v=1">
<link rel="stylesheet" href="style.css?v=6">
```

2. Define customization properties in your detector's CSS:
```css
:root {
    /* Your custom colors */
    --link-color: #3ab5aa;
    --bg-primary: #1e1b18;

    /* Base stylesheet overrides (optional) */
    --detector-link-color: var(--link-color);
    --detector-link-bg: rgba(255, 255, 255, 0.1);
    --detector-link-border: 1.5px solid rgba(26, 122, 114, 0.3);
    --detector-toggle-bg: var(--bg-primary);
    --detector-toggle-border: 1.5px solid var(--link-color);
    --detector-toggle-button-hover: rgba(255, 255, 255, 0.15);
    --detector-toggle-button-active: rgba(255, 255, 255, 0.2);
}
```

3. Remove duplicate theme toggle and home link CSS from your detector's stylesheet

### Benefits

- **Consistency**: Navigation components work the same across all detectors
- **Maintainability**: Update common styles in one place
- **Accessibility**: Centralized reduced-motion handling
- **Flexibility**: Customize appearance via CSS custom properties

### Migration

Existing detectors can be migrated individually to use the base. This is optional - detectors with unique navigation styling can continue using custom CSS.

### Custom Properties

The base stylesheet uses these custom properties (with fallbacks):

- `--detector-link-color` - Home link text color (fallback: `--link-color`)
- `--detector-link-bg` - Home link background (fallback: transparent)
- `--detector-link-border` - Home link border (fallback: none)
- `--detector-toggle-bg` - Theme toggle background
- `--detector-toggle-border` - Theme toggle border
- `--detector-toggle-button-hover` - Button hover state
- `--detector-toggle-button-active` - Button active state
