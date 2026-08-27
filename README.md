# FleetPulse Telemetry Console

> **NSP Technical Assessment · Frontend Engineering**
> React / TypeScript / Web Workers · Real-time Fleet Telemetry Dashboard

---

## Overview

FleetPulse is a next-generation fleet management telemetry console built for a regional logistics company operating hundreds of IoT-equipped transit assets. The legacy system regularly froze under high-volume live data streams, causing dispatchers to miss critical alerts.

This application solves that by processing **1,000 simultaneously active vehicles** at **2–5 telemetry updates per second** with **zero UI lag** — keeping dispatchers informed and in control at all times.

---

## Live Demo

```
npm run dev   →   http://localhost:5173
```

| Route | Page |
|---|---|
| `/` | Landing / Home |
| `/dashboard` | Fleet Overview Dashboard |
| `/tracking` | Live Tracking Map |
| `/vehicles` | Vehicle Registry |
| `/drivers` | Driver Management |
| `/maintenance` | Maintenance Schedule |
| `/issues` | Telemetry Issue Tracker |
| `/issues/new` | Report Telemetry Issue |
| `/analytics` | Analytics |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Routing | React Router v6 |
| State Management | React Context + useReducer |
| Real-time Engine | **Web Workers** (off-main-thread telemetry) |
| Map | React-Leaflet + Marker Clustering |
| Virtualised Lists | @tanstack/react-virtual |
| Styling | Tailwind CSS + shadcn/ui |
| Testing | Vitest + React Testing Library |
| Build | Vite |

---

## Architecture

### Web Worker Telemetry Engine

The core performance innovation. All 1,000 vehicle simulations run inside a dedicated browser worker thread (`src/workers/telemetryWorker.ts`), completely isolated from the main UI thread.

```
Browser Main Thread          Worker Thread
─────────────────────        ──────────────────────────
FleetContext.tsx             telemetryWorker.ts
  │                            │
  │ postMessage('START') ──→   │  Initialises 1,000 assets
  │                            │  Simulates movement / battery drain
  │ ←── INITIAL_STATE ────────  │  Pushes batched updates 2-5x/sec
  │ ←── TELEMETRY_UPDATE ─────  │
  │                            │
  │  dispatch(UPSERT_ASSETS)   │
  │  → React re-renders        │
```

**Key benefit:** Heavy computation never blocks the UI. Dispatchers always see a responsive interface even as a thousand vehicles update simultaneously.

### Optimistic UI with Rollback

When a dispatcher performs a remote action (Lock Vehicle, Dispatch Maintenance, Reroute), the UI updates **immediately** without waiting for the simulated API response:

1. **Optimistic Update** — State changes instantly in the UI
2. **Simulated API** — 800ms round-trip with a 20% random failure rate
3. **Rollback on Failure** — State reverts with a toast notification if the API fails

### URL-Synced Filtering

All dashboard filters (status, battery range, search query) are synchronised with the browser's URL via `useUrlFilters()`. This enables **deep-linking** — sharing a URL with specific filter settings applied.

### Marker Clustering

Rendering 1,000 individual Leaflet markers would freeze the browser. The app uses `react-leaflet-cluster` to group nearby vehicles into cluster bubbles at low zoom levels, breaking apart as the user zooms in — maintaining a locked 60 FPS throughout.

---

## Key Features

### Dashboard (`/dashboard`)
- **Action Queue** — Static snapshot of overdue services, critical issues, offline vehicles, and compliance alerts
- **Asset Status Chart** — Real-time breakdown: Active / Idle / Maintenance / Offline
- **Live Fleet Mini-Map** — Interactive map preview with active/offline vehicle counts
- **Powertrain Mix** — Donut chart showing fleet composition by vehicle type
- **Fleet Assets Table** — Virtualised list of all 1,000 vehicles with battery, status, driver and quick-action buttons
- **Multi-Dimensional Filtering** — Filter by status, battery range, and free-text search, all synced to the URL

### Live Tracking (`/tracking`)
- Full-screen interactive Leaflet map
- Marker clustering for 1,000+ vehicle markers without lag
- Sidebar with Live / Full Fleet toggle and asset search
- Real-time vehicle position updates streamed from the Web Worker

### Issue Tracker (`/issues`)
- Telemetry-specific issue categories: Battery Depletion, Route Deviation, GPS / Signal Loss, Emergency SOS, Engine Fault, Speeding Violation, Communication Failure, Unauthorized Stop
- Priority and status filtering
- Live telemetry snapshot attached to each issue (battery %, speed, GPS coordinates)
- Age and overdue indicators

### Report Issue (`/issues/new`)
- **Smart auto-fill** — selecting a vehicle pre-populates the summary and telemetry snapshot
- **Context-aware fields** — dynamic form fields based on the selected category (OBD fault code for Engine Faults, deviation distance for Route Deviations, GPS coordinates for Signal Loss)
- **Alert Flags** — Emergency toggle (escalates to all dispatchers), Dispatch Required toggle
- **Emergency Mode** — red UI state with a dedicated dispatch button when Emergency SOS is selected

---

## Performance Decisions

| Challenge | Solution |
|---|---|
| 1,000 live markers on the map | `react-leaflet-cluster` groups nearby markers |
| 1,000 table rows rendering | `@tanstack/react-virtual` — only renders visible rows |
| Live telemetry on main thread | Moved to a dedicated **Web Worker** |
| Dashboard numbers flickering | One-time snapshot via `useRef` — computed once on load |
| Stale filter state on navigation | URL-synced filters via `useUrlFilters` custom hook |
| Offline resilience | `navigator.onLine` detection + cached asset state |

---

## Testing

```bash
cd frontend
yarn test
```

### Test Coverage

| File | What it tests |
|---|---|
| `filterPipeline.test.ts` | Multi-dimensional filter logic (status, battery, search) |
| `useUrlFilters.test.tsx` | URL parsing and state sync for search params |
| `FleetContext.test.tsx` | Optimistic update + rollback state machine |

---

## Getting Started

```bash
# Install dependencies
cd frontend
yarn install

# Start dev server
yarn dev

# Run tests
yarn test

# Build for production
yarn build
```

---

## Project Structure

```
frontend/src/
├── workers/
│   └── telemetryWorker.ts       # Web Worker — vehicle simulation engine
├── context/
│   └── FleetContext.tsx          # Global state, Worker integration, optimistic updates
├── hooks/
│   └── useUrlFilters.ts          # URL-synced filter state hook
├── utils/
│   └── filterPipeline.ts         # Pure filtering functions for assets
├── pages/
│   ├── Dashboard.tsx             # Fleet overview with KPIs and asset table
│   ├── LiveTracking.tsx          # Full-screen map with real-time markers
│   ├── Issues.tsx                # Telemetry issue tracker
│   ├── ReportIssue.tsx           # Report issue form
│   ├── Vehicles.tsx
│   ├── Drivers.tsx
│   ├── Maintenance.tsx
│   └── Analytics.tsx
├── components/
│   ├── Layout.tsx                # App shell with collapsible sidebar
│   └── map/
│       └── MapComponent.jsx      # Leaflet map with clustering
└── tests/
    ├── filterPipeline.test.ts
    ├── useUrlFilters.test.tsx
    └── FleetContext.test.tsx
```

---

## Assessment Deliverables Checklist

- [x] **1,000 live vehicles** simulated via Web Worker at 2–5 updates/second
- [x] **Zero UI lag** — worker runs off the main thread
- [x] **Optimistic UI** — instant state updates with rollback on failure
- [x] **Marker Clustering** — performant map with 1,000+ markers
- [x] **Virtual list** — `@tanstack/react-virtual` for the fleet table
- [x] **URL-synced filters** — deep-linkable dashboard filters
- [x] **Offline detection** — banner shown when network is lost
- [x] **Unit tests** — 8 tests across 3 files, all passing
- [x] **Telemetry Issue Tracker** — category-aware, context-specific form
- [x] **Responsive sidebar** — collapses to icons on Live Tracking

---

*Built for the NSP Technical Assessment · FleetPulse Console · 2026*
