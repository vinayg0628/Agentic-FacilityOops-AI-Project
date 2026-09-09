import React, { useState } from 'react';
import { GlassCard } from '../../components/common/GlassCard';
import { KpiCard } from '../../components/common/KpiCard';
import { Zap, Target, TrendingDown, DollarSign, Settings, CheckCircle } from 'lucide-react';
import { SimulationEngine } from './SimulationEngine';

const OptimizationCenter = () => {

  return (
    <div className="dashboard-page space-y-6">
      
      {/* Top Banner */}
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-6 h-6 text-cyan-400" />
        <h1 className="text-2xl font-bold text-slate-100">Optimization Center</h1>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Savings Opportunity"
          value="4.8L"
          unit="/month"
          icon={Target}
          color="amber"
          subtext="Identified across all agents"
        />

        <KpiCard
          title="Realized Savings"
          value="2.1L"
          unit="/month"
          icon={CheckCircle}
          color="emerald"
          subtext="Year-to-date achieved"
        />

        <KpiCard
          title="Pending Opportunities"
          value="2.7L"
          unit="/month"
          icon={TrendingDown}
          color="cyan"
          subtext="Available for action"
        />

        <KpiCard
          title="Average ROI"
          value="34"
          unit="%"
          icon={DollarSign}
          color="blue"
          subtext="On implemented optimizations"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Active Opportunities Table */}
        <GlassCard className="lg:col-span-8" title="Pending Optimization Opportunities">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="dashboard-table-head text-[11px] uppercase text-slate-400 bg-slate-900/60 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Opportunity</th>
                  <th className="py-2.5 px-3">Saving</th>
                  <th className="py-2.5 px-3">Investment</th>
                  <th className="py-2.5 px-3">ROI</th>
                  <th className="py-2.5 px-3">Priority</th>
                </tr>
              </thead>
              <tbody className="dashboard-table-body divide-y divide-slate-800/60 text-slate-300">
                <tr className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-slate-200">HVAC Optimization (Floor 4)</td>
                  <td className="py-2.5 px-3 text-emerald-400">₹85K/mo</td>
                  <td className="py-2.5 px-3">₹1.5L</td>
                  <td className="py-2.5 px-3 text-cyan-400">68%</td>
                  <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-bold">High</span></td>
                </tr>
                <tr className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-slate-200">LED Upgrade (Zone B)</td>
                  <td className="py-2.5 px-3 text-emerald-400">₹55K/mo</td>
                  <td className="py-2.5 px-3">₹3.0L</td>
                  <td className="py-2.5 px-3 text-cyan-400">22%</td>
                  <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-bold">Medium</span></td>
                </tr>
                <tr className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-slate-200">Preventive Maintenance Shift</td>
                  <td className="py-2.5 px-3 text-emerald-400">₹40K/mo</td>
                  <td className="py-2.5 px-3">₹40K</td>
                  <td className="py-2.5 px-3 text-cyan-400">100%</td>
                  <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-bold">High</span></td>
                </tr>
                <tr className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-slate-200">Workspace Consolidation</td>
                  <td className="py-2.5 px-3 text-emerald-400">₹30K/mo</td>
                  <td className="py-2.5 px-3">₹10K</td>
                  <td className="py-2.5 px-3 text-cyan-400">300%</td>
                  <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-bold">Medium</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* What-If Simulator */}
        <div className="lg:col-span-4">
          <SimulationEngine />
        </div>

      </div>
    </div>
  );
};

export default OptimizationCenter;
