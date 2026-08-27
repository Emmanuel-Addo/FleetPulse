import { useSearchParams } from 'react-router-dom';
import { useMemo, useCallback } from 'react';
import { AssetStatus, AssetType } from '../context/FleetContext';

export interface FilterState {
  q: string;
  statuses: AssetStatus[];
  types: AssetType[];
  batteryMin: number;
  batteryMax: number;
}

export const useUrlFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo<FilterState>(() => {
    const statusParam = searchParams.get('status');
    const typeParam = searchParams.get('type');
    const bMin = searchParams.get('batteryMin');
    const bMax = searchParams.get('batteryMax');

    return {
      q: searchParams.get('q') || '',
      statuses: statusParam ? (statusParam.split(',') as AssetStatus[]) : [],
      types: typeParam ? (typeParam.split(',') as AssetType[]) : [],
      batteryMin: bMin ? parseInt(bMin, 10) : 0,
      batteryMax: bMax ? parseInt(bMax, 10) : 100,
    };
  }, [searchParams]);

  const setFilter = useCallback(
    (key: keyof FilterState, value: string | string[] | number | null) => {
      const newParams = new URLSearchParams(searchParams);

      if (value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
        newParams.delete(key === 'statuses' ? 'status' : key === 'types' ? 'type' : key);
      } else if (Array.isArray(value)) {
        newParams.set(key === 'statuses' ? 'status' : 'type', value.join(','));
      } else {
        newParams.set(key, value.toString());
      }

      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
  );

  return { filters, setFilter };
};
