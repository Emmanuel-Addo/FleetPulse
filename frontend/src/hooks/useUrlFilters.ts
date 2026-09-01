import { useSearchParams } from "react-router-dom";
import { useMemo, useCallback } from "react";
import { AssetStatus, AssetType } from "../context/FleetContext";

export interface FilterState {
  q: string;
  statuses: AssetStatus[];
  types: AssetType[];
  batteryMin: number;
  batteryMax: number;
  tags: string[];
  sortBy: "name" | "battery" | "status";
  sortDirection: "asc" | "desc";
  page: number;
  pageSize: number;
}

export const useUrlFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo<FilterState>(() => {
    const statusParam = searchParams.get("status");
    const typeParam = searchParams.get("type");
    const tagsParam = searchParams.get("tags");
    const bMin = searchParams.get("batteryMin");
    const bMax = searchParams.get("batteryMax");
    const sortBy = searchParams.get("sortBy");
    const sortDirection = searchParams.get("sortDirection");
    const page = Number(searchParams.get("page"));
    const pageSize = Number(searchParams.get("pageSize"));

    return {
      q: searchParams.get("q") || "",
      statuses: statusParam ? (statusParam.split(",") as AssetStatus[]) : [],
      types: typeParam ? (typeParam.split(",") as AssetType[]) : [],
      tags: tagsParam ? tagsParam.split(",") : [],
      batteryMin: bMin ? parseInt(bMin, 10) : 0,
      batteryMax: bMax ? parseInt(bMax, 10) : 100,
      sortBy: sortBy === "battery" || sortBy === "status" ? sortBy : "name",
      sortDirection: sortDirection === "desc" ? "desc" : "asc",
      page: Number.isInteger(page) && page > 0 ? page : 1,
      pageSize:
        Number.isInteger(pageSize) && pageSize > 0 && pageSize <= 100
          ? pageSize
          : 50,
    };
  }, [searchParams]);

  const setFilter = useCallback(
    (key: keyof FilterState, value: string | string[] | number | null) => {
      const newParams = new URLSearchParams(searchParams);

      if (
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0)
      ) {
        newParams.delete(
          key === "statuses" ? "status" : key === "types" ? "type" : key,
        );
      } else if (Array.isArray(value)) {
        newParams.set(
          key === "statuses" ? "status" : key === "types" ? "type" : "tags",
          value.join(","),
        );
      } else {
        newParams.set(key, value.toString());
      }

      setSearchParams(newParams);
    },
    [searchParams, setSearchParams],
  );

  return { filters, setFilter };
};
