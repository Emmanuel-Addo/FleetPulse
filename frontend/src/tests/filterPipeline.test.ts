import { describe, it, expect } from 'vitest';
import { filterAssets } from '../utils/filterPipeline';
import { Asset } from '../context/FleetContext';

describe('filterPipeline', () => {
  const mockAssets: Asset[] = [
    { id: '1', name: 'Truck A', type: 'Truck', status: 'Active', battery: 80, lat: 0, lng: 0, speed: 50, lastUpdated: 0 },
    { id: '2', name: 'Van B', type: 'Van', status: 'Offline', battery: 10, lat: 0, lng: 0, speed: 0, lastUpdated: 0 },
    { id: '3', name: 'Car C', type: 'Car', status: 'Idle', battery: 50, lat: 0, lng: 0, speed: 0, lastUpdated: 0 },
  ];

  it('should return all assets when no filters are applied', () => {
    const result = filterAssets(mockAssets, { q: '', statuses: [], types: [], batteryMin: 0, batteryMax: 100 });
    expect(result.length).toBe(3);
  });

  it('should filter by search query (name)', () => {
    const result = filterAssets(mockAssets, { q: 'Truck', statuses: [], types: [], batteryMin: 0, batteryMax: 100 });
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Truck A');
  });

  it('should filter by status', () => {
    const result = filterAssets(mockAssets, { q: '', statuses: ['Offline'], types: [], batteryMin: 0, batteryMax: 100 });
    expect(result.length).toBe(1);
    expect(result[0].status).toBe('Offline');
  });

  it('should filter by battery range', () => {
    const result = filterAssets(mockAssets, { q: '', statuses: [], types: [], batteryMin: 20, batteryMax: 100 });
    expect(result.length).toBe(2);
    expect(result.map(a => a.id)).not.toContain('2'); // Van B has 10%
  });

  it('should apply complex multi-dimensional filtering', () => {
    const result = filterAssets(mockAssets, { q: '', statuses: ['Active', 'Idle'], types: ['Truck', 'Car'], batteryMin: 40, batteryMax: 100 });
    expect(result.length).toBe(2);
  });
});
