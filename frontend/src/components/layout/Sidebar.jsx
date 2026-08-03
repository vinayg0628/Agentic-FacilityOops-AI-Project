import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Zap, 
  BarChart3, 
  AlertTriangle, 
  Lightbulb, 
  FileText,
  Settings,
  Cpu,
  ChevronRight,
  Wrench,
  Activity,
  Gauge,
  Calendar,
  BellDot,
  BarChart2
} from 'lucide-react';

const navItems = [
  { path: '/', name: 'Dashboard', icon: LayoutDashboard },
  { path: '/energy', name: 'Energy Monitoring', icon: Zap },
  { path: '/analytics', name: 'Analytics', icon: BarChart3 },
  { path: '/alerts', name: 'Alerts', icon: AlertTriangle, badge: 'AI' },
  { path: '/recommendations', name: 'Recommendations', icon: Lightbulb },
  { path: '/reports', name: 'Reports', icon: FileText },
  { path: '/settings', name: 'Settings', icon: Settings },
];

const maintenanceNavItems = [
  { path: '/maintenance', name: 'PM Dashboard', icon: Wrench },
  { path: '/maintenance/equipment', name: 'Equipment', icon: Activity },
  { path: '/maintenance/health', name: 'Health Scores', icon: Gauge },
  { path: '/maintenance/predictions', name: 'Predictions', icon: BarChart2 },
  { path: '/maintenance/schedule', name: 'Schedule', icon: Calendar },
  { path: '/maintenance/alerts', name: 'PM Alerts', icon: BellDot, badge: 'AI' },
];

export const Sidebar = () => {
  return (
    <aside className="w-64 min-h-[calc(100vh-65px)] bg-slate-900/60 border-r border-slate-800 p-4 flex flex-col justify-between shrink-0 backdrop-blur-lg">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-3">
            Agentic AI Modules
          </p>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all group cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30 font-bold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 font-medium'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                        <span>{item.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {item.badge && (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'opacity-100 text-cyan-400' : 'text-slate-500'}`} />
                      </div>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="mt-6">
          <p className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-3">
            Predictive Maintenance
          </p>
          <nav className="space-y-1.5">
            {maintenanceNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all group cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-violet-400 border border-violet-500/30 font-bold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 font-medium'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-violet-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                        <span>{item.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {item.badge && (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/40">
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'opacity-100 text-violet-400' : 'text-slate-500'}`} />
                      </div>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-cyan-900/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-xs font-bold text-slate-200">Intelligence Engine</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
            5 Domain AI Agents orchestrating multi-tenant IoT streams continuously.
          </p>
          <div className="flex items-center justify-between text-[10px] text-slate-400 bg-slate-900 p-2 rounded-lg border border-slate-800">
            <span>Engine Core:</span>
            <span className="text-emerald-400 font-mono font-bold">Multi-Agent v1.2</span>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between items-center font-medium">
        <span>FacilityOps AI</span>
        <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-400">v1.0.0</span>
      </div>
    </aside>
  );
};
