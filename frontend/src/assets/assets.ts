/**
 * assets.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Static dummy data for the FleetPulse Live Tracking demonstration.
 *
 * These 6 vehicles represent a realistic cross-section of a Ghanaian regional
 * logistics fleet operating key intercity routes:
 *   - Accra ↔ Kumasi (N1 / E1 highway)
 *   - Accra ↔ Cape Coast (N1 coastal)
 *   - Accra ↔ Tema industrial corridor
 *   - Kumasi ↔ Tamale (N10)
 *
 * Base hub: Accra (5.6037° N, 0.1870° W)
 *
 * Fields:
 *   id            — Unique asset identifier
 *   name          — Human-readable vehicle label
 *   type          — Vehicle class: Truck | Van | Car
 *   status        — Operational state: Active | Idle | Maintenance | Offline
 *   battery       — Current battery/fuel level as a percentage (0–100)
 *   lat / lng     — Last known GPS coordinates (decimal degrees)
 *   speed         — Last recorded speed in km/h (0 if stationary/offline)
 *   driverName    — Assigned driver for this trip
 *   lastUpdated   — Unix timestamp (ms) of the most recent telemetry ping
 */

export type AssetStatus = 'Active' | 'Idle' | 'Maintenance' | 'Offline';
export type AssetType   = 'Truck' | 'Van' | 'Car';

export interface FleetAsset {
  id:          string;
  name:        string;
  type:        AssetType;
  status:      AssetStatus;
  battery:     number;
  lat:         number;
  lng:         number;
  speed:       number;
  driverName:  string;
  lastUpdated: number;
}

const NOW = Date.now();

export const FLEET_ASSETS: FleetAsset[] = [
  {
    // ── Vehicle 1: Truck en route Accra → Kumasi on the N1 highway ──────────
    // Speed above zone limit → triggers Speeding Violation alert
    id:          'ASSET-0001',
    name:        'Truck Alpha',
    type:        'Truck',
    status:      'Active',
    battery:     76,
    lat:         6.4969,    // approx. Suhum area — midway Accra–Kumasi
    lng:         -0.4486,
    speed:       93,        // km/h — above 80 km/h zone limit
    driverName:  'Kwame Asante',
    lastUpdated: NOW - 3000,
  },
  {
    // ── Vehicle 2: Van making deliveries in Kumasi CBD ───────────────────────
    id:          'ASSET-0002',
    name:        'Van Bravo',
    type:        'Van',
    status:      'Active',
    battery:     61,
    lat:         6.6885,    // Kumasi, Ashanti Region
    lng:         -1.6244,
    speed:       35,
    driverName:  'Abena Owusu',
    lastUpdated: NOW - 5000,
  },
  {
    // ── Vehicle 3: Car near Accra with critically low battery ────────────────
    // battery < 10% → triggers Battery Depletion alert
    id:          'ASSET-0003',
    name:        'Car Charlie',
    type:        'Car',
    status:      'Active',
    battery:     6,
    lat:         5.6037,    // Accra — dispatch hub
    lng:         -0.1870,
    speed:       28,
    driverName:  'Kofi Mensah',
    lastUpdated: NOW - 2000,
  },
  {
    // ── Vehicle 4: Van idling at Tema Port logistics yard ────────────────────
    id:          'ASSET-0004',
    name:        'Van Delta',
    type:        'Van',
    status:      'Idle',
    battery:     89,
    lat:         5.6698,    // Tema, Greater Accra Region
    lng:         -0.0166,
    speed:       0,
    driverName:  'Ama Boateng',
    lastUpdated: NOW - 18000,
  },
  {
    // ── Vehicle 5: Truck in maintenance at Kumasi depot ──────────────────────
    id:          'ASSET-0005',
    name:        'Truck Echo',
    type:        'Truck',
    status:      'Maintenance',
    battery:     42,
    lat:         6.7000,    // Kumasi depot yard
    lng:         -1.5900,
    speed:       0,
    driverName:  'Yaw Darko',
    lastUpdated: NOW - 60000,
  },
  {
    // ── Vehicle 6: Car offline — telemetry lost on Accra–Cape Coast road ────
    // Last seen near Winneba — GPS / Signal Loss scenario
    id:          'ASSET-0006',
    name:        'Car Foxtrot',
    type:        'Car',
    status:      'Offline',
    battery:     19,
    lat:         5.3460,    // Winneba, Central Region
    lng:         -0.6251,
    speed:       0,
    driverName:  'Efua Amponsah',
    lastUpdated: NOW - 900000, // last seen 15 minutes ago
  },
];
