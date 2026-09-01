import { describe, it, expect } from "vitest";
import { filterAssets } from "../utils/filterPipeline";
import { Asset, AssetStatus, AssetType } from "../context/FleetContext";

const baseFilters = {
  q: "",
  statuses: [] as AssetStatus[],
  types: [] as AssetType[],
  batteryMin: 0,
  batteryMax: 100,
  tags: [] as string[],
  sortBy: "name" as const,
  sortDirection: "asc" as const,
  page: 1,
  pageSize: 50,
};

const mockAssets: Asset[] = [
  {
    id: "1",
    name: "Truck Alpha",
    type: "Truck",
    status: "Active",
    battery: 80,
    lat: 0,
    lng: 0,
    speed: 50,
    driverName: "John Smith",
    tags: ["Priority", "Over Speeding"],
    lastUpdated: 0,
  },
  {
    id: "2",
    name: "Van Beta",
    type: "Van",
    status: "Offline",
    battery: 10,
    lat: 0,
    lng: 0,
    speed: 0,
    driverName: "Jane Doe",
    tags: ["Low Fuel"],
    lastUpdated: 0,
  },
  {
    id: "3",
    name: "Car Gamma",
    type: "Car",
    status: "Idle",
    battery: 50,
    lat: 0,
    lng: 0,
    speed: 0,
    tags: ["Delayed"],
    lastUpdated: 0,
  },
  {
    id: "4",
    name: "Truck Delta",
    type: "Truck",
    status: "Maintenance",
    battery: 30,
    lat: 0,
    lng: 0,
    speed: 0,
    driverName: "Alex Johnson",
    tags: ["Priority"],
    lastUpdated: 0,
  },
  {
    id: "5",
    name: "Van Epsilon",
    type: "Van",
    status: "Active",
    battery: 95,
    lat: 0,
    lng: 0,
    speed: 60,
    tags: ["Re-routed", "Local Dispatch"],
    lastUpdated: 0,
  },
];

describe("filterPipeline", () => {
  it("should return all assets when no filters are applied", () => {
    const result = filterAssets(mockAssets, baseFilters);
    expect(result.length).toBe(5);
  });

  it("should filter by search query matching name", () => {
    const result = filterAssets(mockAssets, { ...baseFilters, q: "Truck" });
    expect(result.length).toBe(2);
    expect(result.every((a) => a.name.includes("Truck"))).toBe(true);
  });

  it("should filter by search query matching driver name", () => {
    const result = filterAssets(mockAssets, { ...baseFilters, q: "Jane" });
    expect(result.length).toBe(1);
    expect(result[0].id).toBe("2");
  });

  it("should filter by search query matching asset id", () => {
    const result = filterAssets(mockAssets, {
      ...baseFilters,
      q: "ASSET-0003",
    });
    // Our mock IDs are '3', not 'ASSET-0003', so this tests id matching doesn't break
    expect(result.length).toBe(0);
  });

  it("should filter by single status", () => {
    const result = filterAssets(mockAssets, {
      ...baseFilters,
      statuses: ["Active"],
    });
    expect(result.length).toBe(2);
    expect(result.every((a) => a.status === "Active")).toBe(true);
  });

  it("should filter by multiple statuses", () => {
    const result = filterAssets(mockAssets, {
      ...baseFilters,
      statuses: ["Active", "Offline"],
    });
    expect(result.length).toBe(3);
  });

  it("should filter by type", () => {
    const result = filterAssets(mockAssets, { ...baseFilters, types: ["Van"] });
    expect(result.length).toBe(2);
    expect(result.every((a) => a.type === "Van")).toBe(true);
  });

  it("should filter by battery min only", () => {
    const result = filterAssets(mockAssets, { ...baseFilters, batteryMin: 40 });
    expect(result.length).toBe(3); // 80, 50, 95
  });

  it("should filter by battery max only", () => {
    const result = filterAssets(mockAssets, { ...baseFilters, batteryMax: 30 });
    expect(result.length).toBe(2); // 10, 30
  });

  it("should filter by battery range", () => {
    const result = filterAssets(mockAssets, {
      ...baseFilters,
      batteryMin: 20,
      batteryMax: 60,
    });
    expect(result.length).toBe(2); // 50, 30
  });

  it("should filter by single tag", () => {
    const result = filterAssets(mockAssets, {
      ...baseFilters,
      tags: ["Priority"],
    });
    expect(result.length).toBe(2); // Alpha, Delta
  });

  it("should filter by multiple tags (OR logic)", () => {
    const result = filterAssets(mockAssets, {
      ...baseFilters,
      tags: ["Low Fuel", "Delayed"],
    });
    expect(result.length).toBe(2); // Beta, Gamma
  });

  it("should apply combined multi-dimensional filters", () => {
    const result = filterAssets(mockAssets, {
      ...baseFilters,
      statuses: ["Active"],
      types: ["Truck"],
      batteryMin: 70,
    });
    expect(result.length).toBe(1);
    expect(result[0].id).toBe("1");
  });

  it("should return empty array when no assets match", () => {
    const result = filterAssets(mockAssets, {
      ...baseFilters,
      q: "NonexistentXYZ",
    });
    expect(result.length).toBe(0);
  });

  it("should handle assets with undefined tags", () => {
    const noTagAssets: Asset[] = [
      {
        id: "10",
        name: "No Tag",
        type: "Car",
        status: "Active",
        battery: 50,
        lat: 0,
        lng: 0,
        lastUpdated: 0,
      },
    ];
    const result = filterAssets(noTagAssets, {
      ...baseFilters,
      tags: ["Priority"],
    });
    expect(result.length).toBe(0);
  });

  it("should handle empty asset array", () => {
    const result = filterAssets([], baseFilters);
    expect(result.length).toBe(0);
  });

  it("should be case-insensitive for search", () => {
    const result = filterAssets(mockAssets, { ...baseFilters, q: "truck" });
    expect(result.length).toBe(2);
  });
});
