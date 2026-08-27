import React, { useEffect, useRef } from 'react';
import { useFleet } from '../context/FleetContext';
import { ToastContainer } from 'react-toastify';
import { useSearchParams, useLocation } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import {
  LayoutDashboard, Radio, Truck, Users, Wrench,
  BarChart3, Settings, LogOut, Bell, Search, ChevronRight
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Radio, label: 'Live Tracking', path: '/tracking' },
  { icon: Truck, label: 'Vehicles', path: '/vehicles' },
  { icon: Users, label: 'Drivers', path: '/drivers' },
  { icon: Wrench, label: 'Maintenance', path: '/maintenance' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
];

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { dispatch, state } = useFleet();
  const workerRef = useRef<Worker | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../workers/telemetryWorker.ts', import.meta.url),
      { type: 'module' }
    );
    workerRef.current.onmessage = (e) => {
      if (e.data.type === 'INITIAL_STATE' || e.data.type === 'TELEMETRY_UPDATE') {
        dispatch({ type: 'UPSERT_ASSETS', payload: e.data.payload });
      }
    };
    workerRef.current.postMessage('START');
    return () => {
      workerRef.current?.postMessage('STOP');
      workerRef.current?.terminate();
    };
  }, [dispatch]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
      `}</style>

      <div className="flex h-screen bg-[#F7F8FA] text-gray-900 overflow-hidden">

        {/* Offline Banner */}
        {state.isOffline && (
          <div className="absolute top-0 left-0 w-full bg-black text-white text-center py-1.5 z-50 text-xs font-medium tracking-wide uppercase">
            ⚡ Offline — Displaying cached data
          </div>
        )}

        {/* Sidebar */}
        <aside className="w-60 bg-white flex flex-col h-full shrink-0 border-r border-gray-100">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center">
                <Radio size={14} className="text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight">FleetPulse</span>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 py-5 px-3 space-y-0.5 overflow-y-auto">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-3 mb-3">Main Menu</p>
            {navItems.map(({ icon: Icon, label, path }) => {
              const isActive = location.pathname === path;
              return (
                <a
                  key={label}
                  href={path}
                  onClick={e => e.preventDefault()}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                    isActive
                      ? 'bg-black text-white shadow-sm'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-700'} />
                  <span>{label}</span>
                  {isActive && <ChevronRight size={14} className="ml-auto opacity-60" />}
                </a>
              );
            })}

            <div className="pt-4 mt-4 border-t border-gray-100">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-3 mb-3">System</p>
              <a href="#" onClick={e => e.preventDefault()} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all">
                <Settings size={16} className="text-gray-400" />
                Settings
              </a>
              <a href="#" onClick={e => e.preventDefault()} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-50 hover:text-red-600 transition-all">
                <LogOut size={16} />
                Log out
              </a>
            </div>
          </nav>

          {/* User Card */}
          <div className="p-3 border-t border-gray-100">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold">MG</div>
              <div>
                <p className="text-sm font-semibold leading-none">Mason Greenwood</p>
                <p className="text-xs text-gray-400 mt-0.5">Fleet Dispatcher</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 flex flex-col h-full min-w-0">
          {/* Header */}
          <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 shrink-0">
            <div className="relative flex-1 max-w-md">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search vehicles, drivers..."
                value={searchParams.get('q') || ''}
                onChange={(e) => {
                  const newParams = new URLSearchParams(searchParams);
                  if (e.target.value) newParams.set('q', e.target.value);
                  else newParams.delete('q');
                  setSearchParams(newParams);
                }}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-9 pr-4 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-300 transition"
              />
            </div>
            <div className="flex items-center gap-4">
              <button className="relative w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center hover:bg-gray-100 transition">
                <Bell size={16} className="text-gray-600" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-black rounded-full border-2 border-white"></span>
              </button>
              <div className="w-9 h-9 rounded-xl bg-gray-900 text-white flex items-center justify-center text-xs font-bold cursor-pointer">MG</div>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-7">
            {children}
          </div>
        </main>

        <ToastContainer
          position="bottom-right"
          toastClassName="!rounded-xl !text-sm !font-medium"
          bodyClassName="!text-sm"
        />
      </div>
    </>
  );
};

export default Layout;
