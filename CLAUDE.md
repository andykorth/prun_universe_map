# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Dev server at http://localhost:3000
npm run build      # Production build
npm test           # Run tests (Jest via create-react-app)
npm run serve      # Serve production build on port 5000
```

The `homepage` in `package.json` is set to `/map`, which affects asset URL resolution in production.

## Architecture

This is a React + D3.js interactive map for the [Prosperous Universe](https://prosperousuniverse.com/) game. Users explore star systems, search for materials/planets, plan trade routes via pathfinding, and plan gateway placements.

### State Management — Context Providers (in `src/contexts/`)

Six React contexts are layered in `App.js`:

| Context | Responsibility |
|---|---|
| `GraphContext` | Loads and exposes all universe/planet/material data from `public/*.json` |
| `SearchContext` | Search and filter state; sanitizes all user input |
| `SelectionContext` | Tracks selected systems and pathfinding origin/destination |
| `MapModeContext` | Toggles between STANDARD and GATEWAY operating modes |
| `CogcOverlayContext` | COGC (Chamber of Commerce) program overlay state |
| `DataPointContext` | Custom data point overlay state |

### Two Operating Modes

**STANDARD** — system/planet search, material concentration filtering, Dijkstra pathfinding between systems, COGC program overlays.

**GATEWAY** — gateway planning with two strategies:
- *Single*: select one origin → find closest target systems
- *Dual*: select two origins → find best midpoint systems

### Core Components

- **`UniverseMap.jsx`** — loads `PrUn_universe_map_normalized.svg` from `public/`, then D3 adds zoom/pan, hover effects, and dynamic color overlays. Wrapped in `React.memo`.
- **`Sidebar.jsx`** — selected system/planet details and search/filter controls, switching between `StandardControls` and `GatewayControls` based on mode.
- **`GatewayLayer.jsx`** — SVG overlay for gateway visualization with distance-based color coding (Tol palette; thresholds in `src/config/config.js`).
- **`DataPointOverlay.jsx`** — renders custom data point overlays on the map.

### Utilities (`src/utils/`)

- `graphUtils.js` — Dijkstra pathfinding via `dijkstrajs`, graph rendering helpers
- `distanceUtils.js` — 3D distance calculations, closest-system and best-midpoint finders
- `searchUtils.js` — SVG search highlighting logic
- `svgUtils.js` — D3 event handlers and SVG node/edge styling
- `dataPointUtils.js` — data point creation and management

### Data Files (`public/`)

All loaded as static JSON at runtime (no build-time processing):

| File | Source |
|---|---|
| `prun_universe_data.json` | `https://rest.fnar.net/systemstars` |
| `planet_data.json` | `https://rest.fnar.net/planet/allplanets/full` (34 MB) |
| `systemstars.json` | Manually edited — star luminosity data |
| `gateways.json` | Hand-created gateway configuration |
| `population_data.json` | Generated from FIO infrastructure reports |
| `graph_data.json` | Graph representation of the universe |
| `material_data.json` | Materials catalog |
| `PrUn_universe_map_normalized.svg` | Hand-edited in Inkscape |

### Live API Integration

Company data is fetched at runtime from `https://rest.fnar.net/company/code/{companyCode}`. All other data is static.

### Visual Configuration

Colors and thresholds are centralized in `src/config/config.js`. Gateway distance color bands use the Tol palette (green < 10 pc, teal 10–15, sand 15–20, rose 20–25, wine > 25).

### D3 + React Pattern

D3 manipulates the SVG DOM directly via `useRef` (`graphRef.current`). D3 selections and zoom behavior are cached in refs and reused across effect updates rather than re-created on each render.
