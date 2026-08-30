import React, { createContext, useContext, useEffect, useReducer, useCallback, ReactNode } from 'react';
import { toast } from 'react-toastify';

export type AssetStatus = 'Active' | 'Idle' | 'Maintenance' | 'Offline';
export type AssetType = 'Truck' | 'Van' | 'Car';
export type RemoteActionType = 'Lock' | 'Reroute' | 'Maintenance';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  status: AssetStatus;
  battery: number;
  lat: number;
  lng: number;
  speed?: number;
  driverName?: string;
  tags?: string[];
  lastUpdated: number;
}

interface FleetState {
  assets: Record<string, Asset>;
  isOffline: boolean;
  totalStats: {
    totalVehicles: number;
    availableVehicles: number;
    totalDrivers: number;
    availableDrivers: number;
  };
}

type FleetAction = 
  | { type: 'UPSERT_ASSETS'; payload: Asset[] }
  | { type: 'SET_OFFLINE'; payload: boolean }
  | { type: 'OPTIMISTIC_UPDATE'; payload: { id: string; updates: Partial<Asset> } }
  | { type: 'ROLLBACK_UPDATE'; payload: { id: string; previous: Asset } };

interface TelemetryMessage {
  type: 'INITIAL_STATE' | 'TELEMETRY_UPDATE';
  payload: Asset[];
}

const getInitialState = (): FleetState => {
  try {
    const cached = localStorage.getItem('fleet_assets');
    if (cached) {
      const assets = JSON.parse(cached) as Record<string, Asset>;
      let totalVehicles = 0;
      let availableVehicles = 0;
      let totalDrivers = 0;
      let availableDrivers = 0;

      Object.values(assets).forEach((asset) => {
        totalVehicles++;
        if (asset.status === 'Active' || asset.status === 'Idle') availableVehicles++;
        if (asset.driverName) {
            totalDrivers++;
            if (asset.status === 'Active' || asset.status === 'Idle') availableDrivers++;
        }
      });

      return {
        assets,
        isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
        totalStats: { totalVehicles, availableVehicles, totalDrivers, availableDrivers }
      };
    }
  } catch (e) {
    console.error('Failed to load assets from localStorage', e);
  }

  return {
    assets: {},
    isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
    totalStats: {
      totalVehicles: 0,
      availableVehicles: 0,
      totalDrivers: 0,
      availableDrivers: 0,
    }
  };
};

const initialState: FleetState = getInitialState();

const fleetReducer = (state: FleetState, action: FleetAction): FleetState => {
  switch (action.type) {
    case 'UPSERT_ASSETS': {
      if (state.isOffline) return state; // Ignore updates if offline
      
      const newAssets = { ...state.assets };
      let totalVehicles = 0;
      let availableVehicles = 0;
      let totalDrivers = 0;
      let availableDrivers = 0;

      action.payload.forEach(asset => {
        newAssets[asset.id] = {
          ...(newAssets[asset.id] || {}),
          ...asset
        };
      });

      // Recalculate stats quickly
      Object.values(newAssets).forEach(asset => {
        totalVehicles++;
        if (asset.status === 'Active' || asset.status === 'Idle') availableVehicles++;
        if (asset.driverName) {
            totalDrivers++;
            if (asset.status === 'Active' || asset.status === 'Idle') availableDrivers++;
        }
      });

      // Persist locally
      try {
        localStorage.setItem('fleet_assets', JSON.stringify(newAssets));
      } catch (e) {
        console.error('Failed to save assets to localStorage', e);
      }

      return {
        ...state,
        assets: newAssets,
        totalStats: { totalVehicles, availableVehicles, totalDrivers, availableDrivers }
      };
    }
    case 'SET_OFFLINE':
      return { ...state, isOffline: action.payload };
    case 'OPTIMISTIC_UPDATE': {
      const nextAssets = {
        ...state.assets,
        [action.payload.id]: {
          ...state.assets[action.payload.id],
          ...action.payload.updates
        }
      };
      try {
        localStorage.setItem('fleet_assets', JSON.stringify(nextAssets));
      } catch (e) {
        console.error(e);
      }
      return {
        ...state,
        assets: nextAssets
      };
    }
    case 'ROLLBACK_UPDATE': {
      const nextAssets = {
        ...state.assets,
        [action.payload.id]: action.payload.previous
      };
      try {
        localStorage.setItem('fleet_assets', JSON.stringify(nextAssets));
      } catch (e) {
        console.error(e);
      }
      return {
        ...state,
        assets: nextAssets
      };
    }
    default:
      return state;
  }
};

const FleetContext = createContext<{
  state: FleetState;
  dispatch: React.Dispatch<FleetAction>;
  performRemoteAction: (id: string, actionType: RemoteActionType, updates: Partial<Asset>) => Promise<void>;
} | undefined>(undefined);

export const FleetProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(fleetReducer, initialState);

  // Set up telemetry Web Worker with rAF-based batching
  useEffect(() => {
    const worker = new Worker(new URL('../workers/telemetryWorker.ts', import.meta.url), {
      type: 'module'
    });

    // Batch incoming telemetry into animation frames to cap re-renders at ~60 FPS
    let pendingPayload: Asset[] = [];
    let rafId: number | null = null;

    const flushBatch = () => {
      rafId = null;
      if (pendingPayload.length > 0) {
        const batch = pendingPayload;
        pendingPayload = [];
        dispatch({ type: 'UPSERT_ASSETS', payload: batch });
      }
    };

    worker.onmessage = (event: MessageEvent<TelemetryMessage>) => {
      const { type, payload } = event.data;
      if (type === 'INITIAL_STATE') {
        // Initial state is dispatched immediately (no batching needed)
        dispatch({ type: 'UPSERT_ASSETS', payload });
      } else if (type === 'TELEMETRY_UPDATE') {
        // Accumulate and schedule a single flush on the next animation frame
        pendingPayload = pendingPayload.concat(payload);
        if (rafId === null) {
          rafId = requestAnimationFrame(flushBatch);
        }
      }
    };

    worker.postMessage('START');

    return () => {
      worker.postMessage('STOP');
      worker.terminate();
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  // Offline detection
  useEffect(() => {
    const handleOnline = () => dispatch({ type: 'SET_OFFLINE', payload: false });
    const handleOffline = () => dispatch({ type: 'SET_OFFLINE', payload: true });

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const performRemoteAction = useCallback(async (id: string, actionType: RemoteActionType, updates: Partial<Asset>) => {
    const asset = state.assets[id];
    if (!asset) return;
    
    // 1. Optimistic Update
    dispatch({ type: 'OPTIMISTIC_UPDATE', payload: { id, updates } });

    // 2. Simulate API Call (with 20% failure rate)
    try {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() < 0.2) {
            reject(new Error(`Failed to perform ${actionType} on ${asset.name}`));
          } else {
            resolve(true);
          }
        }, 800);
      });
      // Success! Nothing more to do, optimistic update holds.
  } catch (error: unknown) {
      // 3. Rollback on failure
      dispatch({ type: 'ROLLBACK_UPDATE', payload: { id, previous: asset } });
      toast.error(`Action failed: Reverted state for ${asset.name}`);
      throw error; // Re-throw so the UI can show a toast
    }
  }, [state.assets]);

  return (
    <FleetContext.Provider value={{ state, dispatch, performRemoteAction }}>
      {children}
    </FleetContext.Provider>
  );
};

export const useFleet = () => {
  const context = useContext(FleetContext);
  if (context === undefined) {
    throw new Error('useFleet must be used within a FleetProvider');
  }
  return context;
};
