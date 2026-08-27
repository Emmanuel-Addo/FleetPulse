import React, { useMemo } from 'react';
import { useFleet } from '../context/FleetContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { TrendingUp, TrendingDown, Activity, Zap, Truck, Users, AlertTriangle } from 'lucide-react';

const Analytics = () => {
  const { state } = useFleet();
  const assets = useMemo(() => Object.values(state.assets), [state.assets]);

  const stats = useMemo(() => {
    const total = assets.length || 1;
    const active = assets.filter(a => a.status === 'Active').length;
    const offline = assets.filter(a => a.status === 'Offline').length;
    const avgBattery = assets.reduce((s, a) => s + a.battery, 0) / total;
    const avgSpeed = assets.filter(a => a.status === 'Active').reduce((s, a) => s + (a.speed || 0), 0) / (active || 1);
    return { total, active, offline, avgBattery, avgSpeed };
  }, [assets]);

  const kpis = [
    { label: 'Fleet Utilization', value: Math.round((stats.active / stats.total) * 100), unit: '%', trend: +3.2, icon: Activity },
    { label: 'Avg. Battery Level', value: Math.round(stats.avgBattery), unit: '%', trend: -1.4, icon: Zap },
    { label: 'Active Vehicles', value: stats.active, unit: '', trend: +5.0, icon: Truck },
    { label: 'Offline Vehicles', value: stats.offline, unit: '', trend: -2.1, icon: AlertTriangle },
  ];

  // Fake bar chart data (week)
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const utilization = [72, 80, 68, 85, 91, 60, 45];
  const maxUtil = Math.max(...utilization);

  // Status pie breakdown
  const statuses = [
    { label: 'Active', count: assets.filter(a => a.status === 'Active').length, color: 'bg-emerald-500' },
    { label: 'Idle', count: assets.filter(a => a.status === 'Idle').length, color: 'bg-gray-300' },
    { label: 'Maintenance', count: assets.filter(a => a.status === 'Maintenance').length, color: 'bg-amber-400' },
    { label: 'Offline', count: assets.filter(a => a.status === 'Offline').length, color: 'bg-red-400' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Fleet performance insights and operational trends.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {kpis.map(({ label, value, unit, trend, icon: Icon }) => {
          const up = trend >= 0;
          return (
            <Card key={label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
                    <Icon size={16} className="text-gray-600" />
                  </div>
                  <span className={`text-xs font-semibold flex items-center gap-0.5 ${up ? 'text-emerald-600' : 'text-red-500'}`}>
                    {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                    {Math.abs(trend)}%
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{value}{unit}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Weekly Utilization Bar Chart */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Weekly Fleet Utilization</CardTitle>
            <CardDescription>Active vehicle percentage per day (last 7 days)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3 h-40">
              {days.map((day, i) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-xs font-semibold text-gray-700">{utilization[i]}%</span>
                  <div className="w-full rounded-t-md bg-gray-100 relative" style={{ height: '100px' }}>
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-black rounded-t-md transition-all duration-700"
                      style={{ height: `${(utilization[i] / maxUtil) * 100}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-muted-foreground">{day}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fleet Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Status Breakdown</CardTitle>
            <CardDescription>Current distribution across all assets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {statuses.map(({ label, count, color }) => {
              const pct = Math.round((count / (assets.length || 1)) * 100);
              return (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${color}`} />
                      <span className="text-xs text-gray-600">{label}</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-800">{count} <span className="text-muted-foreground font-normal">({pct}%)</span></span>
                  </div>
                  <Progress value={pct} className="h-1.5" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Battery Health Heatmap (simulated) */}
      <Card>
        <CardHeader>
          <CardTitle>Battery Health Overview</CardTitle>
          <CardDescription>Distribution of battery levels across the entire fleet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {[
              { label: '0–20%', count: assets.filter(a => a.battery <= 20).length, color: 'bg-red-500', text: 'text-white' },
              { label: '21–40%', count: assets.filter(a => a.battery > 20 && a.battery <= 40).length, color: 'bg-amber-400', text: 'text-white' },
              { label: '41–60%', count: assets.filter(a => a.battery > 40 && a.battery <= 60).length, color: 'bg-yellow-300', text: 'text-gray-800' },
              { label: '61–80%', count: assets.filter(a => a.battery > 60 && a.battery <= 80).length, color: 'bg-emerald-300', text: 'text-gray-800' },
              { label: '81–100%', count: assets.filter(a => a.battery > 80).length, color: 'bg-emerald-500', text: 'text-white' },
            ].map(({ label, count, color, text }) => (
              <div key={label} className={`flex-1 min-w-28 ${color} rounded-xl p-4 flex flex-col items-center`}>
                <p className={`text-2xl font-bold ${text}`}>{count}</p>
                <p className={`text-xs mt-1 font-medium ${text} opacity-80`}>{label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
