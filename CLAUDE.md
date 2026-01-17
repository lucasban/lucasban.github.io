# Lucas's GitHub Pages Site

Personal website hosted at https://lucasban.github.io

## Project Structure

```
/
├── index.html              # Landing page (bio + links)
├── style.css               # Solarized sepia design system
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

**Style**: Warm sepia, Solarized Light/Dark
- **Colors**: Sepia bg (#fdf6e3), muted text (#657b83), blue links (#268bd2)
- **Dark mode**: Automatic via `prefers-color-scheme`, uses Solarized Dark (#002b36)
- **Typography**: Helvetica throughout, Courier for code
- **Layout**: Max 750px container, rounded corners, warm color palette

## Day Detectors

Each detector is a standalone mini-app with a unique theme:

- **Sunday**: Sunday Scaries - mood shifts from peaceful morning to evening dread
- **Monday**: Existential glitch theme with CSS glitch effects
- **Tuesday**: Otter mascot (happy/sad based on day)
- **Wednesday**: "It is Wednesday my dudes" frog meme
- **Thursday**: Button reveal with countdown to Thursday
- **Friday**: Satirical "premium plan" uncertainty
- **Saturday**: Party mode with confetti and disco effects

## Demos

### Canvas
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

- No build process - plain HTML/CSS/JS
- All pages include inline HTML navigation
- Day detection uses `new Date().getDay()` (0=Sunday, 6=Saturday)
- **Cache busting**: CSS/JS files use `?v=N` query strings. Bump the version number when making changes to ensure browsers fetch fresh files.

## Deployment

Push to `main` branch - GitHub Pages deploys automatically.
