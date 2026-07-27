import React from 'react';
import { Users, Building, Thermometer, ShieldCheck } from 'lucide-react';
import { GlassCard } from '../../components/cards/GlassCard';
import { MetricCard } from '../../components/cards/MetricCard';

export const OccupancyPage = () => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 backdrop-blur-md">
        <h1 className="text-xl font-extrabold text-slate-100 tracking-tight">Occupancy & Space Optimization Agent</h1>
        <p className="text-xs text-slate-400 mt-1">Real-time headcount tracking, space utilization analytics, and adaptive HVAC setpoint scheduling.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard label="Current Headcount" value="482 People" badgeText="Peak Operating Hours" status="normal" />
        <MetricCard label="Space Utilization" value="74.5%" badgeText="Optimal Load" status="normal" />
        <MetricCard label="Thermostat Setback" value="72.0°F (22.2°C)" badgeText="AI Eco Mode" status="normal" />
      </div>

      <GlassCard title="Zone Occupancy Heatmap Summary" subtitle="Floor-by-floor space usage">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-2">
          {['Floor 1 - Main Lobby', 'Floor 2 - Open Workspace', 'Floor 3 - Executive Suites', 'Floor 4 - R&D Labs'].map((zone, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <p className="text-xs font-bold text-slate-200">{zone}</p>
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Occupancy:</span>
                <span className="text-cyan-400 font-bold">{40 + idx * 35} / 150</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-cyan-500 h-full" style={{ width: `${(40 + idx * 35) / 1.5}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};
