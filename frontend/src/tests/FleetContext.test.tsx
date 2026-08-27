import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FleetProvider, useFleet } from '../context/FleetContext';

// Mock react-toastify to prevent errors during test
vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const TestComponent = () => {
  const { state, performRemoteAction, dispatch } = useFleet();

  // Inject a mock asset to test with
  React.useEffect(() => {
    dispatch({
      type: 'UPSERT_ASSETS',
      payload: [{
        id: '1', name: 'Test Vehicle', type: 'Truck', status: 'Active',
        battery: 100, lat: 0, lng: 0, lastUpdated: Date.now()
      }]
    });
  }, [dispatch]);

  const handleAction = () => {
    // We override Math.random so it ALWAYS fails in the test
    const originalRandom = Math.random;
    Math.random = () => 0.1; // Forces failure (0.1 < 0.2)
    
    performRemoteAction('1', 'Lock', { status: 'Maintenance' }).catch(() => {
      // Catch the error so test doesn't fail
    }).finally(() => {
      Math.random = originalRandom;
    });
  };

  return (
    <div>
      <span data-testid="status">{state.assets['1']?.status}</span>
      <button data-testid="action-btn" onClick={handleAction}>Action</button>
    </div>
  );
};

describe('FleetContext', () => {
  it('should optimistically update and then rollback on API failure', async () => {
    const { getByTestId } = render(
      <FleetProvider>
        <TestComponent />
      </FleetProvider>
    );

    // Initial state
    expect(getByTestId('status').textContent).toBe('Active');

    // Trigger action
    act(() => {
      getByTestId('action-btn').click();
    });

    // IMMEDIATELY expect optimistic update to have applied
    expect(getByTestId('status').textContent).toBe('Maintenance');

    // Wait for the simulated API call to fail (800ms) and rollback
    await waitFor(() => {
      expect(getByTestId('status').textContent).toBe('Active');
    }, { timeout: 1500 });
  });
});
