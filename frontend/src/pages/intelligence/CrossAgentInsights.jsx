import React from 'react';
import { GlassCard } from '../../components/common/GlassCard';
import { Lightbulb, Workflow, Users, Shield, Zap, Wrench, ArrowRight } from 'lucide-react';

const CrossAgentInsights = () => {
  const insights = [
    {
      id: 1,
      agents: [
        { name: 'Occupancy Agent', icon: Users, finding: 'Floor 5 occupancy = 9%', color: 'emerald' },
        { name: 'Energy Agent', icon: Zap, finding: 'Energy consumption = 75% of average', color: 'cyan' },
        { name: 'Cost Agent', icon: DollarSign, finding: 'Monthly energy cost = ₹1.8L', color: 'amber' }
      ],
      title: 'Workspace Consolidation',
      recommendation: 'Consolidate low-occupancy operations on Floor 5 and reduce HVAC/lighting operation during unused periods.',
      savings: '₹45,000/month'
    },
    {
      id: 2,
      agents: [
        { name: 'Maintenance Agent', icon: Wrench, finding: 'HVAC failure probability = 87%', color: 'violet' },
        { name: 'Cost Agent', icon: DollarSign, finding: 'Emergency repair = ₹2.5L vs PM = ₹40K', color: 'amber' }
      ],
      title: 'Preventive Maintenance ROI',
      recommendation: 'Perform preventive maintenance now to avoid a potential ₹2.5L emergency repair.',
      savings: '₹2.1L avoided cost'
    },
    {
      id: 3,
      agents: [
        { name: 'Security Agent', icon: Shield, finding: 'Unauthorized access increased by 40%', color: 'rose' },
        { name: 'Cost Agent', icon: DollarSign, finding: 'Additional security staffing cost = ₹1.2L/month', color: 'amber' }
      ],
      title: 'Security Staffing Inefficiency',
      recommendation: 'Security incidents are increasing in a specific zone. Before expanding staffing, investigate access-control failures.',
      savings: '₹1.2L avoided cost'
    }
  ];

  return (
    <div className="dashboard-page space-y-6">
      
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-6 h-6 text-cyan-400" />
        <h1 className="text-2xl font-bold text-slate-100">Cross-Agent Orchestration</h1>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {insights.map((insight) => (
          <GlassCard key={insight.id} className="border-cyan-500/20">
            <div className="p-4 flex flex-col lg:flex-row gap-6 items-start lg:items-center">
              
              {/* Agent Findings */}
              <div className="flex-1 space-y-3">
                <h3 className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2">Agent Events Triggered</h3>
                <div className="space-y-2">
                  {insight.agents.map((ag, idx) => {
                    const Icon = ag.icon;
                    return (
                      <div key={idx} className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg bg-${ag.color}-500/10 border border-${ag.color}-500/20`}>
                          <Icon className={`w-4 h-4 text-${ag.color}-400`} />
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-[10px] font-bold text-${ag.color}-400`}>{ag.name}</span>
                          <span className="text-xs text-slate-300">{ag.finding}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="hidden lg:flex shrink-0">
                <Workflow className="w-8 h-8 text-cyan-500/40" />
                <ArrowRight className="w-8 h-8 text-cyan-500/40 -ml-3" />
              </div>

              {/* Intelligence Engine Conclusion */}
              <div className="flex-1 bg-gradient-to-br from-slate-900 to-slate-950 p-4 rounded-xl border border-cyan-500/30">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-100">{insight.title}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-bold border border-cyan-500/40">
                    Engine Unified Decision
                  </span>
                </div>
                <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                  {insight.recommendation}
                </p>
                <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Estimated Impact</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">{insight.savings}</span>
                </div>
              </div>
              
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

// Simple helper since we didn't import DollarSign globally
function DollarSign(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"></line>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
    </svg>
  );
}

export default CrossAgentInsights;
