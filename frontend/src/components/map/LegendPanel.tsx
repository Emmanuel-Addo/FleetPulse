import React from 'react';
import { X, Layers } from 'lucide-react';
import { GlassPanel } from '../ui/GlassPanel';

interface LegendItem {
  id: string;
  swatch: string;
  label: string;
  desc: string;
  gradient?: string;
  lowLabel?: string;
  highLabel?: string;
}

const ALL_LEGEND_ITEMS: LegendItem[] = [
    {
        id: 'active',
        swatch: 'bg-emerald-500 border border-emerald-400',
        label: 'Active Vehicles',
        desc: 'Currently in transit or operational',
    },
    {
        id: 'idle',
        swatch: 'bg-gray-400 border border-gray-300',
        label: 'Idle Vehicles',
        desc: 'Online but not in motion',
    },
    {
        id: 'maintenance',
        swatch: 'bg-amber-500 border border-amber-400',
        label: 'Maintenance',
        desc: 'Scheduled service or flagged issues',
    },
    {
        id: 'offline',
        swatch: 'bg-red-500 border border-red-400',
        label: 'Offline / Critical',
        desc: 'Connection lost or critical alerts',
    }
];

interface LegendPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeLayers?: string[];
  className?: string;
}

export const LegendPanel = ({ isOpen, onClose, activeLayers = [], className = '' }: LegendPanelProps) => {
    if (!isOpen) return null;

    const visibleItems = ALL_LEGEND_ITEMS.filter(item => activeLayers.includes(item.id));

    return (
        <div className={`z-50 ${className}`}>
            <GlassPanel className="min-w-[220px] rounded-xl">
                <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
                    <div className="flex items-center gap-2">
                        <Layers size={12} className="text-brand-gold/60" />
                        <span className="text-[10px] font-medium text-white/72">
                            Active layers
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded p-1 text-white/30 transition-all hover:bg-white/6 hover:text-white/70"
                    >
                        <X size={12} />
                    </button>
                </div>

                <div className="flex flex-col gap-3 px-4 py-3">
                    {visibleItems.length === 0 ? (
                        <p className="py-2 text-center text-[10px] font-medium text-white/34">
                            No active layers
                        </p>
                    ) : (
                        visibleItems.map(item => (
                            <div key={item.id} className="flex flex-col gap-2">
                                <div className="flex items-center gap-3">
                                    {item.gradient ? (
                                        <div className="w-full min-w-0">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-medium leading-none text-white/78">
                                                        {item.label}
                                                    </span>
                                                    <span className="mt-0.5 text-[9px] text-white/38">
                                                        {item.desc}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="mt-2">
                                                <div
                                                    className="h-2.5 w-full rounded-full border border-white/10"
                                                    style={{ background: item.gradient }}
                                                />
                                                <div className="mt-1 flex items-center justify-between text-[8px] uppercase tracking-[0.08em] text-white/34">
                                                    <span>{item.lowLabel}</span>
                                                    <span>{item.highLabel}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className={`h-4 w-4 shrink-0 rounded-sm ${item.swatch}`} />
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-medium leading-none text-white/78">
                                                    {item.label}
                                                </span>
                                                <span className="mt-0.5 text-[9px] text-white/38">
                                                    {item.desc}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </GlassPanel>
        </div>
    );
};
