# Lucas's GitHub Pages Site

Personal website hosted at https://lucasban.github.io

## Project Structure

```
/
├── index.html              # Landing page (bio + links)
├── style.css               # Mid-Century Modern design system
├── theme-toggle.js         # Theme switcher (light/dark/auto)
├── VERSIONS.md             # Cache busting version tracking
├── shared/
│   ├── detector-base.css   # Base styles for day detectors (optional)
│   └── README.md           # Shared styles documentation
├── photos/
│   ├── index.html          # Photo gallery
│   └── gallery.js          # Bluesky API + lightbox
├── demos/
│   ├── index.html          # Demo hub
│   ├── canvas/
│   │   ├── gravity/        # Orbital gravity simulator
│   │   └── game-of-life/   # Conway's cellular automaton
│   ├── api/
│   │   └── weather-haiku/  # Weather to poetry (Open-Meteo API)
│   ├── palette/            # Color palette generator
│   ├── typing-test/        # Typing speed test
│   └── cost-per-wear/      # Wardrobe value calculator
└── *-detector/             # Day detector mini-apps (7 dirs)
```

## Design System

**Style**: Mid-Century Modern - "Sunlit Den" (light) / "Evening Greenhouse" (dark)
- **Light mode colors**:
  - Background: #f0e9df (warm beige)
  - Text: #3d3632 (dark brown)
  - Links: #2d6a4f (deep green)
  - Accents: Greenery palette with sage, wood, and rust tones
- **Dark mode**: Automatic via `prefers-color-scheme` or manual toggle
  - Background: #1a1f1c (deep forest)
  - Text: #e8e2db (warm white)
  - Links: #52b788 (bright green)
  - Accents: Brightened greenery palette
- **Theme toggle**: Sun/moon/auto icons in top-right corner, persists via localStorage
- **Typography**:
  - Body: DM Sans
  - Headings: Playfair Display
  - Code: JetBrains Mono
- **Layout**: Max 750px container, rounded corners, warm botanical color palette

## Day Detectors

Each detector is a standalone mini-app with a unique theme:

- **Sunday**: Sunday Scaries - mood shifts from peaceful morning to evening dread
- **Monday**: Existential glitch theme with CSS glitch effects
- **Tuesday**: Otter mascot (happy/sad based on day)
- **Wednesday**: "It is Wednesday my dudes" frog meme
- **Thursday**: Button reveal with countdown to Thursday
- **Friday**: Satirical "premium plan" uncertainty
- **Saturday**: Party mode with confetti and disco effects

**Optional**: New detectors can use `shared/detector-base.css` for consistent navigation and theme toggle structure while maintaining unique styling. See `shared/README.md` for details.

## Demos

### Canvas
- **Digital Plant**: Tamagotchi-style fractal tree that grows over real-time days. Features naming, watering (localStorage), health-based mood, flowering, and animated critters.
- **Gravity**: Click-and-drag to launch bodies, watch them orbit and attract

- **Game of Life**: Cellular automaton with presets (glider, pulsar, gosper gun)

### API (no auth required)
- **Weather Haiku**: Generates poetry from current weather conditions

### Fun
- **Typing Test**: 60-second typing speed and accuracy test
- **Color Palette**: Generate harmonious color schemes

### Tools
- **Cost Per Wear**: Calculate wardrobe value with wear frequency/season estimator

## Photo Gallery

- Fetches photos from Bluesky (@lucasban.com) via AT Protocol API
- CSS Grid layout with vanilla JS lightbox
- Keyboard navigation (arrows, escape)
- Lazy loading images
- No authentication required (public API)

## Conventions

- **Pre-Work Check**: Always open `tests/index.html` in a browser or review `tests/` before making core changes. Ensure the codebase is stable.
- No build process - plain HTML/CSS/JS
- All pages include inline HTML navigation
- Day detection uses `new Date().getDay()` (0=Sunday, 6=Saturday)
- **Cache busting**: CSS/JS files use `?v=N` query strings
  - Global resources (style.css, theme-toggle.js) share a version number - update everywhere when changed
  - Page-specific resources use independent versions - update only where used
  - See `VERSIONS.md` for current versions and update procedures

## Deployment

Push to `main` branch - GitHub Pages deploys automatically.

## Recent Activity (2026-01-18)

- **Easter Eggs**:
    - **Interactive Decoration**: Added clickable plant emoji (🌿) to all 7 day detectors with bounce animation, plant pun tooltips, emoji evolution stages (🌱→🌿→🪴→🌳→🌻), and floating emoji particles.
- **Bug Fixes**:
    - **Confetti Animation**: Added missing `.confetti` base CSS and `@keyframes confettiFall` animation to `shared/detector-base.css`. Fixed Thursday/Friday/Saturday detector confetti.
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
- **Detector Refactoring**: Created `shared/detector-utils.js` to centralize date logic and UI initialization across all 7 day detectors.
- **Gallery Improvements**: Added retry logic and improved error handling for Bluesky photo fetching.
- **Standardization**: Updated `.gitignore` to include `.gemini/` and created `GEMINI.md`.
