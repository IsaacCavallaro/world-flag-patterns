# World Flag Patterns

World Flag Patterns is a small family learning app for exploring national flags through colors, symbols, geography, patterns, and short memory hooks.

It started as a fun way for my family to learn flags together: notice what flags have in common, connect each flag to a place on the map, and quiz each other without making it feel like homework.

Live site, after GitHub Pages deployment:

https://isaaccavallaro.github.io/world-flag-patterns/

## What You Can Do

- Browse 250 countries and territories from the `world-countries` dataset.
- Search by country, color, symbol, region, or subregion.
- Learn selected flags through curated notes about colors, symbols, geography, and history.
- Compare recurring flag families, such as Nordic crosses, vertical tricolors, crescents and stars, and red-white-blue flags.
- Sort pattern groups by original pattern order, country name, continent, or subregion.
- Practice with a quiz that combines flag clues and map context.

## Tech Stack

- React 18
- TypeScript
- Vite
- D3 Geo and TopoJSON for the map
- `world-countries` and `world-atlas` for country and map data
- Flag images from FlagCDN

## Local Development

Use Node.js `20.19+` or `22.12+`. The project includes an `.nvmrc` with Node 22, and the GitHub Pages workflow also builds with Node 22.

```bash
npm install
npm run dev
```

The local app is served at:

```text
http://127.0.0.1:5173/world-flag-patterns/
```

If that port is busy, Vite will choose the next available port.

## Build

```bash
npm run build
```

## UI Smoke Check

The repo includes a Playwright-based smoke check that runs against a local app URL.

```bash
npm run verify:ui
```

If the app is running on a non-default port:

```bash
APP_URL=http://127.0.0.1:5174/world-flag-patterns/ npm run verify:ui
```

## Deploy

The repository includes a GitHub Actions workflow at `.github/workflows/deploy.yml`.

On every push to `main`, it:

1. Installs dependencies with `npm ci`.
2. Builds the Vite app with `npm run build`.
3. Uploads `dist/`.
4. Deploys the site to GitHub Pages.

GitHub Pages should be configured to use GitHub Actions as the source.

## Data And Learning Notes

Country metadata comes from public packages and services listed above. Some countries have hand-written learning notes, and the rest still have generated geography context so they remain searchable, mappable, and quiz-ready.

The flag explanations are meant as friendly learning aids, not as exhaustive historical references. The app links out to Wikipedia and related references where deeper reading is useful.
