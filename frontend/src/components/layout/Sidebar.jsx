import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Zap,
  BarChart3,
  AlertTriangle,
  Lightbulb,
  FileText,
  Settings,
  Cpu,
  ChevronDown,
  ChevronRight,
  Wrench,
  Activity,
  Gauge,
  Calendar,
  BellDot,
  BarChart2,
  Users,
  ShieldCheck,
  Grid,
  Shield,
  AlertOctagon,
  Globe
} from 'lucide-react';

// ── Agent definitions ─────────────────────────────────────────────────────────
const AGENTS = [
  {
    id: 'energy',
    label: 'Energy Agent',
    accentFrom: 'from-cyan-500/20',
    accentTo: 'to-blue-500/20',
    accentBorder: 'border-cyan-500/30',
    accentText: 'text-cyan-400',
    headerActiveBg: 'bg-gradient-to-r from-cyan-900/50 to-blue-900/40',
    headerInactiveBg: 'bg-slate-800/50',
    dotActiveColor: 'bg-cyan-400',
    badgeBg: 'bg-cyan-500/20',
    badgeText: 'text-cyan-300',
    badgeBorder: 'border-cyan-500/40',
    rootPaths: ['/dashboard', '/energy', '/analytics', '/alerts', '/recommendations', '/reports', '/settings'],
    items: [
      { path: '/dashboard',       name: 'Dashboard',        icon: LayoutDashboard },
      { path: '/energy',          name: 'Energy Monitoring', icon: Zap },
      { path: '/analytics',       name: 'Analytics',         icon: BarChart3 },
      { path: '/alerts',          name: 'Alerts',            icon: AlertTriangle, badge: 'AI' },
      { path: '/recommendations', name: 'Recommendations',   icon: Lightbulb },
      { path: '/reports',         name: 'Reports',           icon: FileText },
    ],
  },
  {
    id: 'maintenance',
    label: 'Maintenance Agent',
    accentFrom: 'from-violet-500/20',
    accentTo: 'to-purple-500/20',
    accentBorder: 'border-violet-500/30',
    accentText: 'text-violet-400',
    headerActiveBg: 'bg-gradient-to-r from-violet-900/50 to-purple-900/40',
    headerInactiveBg: 'bg-slate-800/50',
    dotActiveColor: 'bg-violet-400',
    badgeBg: 'bg-violet-500/20',
    badgeText: 'text-violet-300',
    badgeBorder: 'border-violet-500/40',
    rootPaths: ['/maintenance'],
    items: [
      { path: '/maintenance',             name: 'PM Dashboard',  icon: Wrench },
      { path: '/maintenance/equipment',   name: 'Equipment',     icon: Activity },
      { path: '/maintenance/health',      name: 'Health Scores', icon: Gauge },
      { path: '/maintenance/predictions', name: 'Predictions',   icon: BarChart2 },
      { path: '/maintenance/schedule',    name: 'Schedule',      icon: Calendar },
      { path: '/maintenance/alerts',      name: 'PM Alerts',     icon: BellDot, badge: 'AI' },
    ],
  },
  {
    id: 'occupancy',
    label: 'Occupancy Agent',
    accentFrom: 'from-emerald-500/20',
    accentTo: 'to-teal-500/20',
    accentBorder: 'border-emerald-500/30',
    accentText: 'text-emerald-400',
    headerActiveBg: 'bg-gradient-to-r from-emerald-900/50 to-teal-900/40',
    headerInactiveBg: 'bg-slate-800/50',
    dotActiveColor: 'bg-emerald-400',
    badgeBg: 'bg-emerald-500/20',
    badgeText: 'text-emerald-300',
    badgeBorder: 'border-emerald-500/40',
    rootPaths: ['/occupancy'],
    items: [
      { path: '/occupancy', name: 'Occupancy', icon: Users },
      { path: '/occupancy/analytics', name: 'Analytics', icon: BarChart3 },
      { path: '/occupancy/heatmap', name: 'Heatmap', icon: Grid },
    ],
  },
  {
    id: 'security',
    label: 'Security Agent',
    accentFrom: 'from-red-500/20',
    accentTo: 'to-rose-500/20',
    accentBorder: 'border-red-500/30',
    accentText: 'text-red-400',
    headerActiveBg: 'bg-gradient-to-r from-red-900/50 to-rose-900/40',
    headerInactiveBg: 'bg-slate-800/50',
    dotActiveColor: 'bg-red-400',
    badgeBg: 'bg-red-500/20',
    badgeText: 'text-red-300',
    badgeBorder: 'border-red-500/40',
    rootPaths: ['/security'],
    items: [
      { path: '/security', name: 'Security', icon: Shield },
      { path: '/security/alerts', name: 'Alerts', icon: AlertTriangle, badge: 'LIVE' },
      { path: '/security/incidents', name: 'Incidents', icon: AlertOctagon },
    ],
  },
  {
    id: 'cost',
    label: 'Cost Optimization Agent',
    accentFrom: 'from-amber-500/20',
    accentTo: 'to-orange-500/20',
    accentBorder: 'border-amber-500/30',
    accentText: 'text-amber-400',
    headerActiveBg: 'bg-gradient-to-r from-amber-900/50 to-orange-900/40',
    headerInactiveBg: 'bg-slate-800/50',
    dotActiveColor: 'bg-amber-400',
    badgeBg: 'bg-amber-500/20',
    badgeText: 'text-amber-300',
    badgeBorder: 'border-amber-500/40',
    rootPaths: ['/executive', '/cost', '/optimization', '/intelligence', '/facility-ai'],
    items: [
      { path: '/executive', name: 'Executive Dashboard', icon: BarChart3 },
      { path: '/cost', name: 'Cost Analytics', icon: BarChart2 },
      { path: '/optimization', name: 'Optimization Center', icon: Zap },
      { path: '/intelligence', name: 'Cross-Agent Insights', icon: Lightbulb, badge: 'AI' },
      { path: '/facility-ai', name: 'Ask Facility AI', icon: Cpu },
    ],
  },
];

// ── Helper: is any child path active ─────────────────────────────────────────
function isAgentActive(agent, pathname) {
  return agent.rootPaths.some((p) =>
    p === '/' ? pathname === '/' : pathname.startsWith(p)
  );
}

// ── AgentSection ──────────────────────────────────────────────────────────────
const AgentSection = ({ agent, isOpen, onToggle }) => {
  const { pathname } = useLocation();
  const active = isAgentActive(agent, pathname);

  return (
    <div className={`rounded-2xl overflow-hidden border transition-all duration-200 ${
      active ? agent.accentBorder : 'border-slate-800/60'
    }`}>

      {/* Header / toggle button */}
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-3.5 py-3 transition-all duration-200 ${
          active ? agent.headerActiveBg : agent.headerInactiveBg
        } hover:brightness-110`}
      >
        <div className="flex items-center gap-2.5">
          {/* Status dot */}
          <span className={`w-2 h-2 rounded-full shrink-0 transition-colors ${
            active ? `${agent.dotActiveColor} animate-pulse` : 'bg-slate-600'
          }`} />
          <span className={`text-[10px] font-bold tracking-widest uppercase ${
            active ? agent.accentText : 'text-slate-300'
          }`}>
            {agent.label}
          </span>
        </div>
        {isOpen
          ? <ChevronDown className={`w-3.5 h-3.5 ${active ? agent.accentText : 'text-slate-500'}`} />
          : <ChevronRight className={`w-3.5 h-3.5 ${active ? agent.accentText : 'text-slate-500'}`} />
        }
      </button>

      {/* Sub-navigation — animated slide */}
      <div className={`transition-all duration-300 overflow-hidden ${
        isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <nav className="sidebar-subnav bg-slate-900/50 px-2 py-2 space-y-0.5 border-t border-slate-800/60">
          {agent.items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center justify-between pl-4 pr-2.5 py-2 rounded-xl text-xs transition-all duration-150 group cursor-pointer ${
                    isActive
                      ? `bg-gradient-to-r ${agent.accentFrom} ${agent.accentTo} ${agent.accentText} border ${agent.accentBorder} font-bold shadow-sm`
                      : 'sidebar-nav-link text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 font-medium'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-2.5">
                      {/* connector dot */}
                      <span className={`w-1 h-1 rounded-full shrink-0 ${
                        isActive ? agent.dotActiveColor : 'bg-slate-700'
                      }`} />
                      <Icon className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                        isActive ? agent.accentText : 'text-slate-500 group-hover:text-slate-300'
                      }`} />
                      <span>{item.name}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {item.badge && (
                        <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded-full border
                          ${agent.badgeBg} ${agent.badgeText} ${agent.badgeBorder}`}>
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className={`w-3 h-3 transition-opacity
                        ${isActive
                          ? `opacity-100 ${agent.accentText}`
                          : 'opacity-0 group-hover:opacity-70 text-slate-500'
                        }`}
                      />
                    </div>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

// ── Sidebar ───────────────────────────────────────────────────────────────────
export const Sidebar = () => {
  const { pathname } = useLocation();

  // Auto-open the section that owns the current route; energy open by default
  const [openSections, setOpenSections] = useState(() => ({
    energy:      isAgentActive(AGENTS[0], pathname) || (!isAgentActive(AGENTS[1], pathname) && !isAgentActive(AGENTS[2], pathname) && !isAgentActive(AGENTS[3], pathname) && !isAgentActive(AGENTS[4], pathname)),
    maintenance: isAgentActive(AGENTS[1], pathname),
    occupancy:   isAgentActive(AGENTS[2], pathname),
    security:    isAgentActive(AGENTS[3], pathname),
    cost:        isAgentActive(AGENTS[4], pathname),
  }));

  const toggle = (id) =>
    setOpenSections((prev) => ({
      energy: id === 'energy' ? !prev.energy : false,
      maintenance: id === 'maintenance' ? !prev.maintenance : false,
      occupancy: id === 'occupancy' ? !prev.occupancy : false,
      security: id === 'security' ? !prev.security : false,
      cost: id === 'cost' ? !prev.cost : false,
    }));

  return (
  <aside className="sidebar sticky top-[65px] self-start w-64 h-[calc(100vh-65px)] bg-slate-900/60 border-r border-slate-800
                      p-4 flex flex-col justify-between shrink-0 backdrop-blur-lg overflow-y-auto">
      <div className="space-y-3">

        {/* Top label */}
        <p className="px-1 text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-1">
          Agentic AI Modules
        </p>

        {/* 2 accordion rows */}
        {AGENTS.map((agent) => (
          <AgentSection
            key={agent.id}
            agent={agent}
            isOpen={openSections[agent.id]}
            onToggle={() => toggle(agent.id)}
          />
        ))}

        <NavLink
          to="/landing"
          className={({ isActive }) =>
            `flex items-center justify-between px-3.5 py-3 rounded-2xl border transition-all duration-200 ${
              isActive
                ? 'bg-gradient-to-r from-cyan-900/60 to-blue-900/50 border-cyan-500/40 text-cyan-200 shadow-sm'
                : 'sidebar-settings-link bg-slate-800/50 border-slate-800/60 text-slate-300 hover:text-slate-100 hover:bg-slate-800/80'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className="flex items-center gap-2.5">
                <span className={`w-2 h-2 rounded-full shrink-0 ${isActive ? 'bg-cyan-400 animate-ping' : 'bg-cyan-500/60'}`} />
                <Globe className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-300' : 'text-cyan-400'}`} />
                <span className="text-[10px] font-bold tracking-widest uppercase">Landing Page</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-300' : 'text-slate-500'}`} />
            </>
          )}
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center justify-between px-3.5 py-3 rounded-2xl border transition-all duration-200 ${
              isActive
                ? 'bg-gradient-to-r from-slate-700/80 to-slate-800/80 border-slate-600 text-slate-100 shadow-sm'
                : 'sidebar-settings-link bg-slate-800/50 border-slate-800/60 text-slate-300 hover:text-slate-100 hover:bg-slate-800/80'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className="flex items-center gap-2.5">
                <span className={`w-2 h-2 rounded-full shrink-0 ${isActive ? 'bg-slate-200' : 'bg-slate-600'}`} />
                <Settings className={`w-3.5 h-3.5 ${isActive ? 'text-slate-100' : 'text-slate-400'}`} />
                <span className="text-[10px] font-bold tracking-widest uppercase">Settings</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-slate-100' : 'text-slate-500'}`} />
            </>
          )}
        </NavLink>

        {/* Intelligence Engine status card */}
        <div className="sidebar-engine p-3.5 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900
                        border border-cyan-900/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full
                          blur-2xl pointer-events-none" />
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-xs font-bold text-slate-200">Intelligence Engine</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
            4 AI Agents orchestrating multi-tenant IoT streams continuously.
          </p>
          <div className="flex items-center justify-between text-[10px] text-slate-400
                          sidebar-engine-core bg-slate-900 p-2 rounded-lg border border-slate-800">
            <span>Engine Core:</span>
            <span className="text-emerald-400 font-mono font-bold">Multi-Agent v1.2</span>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500
                      flex justify-between items-center font-medium">
        <span>Smart FacilityOps AI</span>
        <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-400">
          v1.0.0
        </span>
      </div>
    </aside>
  );
};
