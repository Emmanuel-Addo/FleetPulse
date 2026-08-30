import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFleet, Asset } from '../context/FleetContext';
import {
  AlertCircle, Plus, Search, Battery, MapPin,
  Wifi, Zap, ShieldAlert, AlertTriangle, MoreHorizontal, RefreshCw
} from 'lucide-react';

type Priority = 'Critical' | 'High' | 'Medium' | 'Low';
type IssueStatus = 'Open' | 'In Progress' | 'Acknowledged' | 'Resolved';
type IssueCategory =
  | 'Battery Depletion'
  | 'Route Deviation'
  | 'GPS / Signal Loss'
  | 'Emergency SOS'
  | 'Engine Fault'
  | 'Speeding Violation'
  | 'Communication Failure'
  | 'Unauthorized Stop';

export interface FleetIssue {
  id: string;
  category: IssueCategory;
  summary: string;
  assetId: string;
  assetName: string;
  driverName: string;
  priority: Priority;
  status: IssueStatus;
  battery: number;
  speed: number;
  lat: number;
  lng: number;
  reportedAt: number; // ms timestamp
  assignee?: string;
}

const categoryIcon: Record<IssueCategory, React.ElementType> = {
  'Battery Depletion':      Battery,
  'Route Deviation':        MapPin,
  'GPS / Signal Loss':      Wifi,
  'Emergency SOS':          ShieldAlert,
  'Engine Fault':           AlertTriangle,
  'Speeding Violation':     Zap,
  'Communication Failure':  Wifi,
  'Unauthorized Stop':      MapPin,
};

const categoryColor: Record<IssueCategory, string> = {
  'Battery Depletion':      'text-amber-500 bg-amber-50',
  'Route Deviation':        'text-purple-500 bg-purple-50',
  'GPS / Signal Loss':      'text-blue-500 bg-blue-50',
  'Emergency SOS':          'text-red-600 bg-red-50',
  'Engine Fault':           'text-orange-500 bg-orange-50',
  'Speeding Violation':     'text-rose-500 bg-rose-50',
  'Communication Failure':  'text-sky-500 bg-sky-50',
  'Unauthorized Stop':      'text-violet-500 bg-violet-50',
};

const priorityStyles: Record<Priority, string> = {
  Critical: 'bg-red-100 text-red-700 border border-red-200',
  High:     'bg-orange-100 text-orange-700 border border-orange-200',
  Medium:   'bg-blue-100 text-blue-700 border border-blue-200',
  Low:      'bg-gray-100 text-gray-600 border border-gray-200',
};

const statusStyles: Record<IssueStatus, string> = {
  'Open':         'bg-red-50 text-red-600 border border-red-200',
  'In Progress':  'bg-blue-50 text-blue-600 border border-blue-200',
  'Acknowledged': 'bg-amber-50 text-amber-600 border border-amber-200',
  'Resolved':     'bg-green-50 text-green-600 border border-green-200',
};

// Generate realistic telemetry-based issues from actual asset data
function generateIssues(assets: Asset[]): FleetIssue[] {
  if (assets.length === 0) return [];
  const now = Date.now();
  const issues: FleetIssue[] = [];

  // Critical battery alerts (battery < 10%)
  const lowBattery = assets.filter(a => a.battery < 10 && a.status === 'Active').slice(0, 4);
  lowBattery.forEach((a, i) => {
    issues.push({
      id: `ISS-${String(issues.length + 1).padStart(6, '0')}`,
      category: 'Battery Depletion',
      summary: `${a.name} battery critically low — ${a.battery.toFixed(0)}% remaining while in transit`,
      assetId: a.id, assetName: a.name,
      driverName: a.driverName || 'Unassigned',
      priority: 'Critical', status: i === 0 ? 'Open' : 'Acknowledged',
      battery: a.battery, speed: a.speed || 0, lat: a.lat, lng: a.lng,
      reportedAt: now - i * 1000 * 60 * 23,
      assignee: ['Alex M.', undefined, 'Rita B.', undefined][i],
    });
  });

  // Offline vehicles — treated as communication failures
  const offline = assets.filter(a => a.status === 'Offline').slice(0, 3);
  offline.forEach((a, i) => {
    issues.push({
      id: `ISS-${String(issues.length + 1).padStart(6, '0')}`,
      category: 'Communication Failure',
      summary: `${a.name} telemetry stream lost — no data received for ${10 + i * 5} minutes`,
      assetId: a.id, assetName: a.name,
      driverName: a.driverName || 'Unassigned',
      priority: i === 0 ? 'Critical' : 'High',
      status: i === 0 ? 'Open' : 'In Progress',
      battery: a.battery, speed: 0, lat: a.lat, lng: a.lng,
      reportedAt: now - i * 1000 * 60 * 45,
      assignee: i === 0 ? 'James O.' : undefined,
    });
  });

  // Speeding violations — active assets going fast
  const speeding = assets.filter(a => a.status === 'Active' && (a.speed || 0) > 70).slice(0, 3);
  speeding.forEach((a, i) => {
    issues.push({
      id: `ISS-${String(issues.length + 1).padStart(6, '0')}`,
      category: 'Speeding Violation',
      summary: `${a.name} exceeded speed limit — recorded at ${a.speed} km/h in a restricted zone`,
      assetId: a.id, assetName: a.name,
      driverName: a.driverName || 'Unassigned',
      priority: 'High', status: i === 0 ? 'Open' : 'Acknowledged',
      battery: a.battery, speed: a.speed || 0, lat: a.lat, lng: a.lng,
      reportedAt: now - i * 1000 * 60 * 62,
      assignee: 'Sarah K.',
    });
  });

  // Route deviations — pick some active assets
  const routed = assets.filter(a => a.status === 'Active').slice(5, 8);
  routed.forEach((a, i) => {
    issues.push({
      id: `ISS-${String(issues.length + 1).padStart(6, '0')}`,
      category: 'Route Deviation',
      summary: `${a.name} deviated from assigned dispatch route — ${(Math.random() * 3 + 1).toFixed(1)} km off path`,
      assetId: a.id, assetName: a.name,
      driverName: a.driverName || 'Unassigned',
      priority: i === 0 ? 'High' : 'Medium', status: 'Open',
      battery: a.battery, speed: a.speed || 0, lat: a.lat, lng: a.lng,
      reportedAt: now - i * 1000 * 60 * 90,
    });
  });

  // GPS loss
  const gpsLoss = assets.filter(a => a.status === 'Maintenance').slice(0, 2);
  gpsLoss.forEach((a, i) => {
    issues.push({
      id: `ISS-${String(issues.length + 1).padStart(6, '0')}`,
      category: 'GPS / Signal Loss',
      summary: `${a.name} GPS module unresponsive — last known position: ${a.lat.toFixed(4)}, ${a.lng.toFixed(4)}`,
      assetId: a.id, assetName: a.name,
      driverName: a.driverName || 'Unassigned',
      priority: 'Medium', status: i === 0 ? 'In Progress' : 'Resolved',
      battery: a.battery, speed: 0, lat: a.lat, lng: a.lng,
      reportedAt: now - i * 1000 * 60 * 120,
      assignee: 'Daniel F.',
    });
  });

  // Only return first 5 issues total
  return issues.slice(0, 5);
}

const CATEGORIES: IssueCategory[] = [
  'Battery Depletion', 'Route Deviation', 'GPS / Signal Loss',
  'Emergency SOS', 'Engine Fault', 'Speeding Violation',
  'Communication Failure', 'Unauthorized Stop',
];

const Issues = () => {
  const { state } = useFleet();
  const assets = useMemo(() => Object.values(state.assets), [state.assets]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const allIssues = useMemo(() => generateIssues(assets), [assets.length > 0 ? assets[0].id : '']);

  const issues = useMemo(() => allIssues.filter(issue => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      issue.summary.toLowerCase().includes(q) ||
      issue.assetName.toLowerCase().includes(q) ||
      issue.id.toLowerCase().includes(q) ||
      issue.driverName.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'All' || issue.status === statusFilter;
    const matchCat = categoryFilter === 'All' || issue.category === categoryFilter;
    return matchSearch && matchStatus && matchCat;
  }), [allIssues, search, statusFilter, categoryFilter]);

  const openCount = allIssues.filter(i => i.status === 'Open').length;
  const criticalCount = allIssues.filter(i => i.priority === 'Critical').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <AlertCircle size={22} className="text-red-500" />
            Telemetry Issues
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time alerts from IoT modules — battery depletions, route deviations, signal loss, and emergency triggers.
          </p>
        </div>
        <Link
          to="/issues/new"
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm shrink-0"
        >
          <Plus size={15} /> Report Issue
        </Link>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Issues',   value: allIssues.length,  color: 'text-gray-900' },
          { label: 'Open',           value: openCount,          color: 'text-red-600'  },
          { label: 'Critical',       value: criticalCount,      color: 'text-red-700'  },
          { label: 'In Progress',    value: allIssues.filter(i => i.status === 'In Progress').length, color: 'text-blue-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-500">{label}</p>
            <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48 max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" placeholder="Search issues, assets, drivers..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl pl-8 pr-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
          {['All', 'Open', 'In Progress', 'Acknowledged', 'Resolved'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition ${statusFilter === s ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
              {s}
            </button>
          ))}
        </div>

        <select
          value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
          className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-3.5 bg-gray-50/80 border-b border-gray-100 grid grid-cols-[24px_48px_2fr_180px_110px_100px_110px_110px_36px] gap-4 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          <span />
          <span>#</span>
          <span>Summary</span>
          <span>Asset / Driver</span>
          <span>Category</span>
          <span>Priority</span>
          <span>Status</span>
          <span>Reported</span>
          <span />
        </div>

        {issues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-300">
            <AlertCircle size={36} className="mb-3" />
            <p className="text-sm font-medium text-gray-500">No issues match your filters</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {issues.map(issue => {
              const CatIcon = categoryIcon[issue.category];
              const catColor = categoryColor[issue.category];
              const ageMs = Date.now() - issue.reportedAt;
              const ageMin = Math.floor(ageMs / 60000);
              const ageLabel = ageMin < 60 ? `${ageMin}m ago` : ageMin < 1440 ? `${Math.floor(ageMin / 60)}h ago` : `${Math.floor(ageMin / 1440)}d ago`;

              return (
                <div key={issue.id}
                  className="grid grid-cols-[24px_48px_2fr_180px_110px_100px_110px_110px_36px] gap-4 items-center px-6 py-5 hover:bg-gray-50/60 transition-colors group border-b border-gray-50 last:border-b-0"
                >
                  {/* Urgent dot */}
                  <span>{issue.status === 'Open' && issue.priority === 'Critical' && (
                    <span className="block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  )}</span>

                  {/* ID */}
                  <span className="text-[11px] text-gray-400 font-mono">{issue.id.replace('ISS-', '')}</span>

                  {/* Summary */}
                  <div className="min-w-0 pr-6">
                    <Link to={`/issues/${issue.id}`}
                      className="text-xs font-semibold text-blue-600 hover:underline">{issue.id}
                    </Link>
                    <p className="text-sm text-gray-800 font-medium mt-2 leading-relaxed">
                      {issue.summary}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-[11px] text-gray-400">
                      <span className="flex items-center gap-1"><Battery size={11} />{issue.battery.toFixed(0)}% battery</span>
                      <span className="flex items-center gap-1"><Zap size={11} />{issue.speed} km/h</span>
                      <span className="flex items-center gap-1"><MapPin size={11} />{issue.lat.toFixed(3)}, {issue.lng.toFixed(3)}</span>
                    </div>
                  </div>

                  {/* Asset / Driver */}
                  <div>
                    <p className="text-xs font-semibold text-gray-800 truncate">{issue.assetName}</p>
                    <p className="text-[11px] text-gray-400 truncate">{issue.driverName}</p>
                  </div>

                  {/* Category */}
                  <div className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-lg w-fit ${catColor}`}>
                    <CatIcon size={10} />
                    <span className="truncate max-w-[70px]">{issue.category.split(' ')[0]}</span>
                  </div>

                  {/* Priority */}
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md w-fit ${priorityStyles[issue.priority]}`}>
                    {issue.priority}
                  </span>

                  {/* Status */}
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md w-fit ${statusStyles[issue.status]}`}>
                    {issue.status}
                  </span>

                  {/* Reported */}
                  <span className="text-[11px] text-gray-400">{ageLabel}</span>

                  {/* Menu */}
                  <button className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-gray-100 text-gray-400 transition">
                    <MoreHorizontal size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400 text-center">
          Showing {issues.length} of {allIssues.length} issues
        </div>
      </div>
    </div>
  );
};

export default Issues;
