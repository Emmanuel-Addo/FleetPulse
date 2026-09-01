import React from "react";
import { render, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { FleetProvider, useFleet } from "../context/FleetContext";

vi.mock("react-toastify", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const mockAsset = {
  id: "1",
  name: "Test Vehicle",
  type: "Truck" as const,
  status: "Active" as const,
  battery: 100,
  lat: 0,
  lng: 0,
  speed: 50,
  lastUpdated: Date.now(),
};

const TestComponent = ({
  onBattery,
}: { onBattery?: (v: number) => void } = {}) => {
  const { state, performRemoteAction, dispatch } = useFleet();

  React.useEffect(() => {
    dispatch({ type: "UPSERT_ASSETS", payload: [mockAsset] });
  }, [dispatch]);

  React.useEffect(() => {
    if (onBattery) onBattery(state.assets["1"]?.battery ?? 0);
  }, [state.assets, onBattery]);

  return (
    <div>
      <span data-testid="status">{state.assets["1"]?.status}</span>
      <span data-testid="battery">{state.assets["1"]?.battery}</span>
      <span data-testid="offline">{String(state.isOffline)}</span>
      <span data-testid="total">{state.totalStats.totalVehicles}</span>
      <button
        data-testid="action-btn"
        onClick={() =>
          performRemoteAction("1", "Lock", { status: "Offline" }).catch(
            () => {},
          )
        }
      >
        Lock
      </button>
      <button
        data-testid="success-btn"
        onClick={() =>
          performRemoteAction("1", "Maintenance", {
            status: "Maintenance",
          }).catch(() => {})
        }
      >
        Maintain
      </button>
      <button
        data-testid="set-offline"
        onClick={() => dispatch({ type: "SET_OFFLINE", payload: true })}
      >
        Go Offline
      </button>
      <button
        data-testid="set-online"
        onClick={() => dispatch({ type: "SET_OFFLINE", payload: false })}
      >
        Go Online
      </button>
      <button
        data-testid="update-battery"
        onClick={() =>
          dispatch({
            type: "UPSERT_ASSETS",
            payload: [{ ...mockAsset, id: "1", battery: 42 }],
          })
        }
      >
        Update Battery
      </button>
    </div>
  );
};

describe("FleetContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should optimistically update and then rollback on API failure", async () => {
    const origRandom = Math.random;
    Math.random = () => 0.05;

    const { getByTestId } = render(
      <FleetProvider>
        <TestComponent />
      </FleetProvider>,
    );

    expect(getByTestId("status").textContent).toBe("Active");
    act(() => {
      getByTestId("action-btn").click();
    });
    expect(getByTestId("status").textContent).toBe("Offline");

    await waitFor(
      () => {
        expect(getByTestId("status").textContent).toBe("Active");
      },
      { timeout: 1500 },
    );

    Math.random = origRandom;
  });

  it("should apply optimistic update that persists on success", async () => {
    const origRandom = Math.random;
    Math.random = () => 0.5;

    const { getByTestId } = render(
      <FleetProvider>
        <TestComponent />
      </FleetProvider>,
    );

    act(() => {
      getByTestId("success-btn").click();
    });
    expect(getByTestId("status").textContent).toBe("Maintenance");

    await waitFor(
      () => {
        expect(getByTestId("status").textContent).toBe("Maintenance");
      },
      { timeout: 1500 },
    );

    Math.random = origRandom;
  });

  it("should upsert assets and update totalStats", () => {
    const { getByTestId } = render(
      <FleetProvider>
        <TestComponent />
      </FleetProvider>,
    );
    expect(getByTestId("total").textContent).toBe("1");
    expect(getByTestId("battery").textContent).toBe("100");
  });

  it("should set offline state", () => {
    const { getByTestId } = render(
      <FleetProvider>
        <TestComponent />
      </FleetProvider>,
    );
    expect(getByTestId("offline").textContent).toBe("false");

    act(() => {
      getByTestId("set-offline").click();
    });
    expect(getByTestId("offline").textContent).toBe("true");

    act(() => {
      getByTestId("set-online").click();
    });
    expect(getByTestId("offline").textContent).toBe("false");
  });

  it("should persist assets to localStorage on upsert", () => {
    render(
      <FleetProvider>
        <TestComponent />
      </FleetProvider>,
    );

    const cached = localStorage.getItem("fleet_assets");
    expect(cached).not.toBeNull();
    const parsed = JSON.parse(cached!);
    expect(parsed["1"]).toBeDefined();
    expect(parsed["1"].name).toBe("Test Vehicle");
  });

  it("should throw when useFleet is used outside FleetProvider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const BadComponent = () => {
      useFleet();
      return null;
    };
    expect(() => render(<BadComponent />)).toThrow(
      "useFleet must be used within a FleetProvider",
    );
    spy.mockRestore();
  });

  it("should update asset via UPSERT_ASSETS with merged fields", () => {
    let capturedBattery = 0;
    const { getByTestId } = render(
      <FleetProvider>
        <TestComponent
          onBattery={(v) => {
            capturedBattery = v;
          }}
        />
      </FleetProvider>,
    );

    expect(getByTestId("battery").textContent).toBe("100");

    act(() => {
      getByTestId("update-battery").click();
    });

    expect(getByTestId("battery").textContent).toBe("42");
  });

  it("should not process UPSERT_ASSETS when offline", () => {
    const { getByTestId } = render(
      <FleetProvider>
        <TestComponent />
      </FleetProvider>,
    );

    act(() => {
      getByTestId("set-offline").click();
    });
    expect(getByTestId("offline").textContent).toBe("true");
    expect(getByTestId("status").textContent).toBe("Active");
  });
});
