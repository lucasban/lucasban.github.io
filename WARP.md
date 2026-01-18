# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Overview

Personal static website hosted at https://lucasban.github.io. No build process — plain HTML, CSS, and vanilla JavaScript.

## Development

- **Local preview**: Open any `.html` file directly in browser, or use `python3 -m http.server` for proper routing
- **Deploy**: Push to `main` — GitHub Pages deploys automatically
- **Tests**: Open `tests/index.html` to run the vanilla JS test suite. Always check this before major changes.
- **Cache busting**: CSS/JS files use `?v=N` query strings
  - Global resources (style.css, theme-toggle.js) use shared version — update everywhere
  - Page-specific resources use independent versions — update only where used
  - See `VERSIONS.md` for current versions and bash commands to bump versions site-wide

## Architecture

**Design System** (`style.css`):
- Mid-Century Modern "Sunlit Den" (light) / "Evening Greenhouse" (dark) theme
- Dark mode: automatic via `prefers-color-scheme`, plus manual toggle via `data-theme` attribute
- Light colors: warm beige bg (`#f0e9df`), dark brown text (`#3d3632`), deep green links (`#2d6a4f`)
- Dark colors: deep forest bg (`#1a1f1c`), warm white text (`#e8e2db`), bright green links (`#52b788`)
- Greenery palette: sage, wood tones, and rust accents
- Layout: 750px max-width container

**Day Detectors** (`*-detector/`):
- 7 standalone mini-apps, one per day of the week
- **Shared Logic**: `shared/detector-utils.js` handles date checking and UI initialization
- **Shared Styles**: `shared/detector-base.css` provides consistent nav/toggle structure
- Each has unique theme/personality (Sunday Scaries, Wednesday frog meme, Saturday party mode, etc.)

**Demos** (`demos/`):
- Canvas experiments: Digital Plant (Tamagotchi-style fractal tree with naming/critters), gravity simulator, Game of Life
- API integrations: weather haiku (Open-Meteo, no auth)
- Utilities: typing test, color palette generator, cost-per-wear calculator

**Photo Gallery** (`photos/`):
- Fetches from Bluesky via AT Protocol API (no auth required)
- CSS Grid layout with vanilla JS lightbox, keyboard navigation
- Includes JSDoc typing and error retry logic

## Conventions

- **Pre-Work Check**: Always open `tests/index.html` in a browser or review `tests/` before making core changes.
- All pages include inline HTML navigation (no shared template system)
- Theme toggle component: 3-button (☀️/🌙/💻) with localStorage persistence
- Typography: DM Sans for body text, Playfair Display for headings, JetBrains Mono for code
- Google Fonts loaded on each page

## Recent Activity (2026-01-18)

- **Feature Expansion**:
    - **Digital Plant (v2)**: Added plant naming, animated ladybugs, healthy blooming flowers, and a real-time day/night background cycle.
    - **Digital Plant (v1)**: Created persistent fractal tree demo with localStorage health/age tracking.
    - **Weather Haiku**: Expanded poem library, fixed CSS inconsistencies, and added a "Regenerate" button.
    - **Detector History**: Added "Last verified" tracking to all 7 day detectors via `shared/detector-utils.js`.
- **Interactive Polish**:
    - Implemented **View Transitions API** for smooth morphing between pages.
    - Added **Skeleton Loading** shimmering placeholders to the photo gallery.
    - Enhanced **Micro-interactions** with tactile hover/active animations for links and buttons.
- **Robust Engineering**: Added `.editorconfig` for consistent formatting.
- **Testing**: Created a vanilla JS test framework in `tests/` with unit tests for `detector-utils.js`.
- **Type Safety**: Added JSDoc annotations to `shared/detector-utils.js` and `photos/gallery.js`.
- **CSS Consolidation**: Merged root `detector-base.css` into `shared/detector-base.css` with variable fallbacks. Updated all detectors.
- **Detector Refactoring**: Created `shared/detector-utils.js` to centralize date logic.
- **Gallery Improvements**: Added retry logic and improved error handling.