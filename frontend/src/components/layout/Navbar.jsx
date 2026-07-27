import React, { useState } from 'react';
import { useFacility } from '../../context/FacilityContext';
import { 
  Building2, 
  Search, 
  Sun, 
  Moon, 
  Bell, 
  PlusCircle, 
  Layers
} from 'lucide-react';

export const Navbar = ({ activeAlertsCount = 0 }) => {
  const { 
    facilities, 
    selectedFacilityId, 
    setSelectedFacilityId, 
    searchQuery, 
    setSearchQuery, 
    dateFilter, 
    setDateFilter, 
    theme, 
    toggleTheme,
    setIsIngestModalOpen
  } = useFacility();

  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full glass-header px-6 py-3 transition-colors duration-300">
      <div className="flex items-center justify-between gap-4">
        
        {/* Brand / Logo & Live System Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Layers className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-slate-100 via-cyan-200 to-blue-400 light:from-slate-900 light:via-cyan-600 light:to-blue-700 bg-clip-text text-transparent leading-none">
                FacilityOps <span className="text-cyan-400 light:text-cyan-700 text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-950/80 light:bg-cyan-100 border border-cyan-800 light:border-cyan-300 ml-1">AI Energy</span>
              </h1>
              <p className="text-xs text-slate-400 light:text-slate-600 mt-0.5 flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Telemetry Grid Engine Active</span>
              </p>
            </div>
          </div>
        </div>

        {/* Global Controls: Facility Switcher & Search */}
        <div className="flex items-center gap-3 flex-1 max-w-2xl justify-center">
          
          {/* Facility Selector */}
          <div className="relative flex-1 max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 light:text-slate-500">
              <Building2 className="w-4 h-4 text-cyan-400 light:text-cyan-600" />
            </div>
            <select
              value={selectedFacilityId}
              onChange={(e) => setSelectedFacilityId(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs font-medium rounded-xl bg-slate-900/60 light:bg-slate-100 text-slate-200 light:text-slate-900 border border-slate-700/60 light:border-slate-300 focus:outline-none focus:border-cyan-500 transition-all cursor-pointer shadow-inner"
            >
              <option value="ALL">🏢 All Facilities (Enterprise View)</option>
              {facilities.map((fac) => (
                <option key={fac.facility_id} value={fac.facility_id}>
                  {fac.facility_name} ({fac.facility_type})
                </option>
              ))}
            </select>
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 light:text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search telemetry, sensors, metrics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-900/60 light:bg-slate-100 text-slate-200 light:text-slate-900 border border-slate-700/60 light:border-slate-300 focus:outline-none focus:border-cyan-500 transition-all"
            />
          </div>

          {/* Date Filter Pills */}
          <div className="hidden lg:flex items-center bg-slate-900/70 light:bg-slate-200/90 p-1 rounded-xl border border-slate-800 light:border-slate-300 text-xs font-medium text-slate-400 light:text-slate-600">
            {['Today', 'Week', 'Month', 'Year'].map((filter) => (
              <button
                key={filter}
                onClick={() => setDateFilter(filter)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  dateFilter === filter 
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' 
                    : 'hover:text-slate-200 light:hover:text-slate-900'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          
          {/* Manual Telemetry Ingest Button */}
          <button
            onClick={() => setIsIngestModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/25 transition-all transform active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Ingest Telemetry</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-800/60 light:bg-slate-200 border border-slate-700/60 light:border-slate-300 text-slate-300 light:text-slate-700 hover:text-cyan-400 transition-all cursor-pointer"
            title="Toggle Light/Dark Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl bg-slate-800/60 light:bg-slate-200 border border-slate-700/60 light:border-slate-300 text-slate-300 light:text-slate-700 hover:text-cyan-400 transition-all cursor-pointer relative"
            >
              <Bell className="w-4 h-4" />
              {activeAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                  {activeAlertsCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl glass-panel p-4 z-50 border border-slate-700 light:border-slate-300 shadow-2xl text-xs bg-slate-900 light:bg-white">
                <div className="flex items-center justify-between border-b border-slate-700 light:border-slate-200 pb-2 mb-3">
                  <span className="font-semibold text-slate-200 light:text-slate-900">Active Energy Alerts</span>
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 light:text-rose-600 font-mono text-[10px] font-bold">
                    {activeAlertsCount} Unresolved
                  </span>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {activeAlertsCount > 0 ? (
                    <div className="p-2.5 rounded-xl bg-rose-950/40 light:bg-rose-50 border border-rose-800/50 light:border-rose-200 text-rose-200 light:text-rose-900">
                      <p className="font-semibold text-xs">Critical HVAC Spike Detected</p>
                      <p className="text-[11px] text-rose-300/80 light:text-rose-700 mt-1">CyberTech IT Park load exceeded 28% threshold.</p>
                    </div>
                  ) : (
                    <p className="text-slate-400 light:text-slate-500 text-center py-4">No active critical alerts.</p>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
