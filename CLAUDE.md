# Lucas's GitHub Pages Site

Personal website hosted at https://lucasban.github.io

## Project Structure

```
/
├── index.html              # Landing page (bio + links)
├── style.css               # Solarized sepia design system
├── photos/
│   ├── index.html          # Photo gallery
│   ├── gallery.js          # Lightbox functionality
│   └── images/             # thumbnails/ and full/ directories
├── demos/
│   ├── index.html          # Demo hub
│   ├── canvas/
│   │   ├── flow-field/     # Perlin noise particle system
│   │   └── game-of-life/   # Conway's cellular automaton
│   ├── api/
│   │   ├── iss-tracker/    # ISS position + astronauts (Open Notify API)
│   │   └── weather-haiku/  # Weather to poetry (Open-Meteo API)
│   └── typing-test/        # Typing speed test
└── *-detector/             # Day detector mini-apps (7 dirs)
```

## Design System

**Style**: Warm sepia, Solarized Light inspired
- **Colors**: Sepia bg (#fdf6e3), muted text (#657b83), blue links (#268bd2)
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
- **Flow Field**: Perlin noise particles with click-to-add attractors
- **Game of Life**: Cellular automaton with presets (glider, pulsar, gosper gun)

### API (no auth required)
- **ISS Tracker**: Real-time ISS position + astronauts in space
- **Weather Haiku**: Generates poetry from current weather conditions

### Fun
- **Typing Test**: 60-second typing speed and accuracy test

## Photo Gallery

- CSS Grid layout with vanilla JS lightbox
- Keyboard navigation (arrows, escape)
- Lazy loading images
- Add photos to `photos/images/thumbnails/` and `photos/images/full/`

## Conventions

- No build process - plain HTML/CSS/JS
- All pages include inline HTML navigation
- Day detection uses `new Date().getDay()` (0=Sunday, 6=Saturday)

## Deployment

Push to `main` branch - GitHub Pages deploys automatically.
