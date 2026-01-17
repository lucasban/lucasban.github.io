# Lucas's GitHub Pages Site

Personal website hosted at https://lucasban.github.io

## Project Structure

```
/
├── index.html          # Main landing page with links to all detectors
├── style.css           # Main page styles
└── *-detector/         # Each day has its own directory
    ├── index.html
    ├── style.css (or styles.css)
    └── script.js
```

## Day Detectors

Each detector is a standalone mini-app with a unique theme:

- **Sunday**: Sunday Scaries - mood shifts from peaceful morning to evening dread
- **Monday**: Existential glitch theme with CSS glitch effects
- **Tuesday**: Otter mascot (happy/sad based on day)
- **Wednesday**: "It is Wednesday my dudes" frog meme
- **Thursday**: Button reveal with countdown to Thursday
- **Friday**: Satirical "premium plan" uncertainty
- **Saturday**: Party mode with confetti and disco effects

## Conventions

- Each detector is self-contained in its own directory
- No build process - plain HTML/CSS/JS
- Uses Google Fonts for typography variety
- Day detection uses `new Date().getDay()` (0=Sunday, 6=Saturday)

## Deployment

Push to `main` branch - GitHub Pages deploys automatically.
