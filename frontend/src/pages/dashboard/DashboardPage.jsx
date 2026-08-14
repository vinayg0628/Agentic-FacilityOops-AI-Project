import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  AlertTriangle, 
  Building2, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Sun, 
  Layers, 
  Cpu, 
  BarChart3,
  Lightbulb,
  Sparkles,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { KpiCard } from '../../components/cards/KpiCard';
import { GlassCard } from '../../components/cards/GlassCard';
import { HourlyLineChart } from '../../components/charts/HourlyLineChart';
import { MonthlyAreaChart } from '../../components/charts/MonthlyAreaChart';
import { WeeklyBarChart } from '../../components/charts/WeeklyBarChart';
import { CategoryPieChart } from '../../components/charts/CategoryPieChart';
import { FacilityBarChart } from '../../components/charts/FacilityBarChart';
import { 
  fetchFacilities, 
  fetchEnergyData, 
  fetchAnalytics, 
  fetchAlerts, 
  fetchRecommendations,
  fetchExecutiveSummary 
} from '../../services/api';

export const DashboardPage = () => {
  const [facilities, setFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState('ALL');
  const [analytics, setAnalytics] = useState(null);
  const [execSummary, setExecSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [facilityCompare, setFacilityCompare] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [selectedFacility]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const facId = selectedFacility === 'ALL' ? null : selectedFacility;
      
      const [facRes, analyticsRes, execRes, alertsRes, recsRes] = await Promise.all([
        fetchFacilities(),
        fetchAnalytics(facId),
        fetchExecutiveSummary(),
        fetchAlerts(facId, 'Open'),
        fetchRecommendations(facId)
      ]);

      const facList = Array.isArray(facRes) ? facRes : (facRes?.data || []);
      const analyticsObj = analyticsRes?.hourly_trend ? analyticsRes : (analyticsRes?.data || analyticsRes || {});
      const alertsList = Array.isArray(alertsRes) ? alertsRes : (alertsRes?.data || []);
      const recsList = Array.isArray(recsRes) ? recsRes : (recsRes?.data || []);

      setFacilities(facList);
      setAnalytics(analyticsObj);
      setExecSummary(execRes?.data || execRes || {});
      setAlerts(alertsList);
      setRecommendations(recsList);

      setHourlyData(analyticsObj.hourly_trend || []);
      setMonthlyData(analyticsObj.monthly_trend || []);
      setFacilityCompare(analyticsObj.facility_comparison || []);
    } catch (err) {
      console.error("Error loading dashboard telemetry data:", err);
    } finally {
      setLoading(false);
    }
  };

  const metrics = analytics || {};

  return (
    <div className="space-y-6">
      {/* Header & Facility Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-100 tracking-tight">Enterprise Executive Overview</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 animate-pulse" />
              AI Agent Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">Real-time facility telemetry, multi-agent diagnostics, and automated anomaly alerts.</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-400">Select Facility:</label>
          <select 
            value={selectedFacility}
            onChange={(e) => setSelectedFacility(e.target.value)}
            className="bg-slate-950 text-slate-200 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
          >
            <option value="ALL">All Enterprise Facilities (5 Total)</option>
            {facilities.map(f => (
              <option key={f.facility_id} value={f.facility_id}>{f.facility_name} ({f.city})</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          title="Total Energy Demand"
          value={metrics.total_electricity_kwh || metrics.total_energy_kwh || 0}
          unit="kWh"
          changePct={metrics.electricity_change_pct !== undefined ? metrics.electricity_change_pct : -4.2}
          icon={Zap}
          color="cyan"
        />
        <KpiCard 
          title="HVAC Load Contribution"
          value={metrics.hvac_total_kwh || metrics.hvac_kwh || 0}
          unit="kWh"
          changePct={2.8}
          icon={Activity}
          color="amber"
        />
        <KpiCard 
          title="Solar Self-Generation"
          value={metrics.solar_total_kwh || metrics.solar_kwh || 0}
          unit="kWh"
          changePct={12.4}
          icon={Sun}
          color="emerald"
        />
        <KpiCard 
          title="Active System Alerts"
          value={alerts.length}
          unit="Open"
          changePct={alerts.length > 0 ? 15.0 : 0}
          icon={AlertTriangle}
          color={alerts.length > 0 ? "rose" : "blue"}
          subtext="Automated anomaly engine"
        />
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard title="24-Hour Power Demand Curve" subtitle="Real-time diurnal consumption vs baseline (kW)" className="lg:col-span-2">
          <HourlyLineChart data={hourlyData} />
        </GlassCard>

        <GlassCard title="Energy Distribution by System" subtitle="Breakdown across HVAC, Lighting & Equipment">
          <CategoryPieChart data={metrics} />
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard title="Facility Energy Comparison" subtitle="Comparing daily kWh intensity across buildings" className="lg:col-span-2">
          <FacilityBarChart data={facilityCompare} />
        </GlassCard>

        {/* AI Recommendations Panel */}
        <GlassCard title="Agentic AI Optimization Insights" subtitle="Prioritized cost & HVAC saving recommendations">
          <div className="space-y-3 mt-1">
            {recommendations.slice(0, 3).map((rec, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wide">{rec.category}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                    Save {rec.potential_savings}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-200 mt-1">{rec.title}</h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{rec.action}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
