import React, { useMemo, useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Truck, Car, Bus, Battery, Filter, Search, Plus } from 'lucide-react';
import { toast } from 'react-toastify';

const typeIcon = { Truck: Truck, Van: Bus, Car: Car };

const Vehicles = () => {
  const { state } = useFleet();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const assets = useMemo(() => Object.values(state.assets), [state.assets]);

  const filtered = useMemo(() =>
    assets.filter(a => {
      const matchSearch = a.name.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === 'All' || a.type === typeFilter;
      return matchSearch && matchType;
    }),
    [assets, search, typeFilter]
  );

  const totals = useMemo(() => ({
    Truck: assets.filter(a => a.type === 'Truck').length,
    Van: assets.filter(a => a.type === 'Van').length,
    Car: assets.filter(a => a.type === 'Car').length,
  }), [assets]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Vehicles</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage and monitor your entire fleet.</p>
        </div>
        <button 
          onClick={() => toast.info('Add Vehicle functionality coming soon!')}
          className="flex items-center gap-2 bg-black text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-800 transition"
        >
          <Plus size={14} /> Add Vehicle
        </button>
      </div>

      {/* Type Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {(['Truck', 'Van', 'Car'] as const).map(type => {
          const Icon = typeIcon[type];
          const count = totals[type];
          const available = assets.filter(a => a.type === type && (a.status === 'Active' || a.status === 'Idle')).length;
          return (
            <Card
              key={type}
              onClick={() => setTypeFilter(t => t === type ? 'All' : type)}
              className={`cursor-pointer hover:shadow-md transition-all ${typeFilter === type ? 'border-black ring-1 ring-black' : ''}`}
            >
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center">
                  <Icon size={20} className="text-gray-700" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{type}s</p>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs text-emerald-600 font-medium">{available} available</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-5">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search vehicles..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full text-sm bg-secondary border border-border rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="text-sm font-medium bg-secondary border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer hover:bg-secondary/80 transition-colors"
            >
              <option value="All">All Types</option>
              <option value="Truck">Trucks</option>
              <option value="Van">Vans</option>
              <option value="Car">Cars</option>
            </select>
            <span className="text-sm font-medium text-muted-foreground ml-auto">{filtered.length} results</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Header */}
          <div className="grid grid-cols-6 px-5 py-2.5 border-y border-border bg-secondary text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span>Vehicle</span><span>Type</span><span>Driver</span><span>Battery</span><span>Speed</span><span>Status</span>
          </div>
          <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
            {filtered.slice(0, 100).map(asset => {
              const Icon = typeIcon[asset.type];
              return (
                <div key={asset.id} className="grid grid-cols-6 px-5 py-3.5 items-center hover:bg-accent/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center">
                      <Icon size={13} className="text-gray-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-800">{asset.name}</span>
                  </div>
                  <span className="text-sm text-gray-600">{asset.type}</span>
                  <span className="text-sm text-gray-600 truncate">{asset.driverName || '—'}</span>
                  <div className="flex items-center gap-2">
                    <Battery size={12} className={asset.battery < 20 ? 'text-red-500' : 'text-gray-400'} />
                    <Progress value={asset.battery} className="w-16 h-1" />
                    <span className="text-xs text-gray-500">{asset.battery.toFixed(0)}%</span>
                  </div>
                  <span className="text-sm text-gray-600">{asset.speed || 0} km/h</span>
                  <Badge variant={
                    asset.status === 'Active' ? 'success' :
                    asset.status === 'Idle' ? 'secondary' :
                    asset.status === 'Maintenance' ? 'warning' : 'destructive'
                  } className="w-fit">
                    {asset.status}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Vehicles;
