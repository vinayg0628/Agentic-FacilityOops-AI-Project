import React from 'react';
import { Wrench, ShieldAlert, Cpu, CheckCircle2, AlertTriangle } from 'lucide-react';
import { GlassCard } from '../../components/cards/GlassCard';
import { MetricCard } from '../../components/cards/MetricCard';

export const MaintenancePage = () => {
  const equipmentList = [
    { name: "Chiller Plant #1", type: "Centrifugal Chiller", status: "Healthy", efficiency: "94%", nextService: "In 45 Days" },
    { name: "AHU Unit #4 (Floor 3)", type: "Air Handling Unit", status: "Attention Needed", efficiency: "72%", nextService: "Overdue 3 Days" },
    { name: "Roof Cooling Tower B", type: "Evaporative Tower", status: "Healthy", efficiency: "91%", nextService: "In 18 Days" },
    { name: "Main Transformer T-02", type: "Dry-type Transformer", status: "Healthy", efficiency: "98%", nextService: "In 60 Days" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 backdrop-blur-md">
        <h1 className="text-xl font-extrabold text-slate-100 tracking-tight">Predictive Maintenance Agent</h1>
        <p className="text-xs text-slate-400 mt-1">AI-driven equipment health index, vibration analysis, and automated failure prevention.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard label="Overall Equipment Health" value="88.4%" badgeText="Good" status="normal" />
        <MetricCard label="AHU Filter Degradation" value="1 Unit At Risk" badgeText="Action Required" status="warning" />
        <MetricCard label="Predicted MTBF" value="4,200 Hours" badgeText="Optimal" status="normal" />
      </div>

      <GlassCard title="Monitored HVAC & Electrical Assets" subtitle="Real-time predictive maintenance status">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 uppercase text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Equipment Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Health Status</th>
                <th className="py-3 px-4">Efficiency Score</th>
                <th className="py-3 px-4">Next Inspection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {equipmentList.map((eq, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-sans font-bold text-slate-100">{eq.name}</td>
                  <td className="py-3 px-4 text-slate-400">{eq.type}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      eq.status === 'Healthy' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {eq.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-cyan-400 font-bold">{eq.efficiency}</td>
                  <td className="py-3 px-4 text-slate-400 font-sans">{eq.nextService}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};
