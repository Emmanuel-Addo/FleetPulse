import React, { createContext, useContext, useEffect, useReducer, useCallback, ReactNode } from 'react';
import { toast } from 'react-toastify';

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
  speed?: number;
  driverName?: string;
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

const initialState: FleetState = {
  assets: {},
  isOffline: false,
  totalStats: {
    totalVehicles: 0,
    availableVehicles: 0,
    totalDrivers: 0,
    availableDrivers: 0,
  }
};

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

      return {
        ...state,
        assets: newAssets,
        totalStats: { totalVehicles, availableVehicles, totalDrivers, availableDrivers }
      };
    }
    case 'SET_OFFLINE':
      return { ...state, isOffline: action.payload };
    case 'OPTIMISTIC_UPDATE':
      return {
        ...state,
        assets: {
          ...state.assets,
          [action.payload.id]: {
            ...state.assets[action.payload.id],
            ...action.payload.updates
          }
        }
      };
    case 'ROLLBACK_UPDATE':
      return {
        ...state,
        assets: {
          ...state.assets,
          [action.payload.id]: action.payload.previous
        }
      };
    default:
      return state;
  }
};

const FleetContext = createContext<{
  state: FleetState;
  dispatch: React.Dispatch<FleetAction>;
  performRemoteAction: (id: string, actionType: string, updates: Partial<Asset>) => Promise<void>;
} | undefined>(undefined);

export const FleetProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(fleetReducer, initialState);

  // Set up telemetry Web Worker
  useEffect(() => {
    // Instantiate the web worker
    const worker = new Worker(new URL('../workers/telemetryWorker.ts', import.meta.url), {
      type: 'module'
    });

    // Listen for messages from the worker
    worker.onmessage = (event) => {
      const { type, payload } = event.data;
      if (type === 'INITIAL_STATE' || type === 'TELEMETRY_UPDATE') {
        dispatch({ type: 'UPSERT_ASSETS', payload });
      }
    };

    // Start the telemetry simulation
    worker.postMessage('START');

    // Cleanup worker on unmount
    return () => {
      worker.postMessage('STOP');
      worker.terminate();
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

  const performRemoteAction = useCallback(async (id: string, actionType: string, updates: Partial<Asset>) => {
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
    } catch (error: any) {
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
