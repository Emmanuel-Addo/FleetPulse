import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useFleet, Asset, AssetStatus, RemoteActionType } from '../context/FleetContext';
import { useUrlFilters, FilterState } from '../hooks/useUrlFilters';
import { filterAssets } from '../utils/filterPipeline';
import { useDebounce } from '../hooks/useDebounce';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '../components/ui/tooltip';
import { toast } from 'react-toastify';
import {
  ChevronRight, Lock, RotateCcw, Construction, Filter,
  Activity, Truck, Car, Bus, Battery
} from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────

const statusColor: Record<AssetStatus, string> = {
  Active:      'success',
  Idle:        'secondary',
  Maintenance: 'warning',
  Offline:     'destructive',
};

const statusDot: Record<AssetStatus, string> = {
  Active:      'bg-emerald-500',
  Idle:        'bg-gray-400',
  Maintenance: 'bg-amber-500',
  Offline:     'bg-red-500',
};



// ─── Filter Panel ──────────────────────────────────────────────────────────────

interface FilterPanelProps {
  filters: FilterState;
  setFilter: (key: keyof FilterState, value: string | string[] | number | null) => void;
  totalAssets: number;
  filteredCount: number;
}

function FilterPanel({ filters, setFilter, totalAssets, filteredCount }: FilterPanelProps) {
  const statuses: AssetStatus[] = ['Active', 'Idle', 'Maintenance', 'Offline'];

  // Local state for the search box — debounced before writing to URL
  const [searchInput, setSearchInput] = useState(filters.q);
  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    setFilter('q', debouncedSearch);
  }, [debouncedSearch]);

  // Keep local input in sync if URL param changes externally (e.g. back button)
  useEffect(() => {
    setSearchInput(filters.q);
  }, [filters.q]);

  const toggleStatus = (status: AssetStatus) => {
    if (filters.statuses.includes(status)) {
      setFilter('statuses', filters.statuses.filter((s) => s !== status));
    } else {
      setFilter('statuses', [...filters.statuses, status]);
    }
  };

  return (
    <Card className="bg-white border-border shadow-sm">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
            <span className="text-xs text-gray-500 ml-2">Showing {filteredCount} of {totalAssets}</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            {/* Debounced Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search vehicles, drivers..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-3 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-300 w-52"
              />
            </div>
            {/* Status Toggles */}
            <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-lg border border-gray-200">
              {statuses.map(status => (
                <button
                  key={status}
                  onClick={() => toggleStatus(status)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                    filters.statuses.includes(status)
                      ? 'bg-white shadow-sm border border-gray-200 text-gray-900'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Battery Filter */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
              <Battery size={14} className="text-gray-400" />
              <span className="text-xs font-medium text-gray-600">Battery Min:</span>
              <input 
                type="range" 
                min="0" max="100" step="5"
                value={filters.batteryMin}
                onChange={(e) => setFilter('batteryMin', parseInt(e.target.value))}
                className="w-24 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs font-bold w-6">{filters.batteryMin}%</span>
            </div>
            
            {/* Tag Toggles */}
            <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-lg border border-gray-200">
              {['Delayed', 'Low Fuel', 'Over Speeding', 'Local Dispatch', 'Re-routed', 'Priority'].map(tag => {
                const isSelected = filters.tags?.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => {
                      const next = isSelected 
                       ? filters.tags.filter((t) => t !== tag)
                        : [...(filters.tags || []), tag];
                      setFilter('tags', next);
                    }}
                    className={`px-2.5 py-0.5 text-[10px] font-semibold rounded transition ${
                      isSelected
                        ? 'bg-black text-white'
                        : 'bg-white text-gray-500 border border-gray-100 hover:text-gray-700'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>

            {/* Clear All */}
            {(filters.statuses.length > 0 || filters.batteryMin > 0 || (filters.tags && filters.tags.length > 0) || filters.q) && (
              <button 
                onClick={() => {
                  setFilter('statuses', []);
                  setFilter('batteryMin', 0);
                  setFilter('tags', []);
                  setFilter('q', '');
                  setSearchInput('');
                }}
                className="text-xs font-medium text-red-500 hover:text-red-600"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}



// ─── Asset Status Chart ───────────────────────────────────────────────────────

function AssetStatusChart({ assets }: { assets: Asset[] }) {
  const counts = useMemo(() => ({
    Active:      assets.filter(a => a.status === 'Active').length,
    Idle:        assets.filter(a => a.status === 'Idle').length,
    Maintenance: assets.filter(a => a.status === 'Maintenance').length,
    Offline:     assets.filter(a => a.status === 'Offline').length,
  }), [assets]);
  const total = assets.length || 1;
  const bars: { key: AssetStatus; color: string; bg: string }[] = [
    { key: 'Active',      color: 'bg-emerald-500', bg: 'bg-emerald-50' },
    { key: 'Idle',        color: 'bg-gray-300',    bg: 'bg-gray-50'    },
    { key: 'Maintenance', color: 'bg-amber-400',   bg: 'bg-amber-50'   },
    { key: 'Offline',     color: 'bg-red-400',     bg: 'bg-red-50'     },
  ];

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Asset status</CardTitle>
        <CardDescription>Real-time fleet health breakdown</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {/* Stacked bar */}
        <div className="flex h-3 rounded-full overflow-hidden gap-0.5 mb-5">
          {bars.map(({ key, color }) => (
            <div key={key} className={`${color} transition-all duration-700`} style={{ width: `${(counts[key] / total) * 100}%` }} />
          ))}
        </div>
        <div className="space-y-3">
          {bars.map(({ key, color, bg }) => (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${color}`} />
                <span className="text-xs text-gray-600">{key}</span>
              </div>
              <div className="flex items-center gap-3">
                <Progress value={(counts[key] / total) * 100} className="w-20 h-1" />
                <span className="text-xs font-semibold text-gray-800 w-8 text-right">{counts[key]}</span>
                <span className="text-xs text-gray-400 w-8 text-right">{((counts[key] / total) * 100).toFixed(0)}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}



// ─── Powertrain Mix ───────────────────────────────────────────────────────────

function PowertrainMix({ assets }: { assets: Asset[] }) {
  const counts = useMemo(() => ({
    Truck: assets.filter(a => a.type === 'Truck').length,
    Van:   assets.filter(a => a.type === 'Van').length,
    Car:   assets.filter(a => a.type === 'Car').length,
  }), [assets]);
  const total = assets.length || 1;
  const types = [
    { key: 'Truck', icon: Truck, color: 'bg-gray-900', stroke: '#111827' },
    { key: 'Van',   icon: Bus,   color: 'bg-gray-500', stroke: '#6b7280' },
    { key: 'Car',   icon: Car,   color: 'bg-gray-300', stroke: '#d1d5db' },
  ] as const;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Powertrain mix</CardTitle>
        <CardDescription>Fleet composition by vehicle type</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {/* Donut chart mock */}
        <div className="relative flex items-center justify-center mb-6">
          <svg viewBox="0 0 100 100" className="w-28 h-28 -rotate-90">
            {(() => {
              let offset = 0;
              const circumference = 2 * Math.PI * 38;
              return types.map(({ key, color, stroke }) => {
                const pct = counts[key] / total;
                const strokeDasharray = `${pct * circumference} ${circumference}`;
                const el = (
                  <circle
                    key={key}
                    cx="50" cy="50" r="38"
                    fill="none"
                    strokeWidth="12"
                    stroke={stroke}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={-offset * circumference}
                    strokeLinecap="round"
                  />
                );
                offset += pct;
                return el;
              });
            })()}
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-xl font-bold">{total}</span>
            <span className="text-[10px] text-gray-400">total</span>
          </div>
        </div>
        <div className="space-y-2.5">
          {types.map(({ key, icon: Icon, color, stroke }) => (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-sm ${color}`} />
                <Icon size={12} className="text-gray-500" />
                <span className="text-xs text-gray-600">{key}s</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-gray-800">{counts[key]}</span>
                <span className="text-xs text-gray-400">{((counts[key] / total) * 100).toFixed(0)}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Asset Table (Virtualized) ────────────────────────────────────────────────

type SortField = FilterState['sortBy'];

interface AssetTableProps {
  assets: Asset[];
  onAction: (id: string, action: RemoteActionType) => void;
  sortField: SortField;
  sortDirection: FilterState['sortDirection'];
  page: number;
  pageSize: number;
  onSortChange: (field: SortField, direction: FilterState['sortDirection']) => void;
  onPageChange: (page: number) => void;
}

function AssetTable({ assets, onAction, sortField, sortDirection, page, pageSize, onSortChange, onPageChange }: AssetTableProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      onSortChange(field, sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      onSortChange(field, 'asc');
    }
  };

  const sortedAssets = useMemo(() => {
    return [...assets].sort((a, b) => {
      const aVal = sortField === 'battery' ? a.battery : (a[sortField] ?? '').toString().toLowerCase();
      const bVal = sortField === 'battery' ? b.battery : (b[sortField] ?? '').toString().toLowerCase();
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [assets, sortField, sortDirection]);

  const pageCount = Math.max(1, Math.ceil(sortedAssets.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pagedAssets = sortedAssets.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const rowVirtualizer = useVirtualizer({
    count: pagedAssets.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 8,
  });

  const SortBtn = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => toggleSort(field)}
      className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition ${
        sortField === field
          ? 'bg-gray-900 text-white border-gray-900'
          : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
      }`}
    >
      {label} {sortField === field ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
    </button>
  );

  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Fleet Assets</CardTitle>
            <CardDescription>{assets.length} vehicles - page {currentPage} of {pageCount}</CardDescription>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-gray-400 mr-1">Sort:</span>
            <SortBtn field="name" label="Name" />
            <SortBtn field="battery" label="Battery" />
            <SortBtn field="status" label="Status" />
          </div>
        </div>
        {/* Column Headers */}
        <div className="flex items-center justify-between px-0 pt-3 pb-0 border-t border-border mt-3">
          <div className="grid grid-cols-4 flex-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span>Vehicle</span>
            <span>Driver</span>
            <span>Battery</span>
            <span>Status</span>
          </div>
          <div className="w-24" />
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
        <div ref={parentRef} className="h-64 overflow-auto">
          <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
            {rowVirtualizer.getVirtualItems().map((vRow) => {
              const asset = pagedAssets[vRow.index];
              return (
                <div
                  key={asset.id}
                  style={{ height: `${vRow.size}px`, transform: `translateY(${vRow.start}px)` }}
                  className="absolute top-0 left-0 w-full flex items-center justify-between px-5 border-b border-border/50 hover:bg-accent/50 transition-colors group"
                >
                  <div className="grid grid-cols-4 flex-1 items-center gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-1.5 h-8 rounded-full ${statusDot[asset.status]}`} />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">{asset.name}</p>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] text-gray-400">{asset.type}</span>
                          {asset.tags?.map(t => (
                            <span key={t} className="text-[9px] bg-zinc-100 text-zinc-600 px-1 py-0.2 rounded border border-zinc-200">{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 truncate">{asset.driverName || '—'}</p>
                    <div className="flex items-center gap-2">
                      <Progress value={asset.battery} className="w-16 h-1" />
                      <span className="text-[11px] text-gray-500">{asset.battery.toFixed(0)}%</span>
                    </div>
                    <Badge variant={statusColor[asset.status] as any} className="w-fit">
                      {asset.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => onAction(asset.id, 'Lock')}
                            className="p-1.5 rounded-lg bg-secondary hover:bg-gray-200 transition"
                          ><Lock size={11} /></button>
                        </TooltipTrigger>
                        <TooltipContent>Lock Vehicle</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => onAction(asset.id, 'Reroute')}
                            className="p-1.5 rounded-lg bg-secondary hover:bg-gray-200 transition"
                          ><RotateCcw size={11} /></button>
                        </TooltipTrigger>
                        <TooltipContent>Reroute Asset</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => onAction(asset.id, 'Maintenance')}
                            className="p-1.5 rounded-lg bg-secondary hover:bg-gray-200 transition"
                          ><Construction size={11} /></button>
                        </TooltipTrigger>
                        <TooltipContent>Dispatch Maintenance</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
      <div className="flex items-center justify-between border-t border-border px-5 py-3">
        <span className="text-xs text-muted-foreground">
          Showing {pagedAssets.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, assets.length)} of {assets.length}
        </span>
        <div className="flex gap-2">
          <button type="button" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)} className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50">
            Previous
          </button>
          <button type="button" disabled={currentPage === pageCount} onClick={() => onPageChange(currentPage + 1)} className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50">
            Next
          </button>
        </div>
      </div>
    </Card>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

const Dashboard = () => {
  const { state, performRemoteAction } = useFleet();
  
  // Use our new URL sync hook
  const { filters, setFilter } = useUrlFilters();
  
  // Get all assets and apply URL filters
  const allAssets = useMemo(() => Object.values(state.assets), [state.assets]);
  const displayedAssets = useMemo(() => filterAssets(allAssets, filters), [allAssets, filters]);


  const handleAction = async (id: string, action: RemoteActionType) => {
    const updates: Partial<Asset> = action === 'Lock' ? { status: 'Offline' } : { status: 'Maintenance' };
    try {
      await performRemoteAction(id, action, updates);
      toast.success(`${action} dispatched successfully!`);
    } catch {
      // toast.error is already triggered in context
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Fleet Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Triage exceptions, track cost trends, and monitor <span className="border-b border-dashed border-gray-400 pb-0.5">fleet health</span>.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm flex items-center gap-2">
            Last 30 days <ChevronRight size={12} className="rotate-90 text-gray-400" />
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100">
            <Activity size={14} /> Updated just now
          </div>
        </div>
      </div>


      {/* Dual-split Data Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AssetStatusChart assets={allAssets} />
        <PowertrainMix assets={allAssets} />
      </div>

      {/* Asset Table with Filters */}
      <div className="space-y-4 pt-4">
        <FilterPanel filters={filters} setFilter={setFilter} totalAssets={allAssets.length} filteredCount={displayedAssets.length} />
        <AssetTable
          assets={displayedAssets}
          onAction={handleAction}
          sortField={filters.sortBy}
          sortDirection={filters.sortDirection}
          page={filters.page}
          pageSize={filters.pageSize}
          onSortChange={(field, direction) => {
            setFilter('sortBy', field);
            setFilter('sortDirection', direction);
            setFilter('page', 1);
          }}
          onPageChange={(page) => setFilter('page', page)}
        />
      </div>

    </div>
  );
};

export default Dashboard;
