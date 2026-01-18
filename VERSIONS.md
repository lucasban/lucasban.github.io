# Cache Busting Versions

This document tracks cache busting version numbers for CSS and JavaScript files.

## Versioning Convention

**Global Shared Resources** (referenced from multiple pages):
- `/style.css` - Main design system stylesheet
- `/theme-toggle.js` - Theme switcher component

These use a **global version number**. When either file changes, bump the version and update **all references** across the site.

**Page-Specific Resources** (used by one page/section):
- Day detector stylesheets (`*-detector/style.css`)
- Day detector scripts (`*-detector/script.js`)
- Demo scripts (`demos/*/script.js`)
- Photo gallery (`photos/gallery.js`)

These use **independent version numbers**. Only bump when that specific file changes.

## Current Versions

### Global Resources
- `style.css` → **v=8**
- `theme-toggle.js` → **v=3**

### Shared Resources
- `shared/detector-base.css` → **v=1** (Base styles for day detectors)
- `shared/detector-utils.js` → **v=2** (Added history tracking)

### Day Detector Resources
- All detector `style.css` files → **v=6**
- All detector `script.js` files → **v=4** (Refactored to use detector-utils.js)
- `sunday-detector/script.js` → **v=5** (Fix countdown bug)

### Demo Resources
- `demos/canvas/plant/plant.js` → **v=2** (Added critters, flowers, and naming)
- `demos/canvas/gravity/gravity.js` → v=6
- `demos/canvas/game-of-life/game-of-life.js` → v=4
- `demos/api/weather-haiku/weather-haiku.js` → **v=4** (Regenerate button + new poems)
- `demos/typing-test/typing-test.js` → v=3
- `demos/palette/palette.js` → v=3
- `demos/cost-per-wear/cost-per-wear.js` → v=3

### Other Resources
- `photos/gallery.js` → **v=5** (Added retry logic)

## How to Bump Versions

### Global Resources
When modifying `style.css` or `theme-toggle.js`:

1. Update the file
2. Increment the version number in this document
3. Find and replace old version across all HTML files:
   ```bash
   # Example for style.css v=8 → v=9
   find . -name "*.html" -exec sed -i 's/style\.css?v=8/style.css?v=9/g' {} +

   # Example for theme-toggle.js v=3 → v=4
   find . -name "*.html" -exec sed -i 's/theme-toggle\.js?v=3/theme-toggle.js?v=4/g' {} +
   ```
4. Commit changes

### Page-Specific Resources
When modifying a page-specific resource:

1. Update the file
2. Increment the version in its HTML reference(s)
3. Update the version in this document
4. Commit changes

## Notes

- This convention balances simplicity with cache efficiency
- Global resources get invalidated everywhere when changed (rare, high impact)
- Page-specific resources only invalidate their own cache (frequent, low impact)
- No build process required - all manual but documented