import React, { useState, useEffect } from 'react';
import { GlassCard } from '../../components/common/GlassCard';
import { Settings } from 'lucide-react';
import api from '../../services/api';

export const SimulationEngine = () => {
  const [hvacReduction, setHvacReduction] = useState(15);
  const [lightingReduction, setLightingReduction] = useState(10);
  const [workspaceConsolidation, setWorkspaceConsolidation] = useState(2);
  const [results, setResults] = useState(null);

  useEffect(() => {
    const runSimulation = async () => {
      try {
        const res = await api.post('/optimization/simulate', {
          hvac_reduction_pct: hvacReduction,
          lighting_reduction_pct: lightingReduction,
          workspace_consolidation_floors: workspaceConsolidation,
          vendor_reduction_pct: 0,
          preventive_maintenance_shift_pct: 0
        });
        setResults(res.data);
      } catch (err) {
        console.error("Simulation failed", err);
      }
    };
    // Debounce simulation logic if needed, here run directly for simplicity
    const timeout = setTimeout(runSimulation, 300);
    return () => clearTimeout(timeout);
  }, [hvacReduction, lightingReduction, workspaceConsolidation]);

  return (
    <GlassCard className="bg-gradient-to-br from-slate-900 to-slate-950 border-cyan-500/30" title="Optimization Simulator" icon={Settings}>
      <div className="p-4 space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-300">
            <span>HVAC Reduction</span>
            <span>{hvacReduction}%</span>
          </div>
          <input 
            type="range" min="0" max="30" value={hvacReduction} 
            onChange={(e) => setHvacReduction(Number(e.target.value))}
            className="w-full accent-cyan-500"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-300">
            <span>Lighting Reduction</span>
            <span>{lightingReduction}%</span>
          </div>
          <input 
            type="range" min="0" max="30" value={lightingReduction} 
            onChange={(e) => setLightingReduction(Number(e.target.value))}
            className="w-full accent-amber-500"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-300">
            <span>Workspace Consolidation</span>
            <span>{workspaceConsolidation} floors</span>
          </div>
          <input 
            type="range" min="0" max="5" value={workspaceConsolidation} 
            onChange={(e) => setWorkspaceConsolidation(Number(e.target.value))}
            className="w-full accent-emerald-500"
          />
        </div>

        {results && (
          <div className="mt-6 pt-4 border-t border-slate-800 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">Estimated Monthly Savings</span>
              <span className="text-sm font-bold text-emerald-400">₹{results.monthly_savings.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">Annual Savings</span>
              <span className="text-sm font-bold text-emerald-400">₹{results.annual_savings.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">Estimated ROI</span>
              <span className="text-sm font-bold text-cyan-400">{results.roi.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">Carbon Reduction</span>
              <span className="text-sm font-bold text-emerald-500">{results.carbon_reduction_kg.toFixed(1)} kg</span>
            </div>
          </div>
        )}
        
        <button className="w-full mt-4 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold py-2 px-4 rounded transition-colors">
          Deploy Optimization Profile
        </button>
      </div>
    </GlassCard>
  );
};
