# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Overview

Personal static website hosted at https://lucasban.github.io. No build process — plain HTML, CSS, and vanilla JavaScript.

## Development

- **Local preview**: Open any `.html` file directly in browser, or use `python3 -m http.server` for proper routing
- **Deploy**: Push to `main` — GitHub Pages deploys automatically
- **Cache busting**: CSS/JS files use `?v=N` query strings. Bump version number when making changes (e.g., `style.css?v=5` → `style.css?v=6`)

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
- Each has unique theme/personality (Sunday Scaries, Wednesday frog meme, Saturday party mode, etc.)
- Day detection: `new Date().getDay()` (0=Sunday, 6=Saturday)

**Demos** (`demos/`):
- Canvas experiments: gravity simulator, Game of Life
- API integrations: weather haiku (Open-Meteo, no auth)
- Utilities: typing test, color palette generator, cost-per-wear calculator

**Photo Gallery** (`photos/`):
- Fetches from Bluesky via AT Protocol API (no auth required)
- CSS Grid layout with vanilla JS lightbox, keyboard navigation

## Conventions

- All pages include inline HTML navigation (no shared template system)
- Theme toggle component: 3-button (☀️/🌙/💻) with localStorage persistence
- Typography: DM Sans for body text, Playfair Display for headings, JetBrains Mono for code
- Google Fonts loaded on each page
