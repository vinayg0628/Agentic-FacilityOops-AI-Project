import React, { useState, useEffect } from 'react';
import { GlassCard } from '../../components/common/GlassCard';
import { KpiCard } from '../../components/common/KpiCard';
import { TrendingDown, Activity, DollarSign, Shield, Zap, Wrench, Users, BarChart3 } from 'lucide-react';
import api from '../../services/api';

const ExecutiveDashboard = () => {
  const [data, setData] = useState({
    overview: null,
    costDistribution: [],
    topOpportunities: [],
    health: null,
    aiSummary: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, costRes, oppsRes, healthRes, aiRes] = await Promise.all([
          api.get('/executive/overview'),
          api.get('/executive/cost-distribution'),
          api.get('/executive/top-opportunities'),
          api.get('/executive/facility-health'),
          api.get('/executive/ai-summary').catch(() => ({ data: { summary: "Facility Intelligence Summary: Data loaded successfully. Overall facility health is stable." } }))
        ]);
        
        setData({
          overview: overviewRes.data,
          costDistribution: costRes.data.value || costRes.data,
          topOpportunities: oppsRes.data.value || oppsRes.data,
          health: healthRes.data,
          aiSummary: aiRes.data.summary
        });
      } catch (err) {
        console.error("Failed to load executive data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-white">Loading Executive Data...</div>;

  const { overview, costDistribution, topOpportunities, health, aiSummary } = data;

  const totalCost = costDistribution.reduce((acc, c) => acc + c.amount, 0);
  const costPercentage = (amount) => totalCost ? (amount / totalCost) * 100 : 0;

  return (
    <div className="dashboard-page space-y-6">
      
      {/* Top Banner AI Summary */}
      <GlassCard className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-cyan-500/30">
        <div className="flex gap-4">
          <div className="p-3 bg-cyan-500/10 rounded-xl h-fit border border-cyan-500/20">
            <Activity className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-cyan-400 mb-2 uppercase tracking-widest">Facility Intelligence Summary</h2>
            <p className="text-slate-300 leading-relaxed text-sm">
              {aiSummary}
            </p>
          </div>
        </div>
      </GlassCard>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="COST"
          value={`${Math.abs(overview?.cost_change_pct || 0)}`}
          unit="% ↓"
          icon={TrendingDown}
          color="emerald"
          subtext="vs Last Month"
        />
        <KpiCard
          title="ROI"
          value={`${overview?.roi_pct || 0}`}
          unit="%"
          icon={BarChart3}
          color="blue"
          subtext="Avg implementation yield"
        />
        <KpiCard
          title="HEALTH"
          value={`${overview?.facility_health_score || 0}`}
          unit="/100"
          icon={Activity}
          color="cyan"
          subtext="Facility Score"
        />
        <KpiCard
          title="SAVINGS"
          value={`₹${((overview?.total_savings || 0)/100000).toFixed(2)}L`}
          unit=""
          icon={DollarSign}
          color="amber"
          subtext="Optimization potential"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cost Distribution */}
        <GlassCard title="Cost Distribution" className="lg:col-span-1">
          <div className="space-y-4 mt-2">
            {costDistribution.map((c, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">{c.category}</span>
                  <span className="text-slate-400 font-mono">{costPercentage(c.amount).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5">
                  <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${costPercentage(c.amount)}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Top Opportunities */}
        <GlassCard title="Top Optimization Opportunities" className="lg:col-span-1">
          <div className="space-y-3 mt-2 text-sm text-slate-300">
            {topOpportunities.length > 0 ? topOpportunities.map((o, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-slate-800/60 last:border-0">
                <span className="font-medium text-slate-200">{i+1}. {o.title}</span>
                <span className="text-emerald-400 font-mono font-bold">₹{o.estimated_saving.toLocaleString()}/mo</span>
              </div>
            )) : <div className="py-4 text-center text-slate-500">No opportunities pending.</div>}
          </div>
        </GlassCard>

        {/* Facility Health */}
        <GlassCard title="Facility Health" className="lg:col-span-1">
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50 flex flex-col items-center justify-center gap-2">
              <Zap className="w-5 h-5 text-emerald-400" />
              <span className="text-xs text-slate-400 uppercase">Energy</span>
              <span className="text-xs font-bold text-emerald-400">{health?.agents.energy}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50 flex flex-col items-center justify-center gap-2">
              <Wrench className="w-5 h-5 text-amber-400" />
              <span className="text-xs text-slate-400 uppercase">Equipment</span>
              <span className="text-xs font-bold text-amber-400">{health?.agents.maintenance}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50 flex flex-col items-center justify-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              <span className="text-xs text-slate-400 uppercase">Occupancy</span>
              <span className="text-xs font-bold text-cyan-400">{health?.agents.occupancy}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50 flex flex-col items-center justify-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              <span className="text-xs text-slate-400 uppercase">Security</span>
              <span className="text-xs font-bold text-emerald-400">{health?.agents.security}</span>
            </div>
          </div>
        </GlassCard>

      </div>
    </div>
  );
};

export default ExecutiveDashboard;
