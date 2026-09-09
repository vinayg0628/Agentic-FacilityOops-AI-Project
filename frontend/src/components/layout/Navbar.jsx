import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFacility } from '../../context/FacilityContext';
import {
  Building2,
  Search,
  Sun,
  Moon,
  Bell,
  PlusCircle,
  Layers,
  Wrench,
  Zap,
  BarChart3,
  AlertTriangle,
  Lightbulb,
  FileText,
  Settings,
  Activity,
  Gauge,
  Calendar,
  BellDot,
  BarChart2,
  LayoutDashboard,
  X,
  ArrowRight,
  Globe
} from 'lucide-react';
import { fetchEquipmentList, fetchMaintenanceAlerts } from '../../services/maintenanceApi';
import { fetchAlerts } from '../../services/api';
import { fetchActiveAlerts as fetchOccupancyAlerts } from '../../services/occupancyService';
import { fetchSecurityAlerts } from '../../services/securityService';

// ──────────────────────────────────────────────
// Static page shortcuts (always available)
// ──────────────────────────────────────────────
const PAGE_SHORTCUTS = [
  { label: 'Dashboard',          path: '/dashboard',               icon: LayoutDashboard,  category: 'Pages' },
  { label: 'Landing Page',       path: '/landing',                 icon: Globe,            category: 'Pages' },
  { label: 'Energy Monitoring',  path: '/energy',                  icon: Zap,              category: 'Pages' },
  { label: 'Analytics',          path: '/analytics',               icon: BarChart3,        category: 'Pages' },
  { label: 'Alerts',             path: '/alerts',                  icon: AlertTriangle,    category: 'Pages' },
  { label: 'Recommendations',    path: '/recommendations',         icon: Lightbulb,        category: 'Pages' },
  { label: 'Reports',            path: '/reports',                 icon: FileText,         category: 'Pages' },
  { label: 'Settings',           path: '/settings',                icon: Settings,         category: 'Pages' },
  { label: 'PM Dashboard',       path: '/maintenance',             icon: Wrench,           category: 'Maintenance' },
  { label: 'Equipment',          path: '/maintenance/equipment',   icon: Activity,         category: 'Maintenance' },
  { label: 'Health Scores',      path: '/maintenance/health',      icon: Gauge,            category: 'Maintenance' },
  { label: 'Predictions',        path: '/maintenance/predictions', icon: BarChart2,        category: 'Maintenance' },
  { label: 'Schedule',           path: '/maintenance/schedule',    icon: Calendar,         category: 'Maintenance' },
  { label: 'PM Alerts',          path: '/maintenance/alerts',      icon: BellDot,          category: 'Maintenance' },
];

export const Navbar = () => {
  const navigate = useNavigate();
  const {
    facilities,
    selectedFacilityId,
    setSelectedFacilityId,
    searchQuery,
    setSearchQuery,
    theme,
    toggleTheme
  } = useFacility();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch]               = useState(false);
  const [localSearch, setLocalSearch]             = useState('');
  const [equipment, setEquipment]                 = useState([]);
  const [results, setResults]                     = useState([]);
  const [allAlerts, setAllAlerts]                 = useState([]);
  const [activeAlertsCount, setActiveAlertsCount] = useState(0);

  const searchRef = useRef(null);
  const inputRef  = useRef(null);

  // Load equipment list once for search
  useEffect(() => {
    fetchEquipmentList().then(data => setEquipment(data)).catch(() => {});
  }, []);

  // Load alerts from all agents
  useEffect(() => {
    const loadAllAlerts = async () => {
      try {
        const [energy, maint, occ, sec] = await Promise.all([
          fetchAlerts(selectedFacilityId, 'ALL', 'Open').catch(() => []),
          fetchMaintenanceAlerts(null, 'ALL', 'Open').catch(() => []),
          fetchOccupancyAlerts(selectedFacilityId).catch(() => []),
          fetchSecurityAlerts(selectedFacilityId, 'Open', 'ALL').catch(() => [])
        ]);

        const combined = [
          ...(energy || []).map(a => ({ ...a, source: 'Energy Agent' })),
          ...(maint || []).map(a => ({ ...a, source: 'Maintenance Agent' })),
          ...(occ || []).map(a => ({ ...a, source: 'Occupancy Agent' })),
          ...(sec || []).map(a => ({ ...a, source: 'Security Agent' }))
        ];
        
        // Sort by timestamp descending
        combined.sort((a, b) => new Date(b.timestamp || b.created_at || 0) - new Date(a.timestamp || a.created_at || 0));
        
        setAllAlerts(combined);
        setActiveAlertsCount(combined.length);
      } catch (err) {
        console.error('Failed to load combined alerts', err);
      }
    };

    loadAllAlerts();
    const interval = setInterval(loadAllAlerts, 30000);
    return () => clearInterval(interval);
  }, [selectedFacilityId]);

  // Focus input when dropdown opens
  useEffect(() => {
    if (showSearch && inputRef.current) inputRef.current.focus();
  }, [showSearch]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearch(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') { setShowSearch(false); setLocalSearch(''); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Real-time search computation
  useEffect(() => {
    const q = localSearch.trim().toLowerCase();
    setSearchQuery(localSearch); // keep context in sync

    if (!q) { setResults([]); return; }

    // Match pages
    const pageMatches = PAGE_SHORTCUTS
      .filter(p => p.label.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
      .map(p => ({ ...p, type: 'page' }));

    // Match equipment (supports both mock keys and real API keys)
    const eqMatches = equipment
      .filter(eq => {
        const name  = (eq.equipment_name || eq.name  || '').toLowerCase();
        const type  = (eq.equipment_type || eq.type  || '').toLowerCase();
        const loc   = (eq.location       || '').toLowerCase();
        const fac   = (eq.facility_id    || '').toLowerCase();
        return name.includes(q) || type.includes(q) || loc.includes(q) || fac.includes(q);
      })
      .slice(0, 6)
      .map(eq => ({
        type:     'equipment',
        label:    eq.equipment_name || eq.name,
        subLabel: eq.equipment_type || eq.type,
        health:   eq.health_score,
        category: eq.health_category,
        path:     '/maintenance/equipment',
        icon:     Wrench,
      }));

    setResults([...pageMatches.slice(0, 4), ...eqMatches]);
  }, [localSearch, equipment]);

  const handleResultClick = (path) => {
    navigate(path);
    setShowSearch(false);
    setLocalSearch('');
  };

  const getHealthColor = (score) => {
    if (!score) return 'text-slate-400';
    if (score >= 75) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-header px-6 py-3 transition-colors duration-300">
      <div className="flex items-center justify-between gap-4">

        {/* Brand / Logo & Live System Status */}
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Layers className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-slate-100 via-cyan-200 to-blue-400 bg-clip-text text-transparent leading-none">
                Smart FacilityOps <span className="text-cyan-400 text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800 ml-1">AI Energy</span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5 font-medium">
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
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Building2 className="w-4 h-4 text-cyan-400" />
            </div>
            <select
              value={selectedFacilityId}
              onChange={(e) => setSelectedFacilityId(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs font-medium rounded-xl bg-slate-900/60 text-slate-200 border border-slate-700/60 focus:outline-none focus:border-cyan-500 transition-all cursor-pointer shadow-inner"
            >
              <option value="ALL">🏢 All Facilities (Enterprise View)</option>
              {facilities.map((fac) => (
                <option key={fac.facility_id} value={fac.facility_id}>
                  {fac.facility_name} ({fac.facility_type})
                </option>
              ))}
            </select>
          </div>

          {/* ─── Global Search Bar with Dropdown ─── */}
          <div className="relative flex-1 max-w-xs" ref={searchRef}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </div>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search pages, equipment, sensors..."
              value={localSearch}
              onFocus={() => setShowSearch(true)}
              onChange={(e) => { setLocalSearch(e.target.value); setShowSearch(true); }}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-900/60 text-slate-200 border border-slate-700/60 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all"
            />
            {localSearch && (
              <button
                onClick={() => { setLocalSearch(''); setSearchQuery(''); inputRef.current?.focus(); }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* ─── Search Dropdown ─── */}
            {showSearch && (
              <div className="absolute top-full mt-2 left-0 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl shadow-black/50 z-50 overflow-hidden">
                {localSearch.trim() === '' ? (
                  /* Empty state: show quick-access shortcuts */
                  <div className="p-3">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 mb-2">Quick Access</p>
                    <div className="space-y-0.5">
                      {PAGE_SHORTCUTS.slice(0, 6).map(item => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.path}
                            onClick={() => handleResultClick(item.path)}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800 hover:text-cyan-400 transition-colors text-left group"
                          >
                            <Icon className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                            <span>{item.label}</span>
                            <span className="ml-auto text-[10px] text-slate-600 group-hover:text-slate-400">{item.category}</span>
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-slate-600 text-center mt-3 pb-1">Type to search equipment, alerts, and pages</p>
                  </div>
                ) : results.length === 0 ? (
                  /* No results */
                  <div className="p-6 text-center">
                    <Search className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">No results for <span className="text-slate-200 font-semibold">"{localSearch}"</span></p>
                    <p className="text-xs text-slate-600 mt-1">Try searching for equipment type or page name</p>
                  </div>
                ) : (
                  /* Results */
                  <div className="p-2">
                    {/* Page results */}
                    {results.filter(r => r.type === 'page').length > 0 && (
                      <div className="mb-1">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 py-1">Pages</p>
                        {results.filter(r => r.type === 'page').map(item => {
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.path + item.label}
                              onClick={() => handleResultClick(item.path)}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800 hover:text-cyan-400 transition-colors text-left group"
                            >
                              <Icon className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 flex-shrink-0" />
                              <span className="flex-1">{item.label}</span>
                              <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-cyan-400 transition-opacity" />
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Equipment results */}
                    {results.filter(r => r.type === 'equipment').length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 py-1 mt-1">Equipment</p>
                        {results.filter(r => r.type === 'equipment').map((item, idx) => {
                          const Icon = item.icon;
                          return (
                            <button
                              key={idx}
                              onClick={() => handleResultClick(item.path)}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800 transition-colors text-left group"
                            >
                              <Icon className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-slate-200 truncate">{item.label}</p>
                                <p className="text-[10px] text-slate-500">{item.subLabel}</p>
                              </div>
                              {item.health != null && (
                                <span className={`text-xs font-bold ${getHealthColor(item.health)} flex-shrink-0`}>
                                  {Math.round(item.health)}%
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <div className="border-t border-slate-800 mt-2 pt-2 px-3 pb-1">
                      <button
                        onClick={() => handleResultClick('/maintenance/equipment')}
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 font-medium"
                      >
                        View all equipment →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">

          {/* Landing Page Link */}
          <button
            onClick={() => navigate('/landing')}
            className="p-2 px-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-medium"
            title="View Public Landing Page"
          >
            <Globe className="w-4 h-4 text-cyan-400" />
            <span className="hidden md:inline">Public Site</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="theme-toggle p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:text-cyan-400 transition-all cursor-pointer"
            title="Toggle Light/Dark Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:text-cyan-400 transition-all cursor-pointer relative"
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
              <div className="absolute right-0 mt-2 w-80 rounded-2xl glass-panel p-4 z-50 border border-slate-700 shadow-2xl text-xs bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-3">
                  <span className="font-semibold text-slate-200">Active Alerts</span>
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-mono text-[10px] font-bold">
                    {activeAlertsCount} Unresolved
                  </span>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {allAlerts.length > 0 ? (
                    allAlerts.slice(0, 5).map((alert, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:border-cyan-500/30 transition-colors">
                        <div className="flex items-center justify-between mb-1">
                           <span className={`text-[10px] font-bold uppercase tracking-wider ${
                             alert.source === 'Energy Agent' ? 'text-cyan-400' : 
                             alert.source === 'Maintenance Agent' ? 'text-violet-400' :
                             alert.source === 'Occupancy Agent' ? 'text-amber-400' : 'text-blue-400'
                           }`}>{alert.source}</span>
                           <span className="text-[9px] text-slate-500">{new Date(alert.timestamp || alert.created_at).toLocaleTimeString()}</span>
                        </div>
                        <p className={`font-semibold text-xs ${alert.severity === 'Critical' ? 'text-rose-400' : 'text-slate-200'}`}>
                          {alert.alert_type || alert.issue || alert.type || 'Alert'}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{alert.message || alert.description}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 text-center py-4">No active alerts.</p>
                  )}
                  {allAlerts.length > 5 && (
                    <div className="pt-2 text-center border-t border-slate-800 mt-2">
                       <span className="text-[10px] text-cyan-400 font-medium">+{allAlerts.length - 5} more alerts...</span>
                    </div>
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
