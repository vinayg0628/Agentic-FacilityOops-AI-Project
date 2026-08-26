import React, { useEffect, useState } from 'react';
import { useFacility } from '../context/FacilityContext';
import { fetchAnalyticsSummary, fetchAlerts, fetchRecommendations, fetchEnergyTelemetry } from '../services/api';
import { GlassCard } from '../components/common/GlassCard';
import { KpiCard } from '../components/common/KpiCard';
import { HourlyLineChart } from '../components/charts/HourlyLineChart';
import { WeeklyBarChart } from '../components/charts/WeeklyBarChart';
import { CategoryPieChart } from '../components/charts/CategoryPieChart';
import { FacilityBarChart } from '../components/charts/FacilityBarChart';
import { MonthlyAreaChart } from '../components/charts/MonthlyAreaChart';

import { 
  Zap, 
  Droplets, 
  Wind, 
  AlertTriangle, 
  ShieldCheck, 
  TrendingUp, 
  Cpu, 
  Lightbulb, 
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage = () => {
  const { selectedFacilityId, refreshTrigger } = useFacility();

  const [analytics, setAnalytics] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [recentRecords, setRecentRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [selectedFacilityId, refreshTrigger]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [analyticsData, alertsData, recsData, recordsData] = await Promise.all([
        fetchAnalyticsSummary(selectedFacilityId),
        fetchAlerts(selectedFacilityId, 'ALL', 'Open'),
        fetchRecommendations(selectedFacilityId),
        fetchEnergyTelemetry(selectedFacilityId, 10)
      ]);

      setAnalytics(analyticsData);
      setAlerts(alertsData);
      setRecommendations(recsData);
      setRecentRecords(recordsData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-xs text-slate-400">Loading Energy Intelligence Grid Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page space-y-6">
      
      {/* Executive Welcome & AI Status Banner */}
      <div className="dashboard-banner flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-blue-950/40 border border-cyan-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/30 uppercase tracking-wider">
              Executive Energy Dashboard
            </span>
            <span className="text-xs text-slate-400">• Updated 1 min ago</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">
            Energy Intelligence & Operations Monitor
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Real-time IoT sensor telemetry analysis across commercial facilities. Energy AI Agent active with rule-based baseline anomaly detection.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={loadDashboardData}
            className="dashboard-refresh flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Grid</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row (5 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          title="Today's Electricity"
          value={analytics?.today_electricity_kwh || 0}
          unit="kWh"
          changePct={analytics?.electricity_change_pct || 0}
          icon={Zap}
          color="cyan"
          subtext={`Avg: ${analytics?.average_hourly_kwh || 0} kWh/hr`}
        />

        <KpiCard
          title="Today's Water Usage"
          value={analytics?.today_water_liters || 0}
          unit="Liters"
          icon={Droplets}
          color="blue"
          subtext="Main line + cooling towers"
        />

        <KpiCard
          title="HVAC Consumption"
          value={analytics?.hvac_total_kwh || 0}
          unit="kWh"
          icon={Wind}
          color="indigo"
          subtext={`Solar offset: ${analytics?.solar_total_kwh || 0} kWh`}
        />

        <KpiCard
          title="Active Alerts"
          value={analytics?.active_alerts_count || 0}
          unit="Alerts"
          icon={AlertTriangle}
          color={analytics?.critical_alerts_count > 0 ? "rose" : "amber"}
          subtext={`${analytics?.critical_alerts_count || 0} Critical severity`}
        />

        <KpiCard
          title="Energy Efficiency Score"
          value={`${analytics?.energy_efficiency_score || 85.0}/100`}
          icon={ShieldCheck}
          color="emerald"
          subtext={`Carbon: ${analytics?.carbon_emissions_ton_co2 || 0} Tons CO2e`}
        />
      </div>

      {/* Charts Grid Row 1: Hourly Line Chart + Weekly Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 24-Hour Telemetry Line Chart */}
        <GlassCard 
          className="lg:col-span-7"
          title="24-Hour Energy Telemetry Stream" 
          subtitle="Hourly Electricity vs HVAC vs Lighting vs Solar Generation"
        >
          <HourlyLineChart data={analytics?.hourly_trend || []} />
        </GlassCard>

        {/* 7-Day Energy & Water Bar Chart */}
        <GlassCard 
          className="lg:col-span-5"
          title="7-Day Consumption Trends" 
          subtitle="Dual-axis electricity (kWh) vs water consumption (Liters)"
        >
          <WeeklyBarChart data={analytics?.daily_trend || []} />
        </GlassCard>

      </div>

      {/* Charts Grid Row 2: Category Pie + Facility Bar + Monthly Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* HVAC vs Lighting Pie */}
        <GlassCard title="End-Use Category Breakdown" subtitle="HVAC vs Lighting vs Equipment vs Solar">
          <CategoryPieChart data={analytics?.category_breakdown || []} />
        </GlassCard>

        {/* Facility Comparison Bar */}
        <GlassCard title="Facility-Wise Electricity Comparison" subtitle="Comparative total kWh across portfolio">
          <FacilityBarChart data={analytics?.facility_comparison || []} />
        </GlassCard>

        {/* Monthly Trend Area */}
        <GlassCard title="30-Day Energy Trend & Solar Offset" subtitle="Long-term electricity load profile with solar overlay">
          <MonthlyAreaChart data={analytics?.monthly_trend || []} />
        </GlassCard>

      </div>

      {/* Tables Section: Recent Alerts + AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Active AI Alerts Table */}
        <GlassCard 
          title="Active Energy Alerts (Energy Agent)" 
          subtitle="Rule-based anomaly detections (>20% spike, HVAC overload, power factor)"
          action={
            <Link to="/alerts" className="text-xs text-cyan-400 hover:underline flex items-center gap-1">
              View All <ExternalLink className="w-3 h-3" />
            </Link>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="dashboard-table-head text-[11px] uppercase text-slate-400 bg-slate-900/60 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Facility</th>
                  <th className="py-2.5 px-3">Alert Type</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="dashboard-table-body divide-y divide-slate-800/60 text-slate-300">
                {alerts.slice(0, 5).map((a) => (
                  <tr key={a.alert_id} className="dashboard-table-row hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        a.severity === 'Critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                        a.severity === 'High' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                        'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                      }`}>
                        {a.severity}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-200">{a.facility_name || a.facility_id}</td>
                    <td className="py-2.5 px-3">{a.alert_type}</td>
                    <td className="py-2.5 px-3">
                      <span className="dashboard-status text-slate-400 bg-slate-800 px-2 py-0.5 rounded text-[10px]">{a.status}</span>
                    </td>
                  </tr>
                ))}
                {alerts.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-slate-500">No active alerts detected.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* AI Recommendations Table */}
        <GlassCard 
          title="AI Energy Recommendations" 
          subtitle="Prioritized actions with estimated monthly cost & kWh savings"
          action={
            <Link to="/recommendations" className="text-xs text-cyan-400 hover:underline flex items-center gap-1">
              View All <ExternalLink className="w-3 h-3" />
            </Link>
          }
        >
          <div className="space-y-3">
            {recommendations.slice(0, 3).map((rec) => (
              <div key={rec.id} className="dashboard-recommendation p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/30 transition-all flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="font-semibold text-xs text-slate-200">{rec.title}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                    +${rec.estimated_savings_usd}/mo
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1">{rec.reason}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/50">
                  <span>Target: {rec.facility_name}</span>
                  <span className="text-cyan-400 font-medium">Est. {rec.estimated_savings_kwh} kWh</span>
                </div>
              </div>
            ))}
            {recommendations.length === 0 && (
              <p className="text-center text-slate-500 py-6">All systems optimized.</p>
            )}
          </div>
        </GlassCard>

      </div>

    </div>
  );
};
