import { renderHook, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import { useUrlFilters } from "../hooks/useUrlFilters";

const wrapper =
  (initialEntries: string[]) =>
  ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
  );

describe("useUrlFilters", () => {
  it("should parse URL parameters correctly", () => {
    const { result } = renderHook(() => useUrlFilters(), {
      wrapper: wrapper(["/dashboard?status=Active,Idle&batteryMin=20"]),
    });

    expect(result.current.filters.statuses).toEqual(["Active", "Idle"]);
    expect(result.current.filters.batteryMin).toBe(20);
    expect(result.current.filters.batteryMax).toBe(100);
    expect(result.current.filters.q).toBe("");
  });

  it("should update URL parameters when setFilter is called", () => {
    const { result } = renderHook(() => useUrlFilters(), {
      wrapper: wrapper(["/dashboard?status=Active,Idle&batteryMin=20"]),
    });

    act(() => {
      result.current.setFilter("q", "Vehicle");
    });
    expect(result.current.filters.q).toBe("Vehicle");

    act(() => {
      result.current.setFilter("statuses", ["Offline"]);
    });
    expect(result.current.filters.statuses).toEqual(["Offline"]);
  });

  it("should return defaults for empty URL", () => {
    const { result } = renderHook(() => useUrlFilters(), {
      wrapper: wrapper(["/dashboard"]),
    });

    expect(result.current.filters.q).toBe("");
    expect(result.current.filters.statuses).toEqual([]);
    expect(result.current.filters.types).toEqual([]);
    expect(result.current.filters.tags).toEqual([]);
    expect(result.current.filters.batteryMin).toBe(0);
    expect(result.current.filters.batteryMax).toBe(100);
    expect(result.current.filters.sortBy).toBe("name");
    expect(result.current.filters.sortDirection).toBe("asc");
    expect(result.current.filters.page).toBe(1);
    expect(result.current.filters.pageSize).toBe(50);
  });

  it("should delete param when set to null or empty", () => {
    const { result } = renderHook(() => useUrlFilters(), {
      wrapper: wrapper(["/dashboard?q=search&status=Active"]),
    });

    act(() => {
      result.current.setFilter("q", "");
    });
    expect(result.current.filters.q).toBe("");

    act(() => {
      result.current.setFilter("statuses", []);
    });
    expect(result.current.filters.statuses).toEqual([]);
  });

  it("should handle type filter via URL", () => {
    const { result } = renderHook(() => useUrlFilters(), {
      wrapper: wrapper(["/dashboard?type=Truck,Van"]),
    });

    expect(result.current.filters.types).toEqual(["Truck", "Van"]);
  });

  it("should handle tags filter via URL", () => {
    const { result } = renderHook(() => useUrlFilters(), {
      wrapper: wrapper(["/dashboard?tags=Priority,Delayed"]),
    });

    expect(result.current.filters.tags).toEqual(["Priority", "Delayed"]);
  });

  it("should handle sort parameters via URL", () => {
    const { result } = renderHook(() => useUrlFilters(), {
      wrapper: wrapper(["/dashboard?sortBy=battery&sortDirection=desc"]),
    });

    expect(result.current.filters.sortBy).toBe("battery");
    expect(result.current.filters.sortDirection).toBe("desc");
  });

  it("should handle pagination via URL", () => {
    const { result } = renderHook(() => useUrlFilters(), {
      wrapper: wrapper(["/dashboard?page=3&pageSize=25"]),
    });

    expect(result.current.filters.page).toBe(3);
    expect(result.current.filters.pageSize).toBe(25);
  });

  it("should default invalid page values", () => {
    const { result } = renderHook(() => useUrlFilters(), {
      wrapper: wrapper(["/dashboard?page=-1&pageSize=200"]),
    });

    expect(result.current.filters.page).toBe(1);
    expect(result.current.filters.pageSize).toBe(50);
  });

  it("should default invalid sortBy to name", () => {
    const { result } = renderHook(() => useUrlFilters(), {
      wrapper: wrapper(["/dashboard?sortBy=invalid"]),
    });

    expect(result.current.filters.sortBy).toBe("name");
  });
});
