import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { useUrlFilters } from '../hooks/useUrlFilters';

describe('useUrlFilters', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={['/dashboard?status=Active,Idle&batteryMin=20']}>
      {children}
    </MemoryRouter>
  );

  it('should parse URL parameters correctly', () => {
    const { result } = renderHook(() => useUrlFilters(), { wrapper });
    
    expect(result.current.filters.statuses).toEqual(['Active', 'Idle']);
    expect(result.current.filters.batteryMin).toBe(20);
    expect(result.current.filters.batteryMax).toBe(100); // default
    expect(result.current.filters.q).toBe(''); // default
  });

  it('should update URL parameters when setFilter is called', () => {
    const { result } = renderHook(() => useUrlFilters(), { wrapper });

    act(() => {
      result.current.setFilter('q', 'Vehicle');
    });

    expect(result.current.filters.q).toBe('Vehicle');
    
    act(() => {
      result.current.setFilter('statuses', ['Offline']);
    });
    
    expect(result.current.filters.statuses).toEqual(['Offline']);
  });
});
