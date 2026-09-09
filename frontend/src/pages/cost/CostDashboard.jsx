import React, { useState } from 'react';
import { GlassCard } from '../../components/common/GlassCard';
import { KpiCard } from '../../components/common/KpiCard';
import { BarChart2, TrendingUp, AlertTriangle, Shield, CheckCircle } from 'lucide-react';

const CostDashboard = () => {
  const [activeTab, setActiveTab] = useState('operations');

  // Hardcoded mockup data matching prompt requirements
  const costDistribution = [
    { category: 'Energy', monthly: '₹8,40,000', pct: 37 },
    { category: 'Maintenance', monthly: '₹5,20,000', pct: 23 },
    { category: 'Vendors', monthly: '₹4,80,000', pct: 21 },
    { category: 'Security', monthly: '₹3,10,000', pct: 14 },
    { category: 'Water', monthly: '₹1,20,000', pct: 5 }
  ];

  const vendorData = [
    { name: 'Vendor A (HVAC)', cost: '₹4.2L', sla: '94%', perf: '91%', status: 'Optimal' },
    { name: 'Vendor B (Electrical)', cost: '₹6.1L', sla: '81%', perf: '72%', status: 'Review Required' },
    { name: 'Vendor C (Security)', cost: '₹3.5L', sla: '98%', perf: '94%', status: 'Optimal' },
  ];

  const budgetData = [
    { dept: 'Maintenance', budget: '₹50,00,000', spent: '₹43,00,000', used: 86, proj: '₹58,00,000', status: 'OVER_BUDGET' },
    { dept: 'Energy', budget: '₹100,00,000', spent: '₹84,00,000', used: 84, proj: '₹98,00,000', status: 'ON_TRACK' },
    { dept: 'Security', budget: '₹40,00,000', spent: '₹31,00,000', used: 77, proj: '₹38,00,000', status: 'ON_TRACK' },
  ];

  return (
    <div className="dashboard-page space-y-6">
      
      <div className="flex items-center gap-2 mb-4">
        <BarChart2 className="w-6 h-6 text-amber-400" />
        <h1 className="text-2xl font-bold text-slate-100">Cost Analytics</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Operating Cost" value="22.7L" unit="/mo" icon={TrendingUp} color="amber" subtext="Across all categories" />
        <KpiCard title="Cost Anomaly (May)" value="84%" icon={AlertTriangle} color="rose" subtext="Maintenance spike detected" />
        <KpiCard title="ML Forecast (June)" value="25.8L" unit="/mo" icon={BarChart2} color="blue" subtext="Projected to exceed budget by 8.4%" />
        <KpiCard title="Vendor Efficiency" value="83" unit="/100" icon={Shield} color="emerald" subtext="Aggregated SLA score" />
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-800">
        <button 
          onClick={() => setActiveTab('operations')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'operations' ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          Operational Expenditure
        </button>
        <button 
          onClick={() => setActiveTab('budget')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'budget' ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          Budget Compliance
        </button>
        <button 
          onClick={() => setActiveTab('vendors')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'vendors' ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          Vendor Optimization
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {activeTab === 'operations' && (
          <GlassCard title="Operational Cost Distribution">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] uppercase text-slate-400 bg-slate-900/60 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Monthly Cost</th>
                    <th className="py-2.5 px-3">% of Total</th>
                    <th className="py-2.5 px-3">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {costDistribution.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-medium text-slate-200">{item.category}</td>
                      <td className="py-2.5 px-3 text-amber-400 font-mono">{item.monthly}</td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-slate-700 rounded-full h-1.5">
                            <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${item.pct}%` }}></div>
                          </div>
                          <span className="text-[10px]">{item.pct}%</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-emerald-400">Stable</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}

        {activeTab === 'budget' && (
          <GlassCard title="Budget Compliance (Quarterly)">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] uppercase text-slate-400 bg-slate-900/60 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3">Total Budget</th>
                    <th className="py-2.5 px-3">Current Spend</th>
                    <th className="py-2.5 px-3">Projected Final</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {budgetData.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-medium text-slate-200">{item.dept}</td>
                      <td className="py-2.5 px-3 font-mono">{item.budget}</td>
                      <td className="py-2.5 px-3 font-mono text-cyan-400">{item.spent}</td>
                      <td className="py-2.5 px-3 font-mono">{item.proj}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'OVER_BUDGET' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        }`}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}

        {activeTab === 'vendors' && (
          <GlassCard title="Vendor Performance Benchmarking">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] uppercase text-slate-400 bg-slate-900/60 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Vendor</th>
                    <th className="py-2.5 px-3">Cost</th>
                    <th className="py-2.5 px-3">SLA Compliance</th>
                    <th className="py-2.5 px-3">Performance</th>
                    <th className="py-2.5 px-3">AI Recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {vendorData.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-medium text-slate-200">{item.name}</td>
                      <td className="py-2.5 px-3 font-mono text-amber-400">{item.cost}</td>
                      <td className="py-2.5 px-3">{item.sla}</td>
                      <td className="py-2.5 px-3">{item.perf}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'Review Required' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}

      </div>
    </div>
  );
};

export default CostDashboard;
