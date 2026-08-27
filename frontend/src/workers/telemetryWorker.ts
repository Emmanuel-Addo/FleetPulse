// src/workers/telemetryWorker.ts

export type AssetStatus = 'Active' | 'Idle' | 'Maintenance' | 'Offline';
export type AssetType = 'Truck' | 'Van' | 'Car';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  status: AssetStatus;
  battery: number;
  lat: number;
  lng: number;
  speed: number;
  driverName?: string;
  lastUpdated: number;
}

const FIRST_NAMES = ['John', 'Jane', 'Alex', 'Emily', 'Chris', 'Katie', 'Mike', 'Sarah', 'David', 'Laura'];
const LAST_NAMES = ['Smith', 'Doe', 'Johnson', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson'];
const TYPES: AssetType[] = ['Truck', 'Van', 'Car'];
const STATUSES: AssetStatus[] = ['Active', 'Idle', 'Maintenance', 'Offline'];

// Base coordinate around a central hub (e.g., Chicago)
const BASE_LAT = 41.8781;
const BASE_LNG = -87.6298;

let assets: Asset[] = [];

// Initialize 1000 assets
const initializeAssets = () => {
  for (let i = 0; i < 1000; i++) {
    assets.push({
      id: `ASSET-${i.toString().padStart(4, '0')}`,
      name: `Vehicle ${i}`,
      type: TYPES[Math.floor(Math.random() * TYPES.length)],
      status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
      battery: Math.floor(Math.random() * 100),
      lat: BASE_LAT + (Math.random() - 0.5) * 2, // +/- 1 degree
      lng: BASE_LNG + (Math.random() - 0.5) * 2,
      speed: Math.floor(Math.random() * 80),
      driverName: `${FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]} ${LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]}`,
      lastUpdated: Date.now()
    });
  }
};

let isRunning = false;
let intervalId: number | null = null;

const startTelemetry = () => {
  if (isRunning) return;
  isRunning = true;
  
  // Send initial batch
  postMessage({ type: 'INITIAL_STATE', payload: assets });

  // Simulate updates 2-5 times a second
  intervalId = setInterval(() => {
    // Pick a random subset of 10-50 assets to update
    const numToUpdate = Math.floor(Math.random() * 40) + 10;
    const updates: Asset[] = [];
    
    for (let i = 0; i < numToUpdate; i++) {
      const idx = Math.floor(Math.random() * assets.length);
      const asset = assets[idx];
      
      // Mutate
      if (asset.status === 'Active') {
        asset.lat += (Math.random() - 0.5) * 0.01;
        asset.lng += (Math.random() - 0.5) * 0.01;
        asset.battery = Math.max(0, asset.battery - 0.1);
        asset.speed = Math.floor(Math.random() * 80);
      }
      asset.lastUpdated = Date.now();
      
      updates.push({ ...asset });
    }
    
    postMessage({ type: 'TELEMETRY_UPDATE', payload: updates });
  }, 1000 / (Math.random() * 3 + 2)); // 2 to 5 events per second
};

const stopTelemetry = () => {
  isRunning = false;
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
};

self.onmessage = (e) => {
  if (e.data === 'START') {
    if (assets.length === 0) initializeAssets();
    startTelemetry();
  } else if (e.data === 'STOP') {
    stopTelemetry();
  }
};
