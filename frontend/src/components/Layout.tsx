import React, { useEffect, useState } from "react";
import { useFleet } from "../context/FleetContext";
import { ToastContainer } from "react-toastify";
import { useSearchParams, useLocation, Link } from "react-router-dom";
import { useDebounce } from "../hooks/useDebounce";
import "react-toastify/dist/ReactToastify.css";
import {
  LayoutDashboard,
  Radio,
  Truck,
  Users,
  Wrench,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Search,
  ChevronRight,
  Menu,
  AlertCircle,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Radio, label: "Live Tracking", path: "/tracking" },
  { icon: Truck, label: "Vehicles", path: "/vehicles" },
  { icon: Users, label: "Drivers", path: "/drivers" },
  { icon: Wrench, label: "Maintenance", path: "/maintenance" },
  { icon: AlertCircle, label: "Issues", path: "/issues" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
];

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { state } = useFleet();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [isManuallyCollapsed, setIsManuallyCollapsed] = useState(false);
  const [searchInput, setSearchInput] = useState(
    () => searchParams.get("q") || "",
  );
  const debouncedSearch = useDebounce(searchInput, 250);

  const isCollapsed = isManuallyCollapsed || location.pathname === "/tracking";

  // FleetProvider owns the telemetry worker. The layout only debounces the
  // global search query so typing never causes a URL update on every keystroke.
  useEffect(() => {
    const currentQuery = searchParams.get("q") || "";
    if (currentQuery === debouncedSearch) return;

    const nextParams = new URLSearchParams(searchParams);
    if (debouncedSearch) nextParams.set("q", debouncedSearch);
    else nextParams.delete("q");
    setSearchParams(nextParams);
  }, [debouncedSearch, searchParams, setSearchParams]);

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
        <aside
          className={`${isCollapsed ? "w-16" : "w-60"} bg-white flex flex-col h-full shrink-0 border-r border-gray-100 transition-all duration-300 z-50`}
        >
          {/* Logo & Toggle */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
            <div
              className={`flex items-center gap-2.5 overflow-hidden transition-all duration-300 ${isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}
            >
              <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center shrink-0">
                <Radio size={14} className="text-white" />
              </div>
              <span className="font-bold text-lg text-gray-900 tracking-tight whitespace-nowrap">
                FleetPulse
              </span>
            </div>
            <button
              onClick={() => setIsManuallyCollapsed(!isManuallyCollapsed)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition shrink-0"
            >
              <Menu size={18} />
            </button>
          </div>

          {/* Nav */}
          <nav
            className={`flex-1 py-5 space-y-1 overflow-y-auto ${isCollapsed ? "px-2" : "px-3"}`}
          >
            {!isCollapsed && (
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-3 mb-3">
                Main Menu
              </p>
            )}
            {navItems.map(({ icon: Icon, label, path }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={label}
                  to={path}
                  title={isCollapsed ? label : undefined}
                  className={`flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                    isCollapsed ? "justify-center px-0" : "px-3"
                  } ${
                    isActive
                      ? "bg-black text-white shadow-sm"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon
                    size={isCollapsed ? 18 : 16}
                    className={
                      isActive
                        ? "text-white"
                        : "text-gray-400 group-hover:text-gray-700 shrink-0"
                    }
                  />
                  {!isCollapsed && <span>{label}</span>}
                </Link>
              );
            })}

            <div
              className={`pt-4 mt-4 border-t border-gray-100 ${isCollapsed ? "" : "px-3"}`}
            >
              {!isCollapsed && (
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
                  System
                </p>
              )}
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                title={isCollapsed ? "Settings" : undefined}
                className={`flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all ${isCollapsed ? "justify-center" : "px-3"}`}
              >
                <Settings size={isCollapsed ? 18 : 16} className="shrink-0" />
                {!isCollapsed && <span>Settings</span>}
              </a>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                title={isCollapsed ? "Log out" : undefined}
                className={`flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-50 hover:text-red-600 transition-all ${isCollapsed ? "justify-center" : "px-3"}`}
              >
                <LogOut size={isCollapsed ? 18 : 16} className="shrink-0" />
                {!isCollapsed && <span>Log out</span>}
              </a>
            </div>
          </nav>

          {/* User Card */}
          <div
            className={`p-3 border-t border-gray-100 ${isCollapsed ? "flex justify-center" : ""}`}
          >
            <div
              className={`flex items-center gap-3 py-2.5 rounded-xl hover:bg-gray-50 transition cursor-pointer ${isCollapsed ? "justify-center px-0" : "px-3"}`}
            >
              <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                MG
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-none text-gray-900 truncate">
                    Mason Greenwood
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">
                    Fleet Dispatcher
                  </p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 flex flex-col h-full min-w-0">
          {/* Header */}
          <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 shrink-0">
            <div className="relative flex-1 max-w-md">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search vehicles, drivers..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-9 pr-4 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-300 transition"
              />
            </div>
            <div className="flex items-center gap-4">
              <button className="relative w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center hover:bg-gray-100 transition">
                <Bell size={16} className="text-gray-600" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-black rounded-full border-2 border-white"></span>
              </button>
              <div className="w-9 h-9 rounded-xl bg-gray-900 text-white flex items-center justify-center text-xs font-bold cursor-pointer">
                MG
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-7">{children}</div>
        </main>

        <ToastContainer
          position="bottom-right"
          toastClassName="!rounded-xl !text-sm !font-medium"
          style={{ fontSize: '0.875rem' }}
        />
      </div>
    </>
  );
};

export default Layout;
