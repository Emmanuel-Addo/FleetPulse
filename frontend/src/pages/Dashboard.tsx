import React, { useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useFleet, Asset, AssetStatus } from '../context/FleetContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '../components/ui/tooltip';
import { toast } from 'react-toastify';
import {
  AlertTriangle, Bell, CheckCircle2, Clock, ShieldAlert, Wrench, ClipboardList,
  ChevronRight, RefreshCw, Lock, RotateCcw, Construction, Filter, SortAsc,
  TrendingUp, TrendingDown, MapPin, Zap, Activity, Truck, Car, Bus
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

function StatTrend({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${up ? 'text-emerald-600' : 'text-red-500'}`}>
      {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {Math.abs(value)}%
    </span>
  );
}

// ─── Action Queue ────────────────────────────────────────────────────────────

interface ActionItem { icon: React.ElementType; label: string; count: number; urgent: boolean; }

function ActionQueue({ assets }: { assets: Asset[] }) {
  const items: ActionItem[] = [
    { icon: Clock,         label: 'Overdue services',           count: assets.filter(a => a.battery < 10).length,            urgent: true  },
    { icon: Bell,          label: 'Reminders due soon',         count: Math.floor(assets.length * 0.02),                    urgent: false },
    { icon: AlertTriangle, label: 'Open critical issues',       count: assets.filter(a => a.battery < 5).length,             urgent: true  },
    { icon: ShieldAlert,   label: 'Compliance expiring',        count: Math.floor(assets.length * 0.005),                   urgent: false },
    { icon: Zap,           label: 'Assets out of service',      count: assets.filter(a => a.status === 'Offline').length,   urgent: true  },
    { icon: Wrench,        label: 'Overdue inspections',        count: assets.filter(a => a.status === 'Maintenance').length, urgent: false },
    { icon: ClipboardList, label: 'Inspections pending',        count: Math.floor(assets.length * 0.015),                  urgent: false },
  ];

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-700">Action queue</h2>
        <button className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1 transition"><RefreshCw size={11} /> Refresh</button>
      </div>
      <div className="grid grid-cols-7 gap-3">
        {items.map(({ icon: Icon, label, count, urgent }) => (
          <Card key={label} className={`cursor-pointer hover:shadow-md transition-all group relative ${urgent && count > 0 ? 'border-red-200 bg-red-50/30' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <Icon size={16} className={urgent && count > 0 ? 'text-red-500' : 'text-gray-400'} />
                {urgent && count > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                )}
              </div>
              <p className={`text-2xl font-bold mb-1 ${urgent && count > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                {count}
              </p>
              <p className="text-[11px] text-gray-500 leading-tight">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
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

// ─── Live Fleet Panel ─────────────────────────────────────────────────────────

function LiveFleetPanel({ assets }: { assets: Asset[] }) {
  const active = assets.filter(a => a.status === 'Active').length;
  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Live fleet</CardTitle>
            <CardDescription className="mt-1">{active} vehicles active right now</CardDescription>
          </div>
          <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 relative min-h-0">
        <img
          src="/map_bg.png"
          alt="Live fleet map"
          className="w-full h-full object-cover min-h-48"
        />
        {/* Overlay vehicle count pills */}
        <div className="absolute bottom-3 left-3 flex gap-2">
          <span className="bg-white/90 backdrop-blur-sm text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm border border-gray-100 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {active} Active
          </span>
          <span className="bg-white/90 backdrop-blur-sm text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm border border-gray-100 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> {assets.filter(a => a.status === 'Offline').length} Offline
          </span>
        </div>
      </CardContent>
      <CardContent className="border-t border-border pt-3 pb-3">
        <button className="text-xs font-medium text-gray-600 hover:text-black flex items-center gap-1 transition">
          Open full map <ChevronRight size={12} />
        </button>
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
    { key: 'Truck', icon: Truck, color: 'bg-gray-900' },
    { key: 'Van',   icon: Bus,   color: 'bg-gray-500' },
    { key: 'Car',   icon: Car,   color: 'bg-gray-300' },
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
              return types.map(({ key, color }) => {
                const pct = counts[key] / total;
                const strokeDasharray = `${pct * circumference} ${circumference}`;
                const el = (
                  <circle
                    key={key}
                    cx="50" cy="50" r="38"
                    fill="none"
                    strokeWidth="12"
                    className={color.replace('bg-', 'stroke-')}
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
          {types.map(({ key, icon: Icon, color }) => (
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

// ─── Compliance Card ──────────────────────────────────────────────────────────

function ComplianceCard({ title, description, value, icon: Icon }: {
  title: string; description: string; value: number; icon: React.ElementType;
}) {
  const color = value >= 80 ? 'text-emerald-600' : value >= 60 ? 'text-amber-600' : 'text-red-500';
  return (
    <Card>
      <CardContent className="p-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-800">{title}</p>
          <p className="text-xs text-gray-400 mt-0.5 mb-3">{description}</p>
          <Progress value={value} className="w-40 h-1.5" />
        </div>
        <div className="flex flex-col items-end gap-1">
          <Icon size={20} className="text-gray-300" />
          <p className={`text-2xl font-bold ${color}`}>{value}%</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Asset Table (Virtualized) ────────────────────────────────────────────────

function AssetTable({ assets, onAction }: { assets: Asset[]; onAction: (id: string, action: string) => void }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') || 'All';
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: assets.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 8,
  });

  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Fleet Assets</CardTitle>
            <CardDescription>{assets.length} vehicles listed</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                const p = new URLSearchParams(searchParams);
                p.set('status', e.target.value);
                setSearchParams(p);
              }}
              className="text-xs bg-secondary border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
            >
              {['All', 'Active', 'Idle', 'Maintenance', 'Offline'].map(s => (
                <option key={s} value={s}>{s === 'All' ? 'All statuses' : s}</option>
              ))}
            </select>
            <button className="p-1.5 bg-secondary border border-border rounded-lg hover:bg-accent transition">
              <Filter size={13} className="text-muted-foreground" />
            </button>
            <button className="p-1.5 bg-secondary border border-border rounded-lg hover:bg-accent transition">
              <SortAsc size={13} className="text-muted-foreground" />
            </button>
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
              const asset = assets[vRow.index];
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
                        <p className="text-[11px] text-gray-400">{asset.type}</p>
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
    </Card>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

const Dashboard = () => {
  const { state, performRemoteAction } = useFleet();
  const [searchParams] = useSearchParams();

  const searchQuery = searchParams.get('q') || '';
  const statusFilter = searchParams.get('status') || 'All';

  const allAssets = useMemo(() => Object.values(state.assets), [state.assets]);

  const filteredAssets = useMemo(() => allAssets.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.driverName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchStatus = statusFilter === 'All' || a.status === statusFilter;
    return matchSearch && matchStatus;
  }), [allAssets, searchQuery, statusFilter]);

  const handleAction = async (id: string, action: string) => {
    const updates: Partial<Asset> = action === 'Lock' ? { status: 'Offline' } : { status: 'Maintenance' };
    try {
      await performRemoteAction(id, action, updates);
      toast.success(`${action} dispatched successfully!`);
    } catch {
      // toast.error is already triggered in context
    }
  };

  const pmCompliance   = useMemo(() => Math.round((allAssets.filter(a => a.status !== 'Maintenance').length / (allAssets.length || 1)) * 100), [allAssets]);
  const inspCompliance = useMemo(() => Math.round((allAssets.filter(a => a.battery > 20).length / (allAssets.length || 1)) * 100), [allAssets]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Fleet Overview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Triage exceptions, track cost trends, and monitor{' '}
            <span className="text-gray-700 font-medium underline decoration-dotted underline-offset-2">fleet health</span>.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select className="text-xs bg-white border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring shadow-sm">
            <option>Last 30 days</option>
            <option>Last 7 days</option>
            <option>Last 90 days</option>
          </select>
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Activity size={12} className="text-emerald-500 animate-pulse" />
            Updated just now
          </span>
        </div>
      </div>

      {/* Action Queue */}
      <ActionQueue assets={allAssets} />

      {/* Middle Row: Asset Status | Live Fleet | Powertrain */}
      <div className="grid grid-cols-3 gap-5">
        <AssetStatusChart assets={allAssets} />
        <LiveFleetPanel assets={allAssets} />
        <PowertrainMix assets={allAssets} />
      </div>

      {/* Compliance Row */}
      <div className="grid grid-cols-2 gap-5">
        <ComplianceCard
          title="PM Compliance"
          description="Preventive maintenance — current state"
          value={pmCompliance}
          icon={Wrench}
        />
        <ComplianceCard
          title="Inspection Compliance"
          description="Inspection schedules — current state"
          value={inspCompliance}
          icon={CheckCircle2}
        />
      </div>

      {/* Asset Table */}
      <AssetTable assets={filteredAssets} onAction={handleAction} />
    </div>
  );
};

export default Dashboard;
