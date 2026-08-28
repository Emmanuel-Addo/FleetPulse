import React, { useMemo, useState, useCallback } from 'react';
import { useFleet, Asset } from '../context/FleetContext';
import { FLEET_ASSETS, FleetAsset } from '../assets/assets';
import MapComponent from '../components/map/MapComponent';
import { toast } from 'react-toastify';
import { useDebounce } from '../hooks/useDebounce';
import {
  Search, Battery, Zap, MapPin, User, Radio,
  Wifi, ShieldAlert, Truck, Car, Bus,
  ChevronRight, Clock, AlertTriangle, Navigation
} from 'lucide-react';

// ─── Status helpers ───────────────────────────────────────────────────────────
const statusDot: Record<string, string> = {
  Active:      'bg-emerald-500',
  Idle:        'bg-gray-400',
  Maintenance: 'bg-amber-500',
  Offline:     'bg-red-500',
};
const statusText: Record<string, string> = {
  Active:      'text-emerald-600',
  Idle:        'text-gray-500',
  Maintenance: 'text-amber-600',
  Offline:     'text-red-600',
};
const TypeIcon: Record<string, React.ElementType> = {
  Truck: Truck,
  Van:   Bus,
  Car:   Car,
};

// ─── Alert badge ─────────────────────────────────────────────────────────────
function AlertBadge({ asset }: { asset: Asset }) {
  if (asset.battery < 10 && asset.status === 'Active')
    return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-200"><AlertTriangle size={10} /> Low battery</span>;
  if (asset.status === 'Offline')
    return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200"><Wifi size={10} /> Signal lost</span>;
  if ((asset.speed || 0) > 70)
    return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200"><Zap size={10} /> Speeding</span>;
  return null;
}

// ─── Sidebar asset card ───────────────────────────────────────────────────────
function AssetCard({ asset, isSelected, onClick }: { asset: Asset; isSelected: boolean; onClick: () => void }) {
  const Icon = TypeIcon[asset.type] || Truck;
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-5 py-4 border-b border-gray-100 transition-colors group ${
        isSelected ? 'bg-gray-900 text-white' : 'bg-white hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Status dot + Icon */}
        <div className={`mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-white/10' : 'bg-gray-100'}`}>
          <Icon size={16} className={isSelected ? 'text-white' : 'text-gray-500'} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className={`text-sm font-semibold truncate ${isSelected ? 'text-white' : 'text-gray-900'}`}>
              {asset.name}
            </span>
            <div className="flex items-center gap-1 shrink-0">
              <span className={`w-1.5 h-1.5 rounded-full ${statusDot[asset.status]}`} />
              <span className={`text-[11px] font-medium ${isSelected ? 'text-gray-300' : statusText[asset.status]}`}>
                {asset.status}
              </span>
            </div>
          </div>

          {asset.driverName && (
            <div className={`flex items-center gap-1 text-[11px] mt-0.5 ${isSelected ? 'text-gray-400' : 'text-gray-500'}`}>
              <User size={10} /> {asset.driverName}
            </div>
          )}

          <div className={`flex items-center gap-3 mt-2 text-[11px] ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
            <span className="flex items-center gap-1">
              <Battery size={11} className={asset.battery < 15 ? 'text-red-400' : ''} />
              <span className={asset.battery < 15 ? 'text-red-400 font-semibold' : ''}>{asset.battery.toFixed(0)}%</span>
            </span>
            <span className="flex items-center gap-1">
              <Zap size={11} /> {asset.speed || 0} km/h
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={11} /> {asset.lat.toFixed(2)}, {asset.lng.toFixed(2)}
            </span>
          </div>

          <div className="mt-1.5">
            <AlertBadge asset={asset} />
          </div>
        </div>
      </div>
    </button>
  );
}

// ─── Selected vehicle detail panel ────────────────────────────────────────────
function VehicleDetail({ asset, onClose }: { asset: Asset; onClose: () => void }) {
  const Icon = TypeIcon[asset.type] || Truck;
  return (
    <div className="absolute bottom-6 right-6 z-[600] w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className={`px-4 py-3 flex items-center justify-between ${asset.status === 'Active' ? 'bg-emerald-600' : asset.status === 'Offline' ? 'bg-red-600' : 'bg-amber-500'}`}>
        <div className="flex items-center gap-2 text-white">
          <Icon size={16} />
          <span className="font-bold text-sm">{asset.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/80 bg-white/20 px-2 py-0.5 rounded-full">{asset.status}</span>
          <button onClick={onClose} className="text-white/70 hover:text-white text-lg leading-none">×</button>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Driver */}
        {asset.driverName && (
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <User size={14} className="text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Driver</p>
              <p className="text-sm font-semibold text-gray-900">{asset.driverName}</p>
            </div>
          </div>
        )}

        {/* Telemetry grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { label: 'Battery', value: `${asset.battery.toFixed(0)}%`, icon: Battery, warn: asset.battery < 15 },
            { label: 'Speed', value: `${asset.speed || 0} km/h`, icon: Zap, warn: (asset.speed || 0) > 70 },
            { label: 'Type', value: asset.type, icon: Truck, warn: false },
            { label: 'ID', value: asset.id, icon: Radio, warn: false },
          ].map(({ label, value, icon: Icon, warn }) => (
            <div key={label} className={`rounded-xl p-3 ${warn ? 'bg-red-50 border border-red-100' : 'bg-gray-50 border border-gray-100'}`}>
              <div className="flex items-center gap-1.5 mb-1">
                <Icon size={11} className={warn ? 'text-red-500' : 'text-gray-400'} />
                <span className="text-[10px] text-gray-500 uppercase tracking-wide">{label}</span>
              </div>
              <p className={`text-sm font-bold ${warn ? 'text-red-600' : 'text-gray-900'}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Coordinates */}
        <div className="flex items-center gap-1.5 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
          <Navigation size={13} className="text-gray-400 shrink-0" />
          <span className="text-xs text-gray-600 font-mono">
            {asset.lat.toFixed(6)}, {asset.lng.toFixed(6)}
          </span>
        </div>

        {/* Alerts */}
        <AlertBadge asset={asset} />
      </div>
    </div>
  );
}

// ─── Main LiveTracking ────────────────────────────────────────────────────────
const LiveTracking = () => {
  const { state } = useFleet();
  const allAssets = useMemo(() => Object.values(state.assets), [state.assets]);

  const [activeSubTab, setActiveSubTab] = useState<'Live' | 'Full fleet'>('Live');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  interface MapCommand {
    type: 'flyTo';
    lat: number;
    lng: number;
    zoom: number;
  }
  const [mapCommand, setMapCommand] = useState<MapCommand | null>(null);

  // Sidebar always uses the 6 clean Ghana static assets
  // (easy to explain in demos — each vehicle represents a specific route/scenario)
  const listAssets: FleetAsset[] = useMemo(() => {
    let list = [...FLEET_ASSETS];
    if (activeSubTab === 'Live') list = list.filter(a => a.status === 'Active');
    if (debouncedSearch) list = list.filter(a =>
      a.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      a.driverName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      a.id.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
    return list;
  }, [activeSubTab, debouncedSearch]);

  const handleSelectAsset = useCallback((asset: Asset | FleetAsset) => {
    setSelectedAsset(asset as Asset);
    setMapCommand({ type: 'flyTo', lat: asset.lat, lng: asset.lng, zoom: 13 });
  }, []);

  // Summary counts
  const activeCount = useMemo(() => allAssets.filter(a => a.status === 'Active').length, [allAssets]);
  const offlineCount = useMemo(() => allAssets.filter(a => a.status === 'Offline').length, [allAssets]);
  const alertCount = useMemo(() => allAssets.filter(a => a.battery < 10 || (a.speed || 0) > 70).length, [allAssets]);

  return (
    <div className="flex -m-7 h-[calc(100vh-4rem)] bg-white overflow-hidden">

      {/* ── Map Area ────────────────────────────────────────────── */}
      <div className="flex-1 relative bg-gray-100">
        <MapComponent
          activeLayers={[]}
          mapCommand={mapCommand}
          selectedAssetId={selectedAsset?.id}
          onSelectAsset={handleSelectAsset}
          assets={listAssets}
        />



        {/* Selected vehicle detail card */}
        {selectedAsset && (
          <VehicleDetail
            asset={selectedAsset}
            onClose={() => setSelectedAsset(null)}
          />
        )}

        {/* Top overlay stats */}
        <div className="absolute top-4 right-4 z-[500] flex flex-col gap-2">
          <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {activeCount} vehicles active
            </div>
          </div>
          {alertCount > 0 && (
            <div className="bg-white/90 backdrop-blur-sm border border-red-200 rounded-xl px-3 py-2 shadow-sm">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-red-600">
                <AlertTriangle size={12} />
                {alertCount} active alerts
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Right Sidebar ───────────────────────────────────────── */}
      <div className="w-[420px] flex flex-col shrink-0 border-l border-gray-100 bg-white z-10 shadow-sm mr-4">

        {/* Tabs */}
        <div className="flex px-4 pt-4 pb-3 gap-2 border-b border-gray-100">
          {(['Live', 'Full fleet'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${
                activeSubTab === tab ? 'bg-gray-900 text-white' : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Mini KPI strip */}
        <div className="grid grid-cols-3 border-b border-gray-100">
          {[
            { label: 'Active',  value: activeCount,  color: 'text-emerald-600' },
            { label: 'Offline', value: offlineCount, color: 'text-red-500'    },
            { label: 'Alerts',  value: alertCount,   color: 'text-amber-500'  },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center py-3 border-r border-gray-100 last:border-r-0">
              <p className={`text-lg font-bold ${color}`}>{value}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="px-3 py-2.5 border-b border-gray-100">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search vehicles, drivers..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-7 pr-3 py-2 text-xs text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
            />
          </div>
        </div>

        {/* Asset List */}
        <div className="flex-1 overflow-y-auto">
          {listAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Radio size={28} className="mb-2 text-gray-200" />
              <p className="text-sm font-medium text-gray-500">
                {allAssets.length === 0 ? 'Connecting to telemetry...' : 'No matching vehicles'}
              </p>
            </div>
          ) : (
            listAssets.map(asset => (
              <AssetCard
                key={asset.id}
                asset={asset}
                isSelected={selectedAsset?.id === asset.id}
                onClick={() => handleSelectAsset(asset)}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
          <p className="text-[11px] text-gray-400 text-center">
            Showing {listAssets.length} of {allAssets.length} vehicles
          </p>
        </div>
      </div>
    </div>
  );
};

export default LiveTracking;

