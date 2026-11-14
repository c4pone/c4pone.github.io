# Florian’s personal site

A static homepage for GitHub Pages: a short introduction, LinkedIn and GitHub links, and a playable Snake game. No build step or JavaScript dependencies.

## Preview

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open http://127.0.0.1:4173. Serve over HTTP so the JavaScript modules can load.

## Edit

- `index.html`: bio, work history, and contact links.
- `stylesheets/home.css`: responsive layout and styles. Fonts are served locally, with immediate system-font fallbacks on slow connections.
- `javascripts/home.js`: year, console greeting, and loading Snake on demand.
- `javascripts/game.js`: Snake rendering and controls, downloaded only when Play is pressed.
- `javascripts/snake.mjs`: movement, fruit placement, scoring, and collision rules.

Press Play, then use arrows or WASD, swipe on the board, or use the direction buttons. Each apple grows the snake and adds 10 points. The game speeds up gradually. Hitting a wall or your body ends the round. Space toggles pause when the board is focused; Escape pauses. Leaving the game or hiding the tab pauses it automatically. Nothing moves before you start.

The existing `/dyed/privacy/` policy and custom domain (`CNAME`) remain available.

## Check

```sh
node --test tests/snake.test.mjs
```

On a freshly loaded homepage, run `tests/home.browser.js` in the browser console (or pass its contents to `orca eval --expression`). It plays a round and checks start, food, scoring, controls, pause, collisions, replay, focus, square board layout, and overflow. Run at desktop and mobile widths.

## Loading performance

The homepage makes no third-party requests. The two Latin WOFF2 variable fonts live in `assets/fonts/`, alongside their original SIL Open Font Licenses. DM Sans is preloaded; both use `font-display: optional` to avoid late font swaps. If a font arrives too slowly, the browser keeps the system fallback for that visit.

The page renders from HTML and CSS. The initial JavaScript is only a small loader and console greeting; neither the Snake renderer nor its rules are fetched until Play is pressed. There is no idle game timer.

Fonts are from the [Google Fonts DM Sans](https://github.com/google/fonts/tree/main/ofl/dmsans) and [Space Grotesk](https://github.com/google/fonts/tree/main/ofl/spacegrotesk) distributions. The loading strategy follows [web.dev’s font guidance](https://web.dev/learn/performance/optimize-web-fonts).

Local Lighthouse 13.6.0 simulated-mobile comparison (Python HTTP server; not production measurements):

| Metric | Before | After |
| --- | ---: | ---: |
| Performance score | 99 | 100 |
| First / largest contentful paint | 1.64 s | 0.75 s |
| Cumulative layout shift | 0.0012 | 0 |
| Total blocking time | 0 ms | 57 ms |
| Initial JavaScript, uncompressed | 9,013 B | 779 B |
| Initial requests | 8 | 6 |
| Total transfer | 90,774 B | 81,141 B |

Timings vary by device and connection. These runs use a local server without production compression or CDN caching; deployment performance remains to be measured.
