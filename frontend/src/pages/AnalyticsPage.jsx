import React, { useEffect, useState } from 'react';
import { useFacility } from '../context/FacilityContext';
import { fetchAnalyticsSummary } from '../services/api';
import { GlassCard } from '../components/common/GlassCard';
import { MonthlyAreaChart } from '../components/charts/MonthlyAreaChart';
import { CategoryPieChart } from '../components/charts/CategoryPieChart';
import { FacilityBarChart } from '../components/charts/FacilityBarChart';
import { 
  BarChart3, 
  Leaf, 
  Clock, 
  ShieldAlert, 
  Award, 
  Zap, 
  Droplets,
  Building,
  RefreshCw
} from 'lucide-react';

export const AnalyticsPage = () => {
  const { selectedFacilityId, refreshTrigger } = useFacility();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [selectedFacilityId, refreshTrigger]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await fetchAnalyticsSummary(selectedFacilityId);
      setAnalytics(data);
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            <span>Energy Analytics & Sustainability Intelligence</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Deep-dive carbon footprint, peak hour distribution, efficiency rating, and facility comparisons.
          </p>
        </div>
      </div>

      {/* Carbon Footprint & Energy Efficiency Score Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: Carbon Emissions */}
        <div className="glass-panel p-5 border border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 to-slate-900">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400">
              <Leaf className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
              Scope 2 Emissions
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-400">Est. Carbon Footprint</p>
            <p className="text-2xl font-bold font-mono text-emerald-300 mt-1">
              {analytics?.carbon_emissions_ton_co2 || 0} <span className="text-sm text-slate-400">Tons CO₂e</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Grid Emission Factor: 0.82 kg CO₂/kWh</p>
          </div>
        </div>

        {/* Card 2: Peak Consumption Hour */}
        <div className="glass-panel p-5 border border-amber-500/30 bg-gradient-to-br from-amber-950/30 to-slate-900">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400">
              <Clock className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
              Grid Demand Peak
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-400">Peak Consumption Hour</p>
            <p className="text-2xl font-bold font-mono text-amber-300 mt-1">
              {analytics?.peak_consumption_hour || "14:00 - 15:00"}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Peak Demand: {analytics?.peak_consumption_kwh || 0} kWh</p>
          </div>
        </div>

        {/* Card 3: Energy Efficiency Index */}
        <div className="glass-panel p-5 border border-cyan-500/30 bg-gradient-to-br from-cyan-950/30 to-slate-900">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400">
              <Award className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase">
              ASHRAE Score Index
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-400">Efficiency Rating</p>
            <p className="text-2xl font-bold font-mono text-cyan-300 mt-1">
              {analytics?.energy_efficiency_score || 86.4} <span className="text-sm text-slate-400">/ 100</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Grade A Commercial Energy Index</p>
          </div>
        </div>

      </div>

      {/* Peak Hour Heatmap Matrix */}
      <GlassCard title="24-Hour Electricity Demand Distribution" subtitle="Identify peak tariff windows for load shifting & battery storage dispatch">
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 my-2">
          {analytics?.peak_hours?.map((item) => (
            <div 
              key={item.hour} 
              className={`p-2 rounded-xl border text-center transition-transform hover:scale-105 ${
                item.is_peak 
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-300' 
                  : 'bg-slate-900/60 border-slate-800 text-slate-300'
              }`}
            >
              <p className="text-[10px] font-mono text-slate-400">{item.hour_label}</p>
              <p className="text-xs font-bold font-mono mt-1">{item.avg_kwh}</p>
              <span className="text-[9px] text-slate-500">kWh</span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Detailed Analytics Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard title="Facility Portfolio Energy & Carbon Breakdown" subtitle="Detailed breakdown of electricity, water, score, and emissions">
          <FacilityBarChart data={analytics?.facility_comparison || []} />
        </GlassCard>

        <GlassCard title="Sub-System End-Use Breakdown" subtitle="HVAC vs Lighting vs Plug Loads vs Solar Offset">
          <CategoryPieChart data={analytics?.category_breakdown || []} />
        </GlassCard>
      </div>

      {/* Facility Comparison Table */}
      <GlassCard title="Commercial Facility Performance Comparison Matrix" subtitle="Aggregated metrics for IT Parks, Hospitals, Universities, Malls & Factories">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] uppercase text-slate-400 bg-slate-900/80 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Facility ID</th>
                <th className="py-3 px-4">Facility Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Electricity (kWh)</th>
                <th className="py-3 px-4">Water (Liters)</th>
                <th className="py-3 px-4">Efficiency Score</th>
                <th className="py-3 px-4">Carbon (kg CO₂)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
              {analytics?.facility_comparison?.map((f) => (
                <tr key={f.facility_id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 px-4 text-cyan-400 font-bold">{f.facility_id}</td>
                  <td className="py-2.5 px-4 font-sans font-medium text-slate-200">{f.facility_name}</td>
                  <td className="py-2.5 px-4 font-sans text-slate-400">{f.facility_type}</td>
                  <td className="py-2.5 px-4 font-bold text-slate-100">{f.electricity_kwh.toLocaleString()}</td>
                  <td className="py-2.5 px-4 text-indigo-400">{f.water_liters.toLocaleString()}</td>
                  <td className="py-2.5 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                      {f.efficiency_score} / 100
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-emerald-400">{f.carbon_emissions_kg.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

    </div>
  );
};
