import React, { useMemo, useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Users, UserCheck, UserX, Star, Search, Plus } from 'lucide-react';
import { toast } from 'react-toastify';

// Generate stable driver list from assets
const getRating = (seed: string) => {
  const n = seed.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return (3.5 + (n % 15) / 10).toFixed(1);
};
const getTrips = (seed: string) => {
  const n = seed.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return 50 + (n % 300);
};

const Drivers = () => {
  const { state } = useFleet();
  const [search, setSearch] = useState('');
  const assets = useMemo(() => Object.values(state.assets), [state.assets]);

  const drivers = useMemo(() => {
    const seen = new Set<string>();
    return assets
      .filter(a => a.driverName && !seen.has(a.driverName) && seen.add(a.driverName!))
      .map(a => ({
        name: a.driverName!,
        vehicle: a.name,
        type: a.type,
        status: a.status,
        trips: getTrips(a.driverName!),
        rating: getRating(a.driverName!),
      }));
  }, [assets]);

  const filtered = useMemo(() =>
    drivers.filter(d => d.name.toLowerCase().includes(search.toLowerCase())),
    [drivers, search]
  );

  const active = drivers.filter(d => d.status === 'Active').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Drivers</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage driver profiles, assignments, and performance.</p>
        </div>
        <button 
          onClick={() => toast.info('Add Driver functionality coming soon!')}
          className="flex items-center gap-2 bg-black text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-800 transition"
        >
          <Plus size={14} /> Add Driver
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Drivers', value: drivers.length, icon: Users, color: 'text-gray-700' },
          { label: 'On Duty', value: active, icon: UserCheck, color: 'text-emerald-600' },
          { label: 'Off Duty', value: drivers.length - active, icon: UserX, color: 'text-red-500' },
          { label: 'Avg. Rating', value: `${(drivers.reduce((s, d) => s + parseFloat(d.rating), 0) / (drivers.length || 1)).toFixed(1)} ★`, icon: Star, color: 'text-amber-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center">
                <Icon size={20} className={color} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
                <p className="text-2xl font-bold">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Driver Table */}
      <Card>
        <CardHeader className="pb-5">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search drivers..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full text-sm bg-secondary border border-border rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <span className="text-sm font-medium text-muted-foreground ml-auto">{filtered.length} drivers</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-6 px-5 py-2.5 border-y border-border bg-secondary text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span className="col-span-2">Driver</span><span>Vehicle</span><span>Trips</span><span>Rating</span><span>Status</span>
          </div>
          <div className="divide-y divide-border max-h-[480px] overflow-y-auto">
            {filtered.slice(0, 100).map(driver => (
              <div key={driver.name} className="grid grid-cols-6 px-5 py-3.5 items-center hover:bg-accent/50 transition-colors cursor-pointer">
                <div className="col-span-2 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold">
                    {driver.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{driver.name}</span>
                </div>
                <span className="text-sm text-gray-600">{driver.vehicle}</span>
                <span className="text-sm text-gray-600">{driver.trips}</span>
                <span className="text-sm font-medium text-amber-600 flex items-center gap-1">
                  <Star size={11} className="fill-amber-500 stroke-amber-500" /> {driver.rating}
                </span>
                <Badge variant={driver.status === 'Active' ? 'success' : driver.status === 'Idle' ? 'secondary' : 'destructive'} className="w-fit">
                  {driver.status === 'Active' ? 'On Duty' : driver.status === 'Idle' ? 'Idle' : 'Off Duty'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Drivers;
