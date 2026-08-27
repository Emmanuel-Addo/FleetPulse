import { Asset } from '../context/FleetContext';
import { FilterState } from '../hooks/useUrlFilters';

export const filterAssets = (assets: Asset[], filters: FilterState): Asset[] => {
  return assets.filter((asset) => {
    // 1. Search filter
    if (filters.q) {
      const query = filters.q.toLowerCase();
      const matchName = asset.name.toLowerCase().includes(query);
      const matchId = asset.id.toLowerCase().includes(query);
      const matchDriver = asset.driverName?.toLowerCase().includes(query);
      if (!matchName && !matchId && !matchDriver) return false;
    }

    // 2. Status filter
    if (filters.statuses.length > 0 && !filters.statuses.includes(asset.status)) {
      return false;
    }

    // 3. Type filter
    if (filters.types.length > 0 && !filters.types.includes(asset.type)) {
      return false;
    }

    // 4. Battery filter
    if (asset.battery < filters.batteryMin || asset.battery > filters.batteryMax) {
      return false;
    }

    // 5. Tag filter
    if (filters.tags && filters.tags.length > 0) {
      const hasMatchingTag = asset.tags?.some(t => filters.tags.includes(t));
      if (!hasMatchingTag) return false;
    }

    return true;
  });
};
