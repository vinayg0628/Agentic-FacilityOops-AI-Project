import React, { useState } from 'react';
import { Sparkles, ChevronDown, DollarSign, Clock, Wrench } from 'lucide-react';

export const RecommendationCard = ({ recommendation }) => {
  const [expanded, setExpanded] = useState(false);

  const getPriorityColor = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'high': return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
      case 'medium': return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      case 'low': return 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
      default: return 'text-slate-400 border-slate-500/30 bg-slate-800';
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);
  };

  return (
    <div className="bg-slate-900/60 border border-violet-500/20 backdrop-blur-md rounded-xl overflow-hidden transition-all duration-300 hover:border-violet-500/40 hover:shadow-[0_0_15px_rgba(139,92,246,0.1)]">
      <div 
        className="p-4 cursor-pointer flex items-center justify-between gap-4"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="p-2 bg-violet-500/20 text-violet-400 rounded-lg shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getPriorityColor(recommendation.priority)}`}>
                {recommendation.priority}
              </span>
              <h4 className="text-sm font-bold text-slate-200 truncate">{recommendation.action}</h4>
            </div>
            <p className="text-xs text-slate-400 truncate">{recommendation.reason}</p>
          </div>
        </div>
        <button className={`p-1 text-slate-500 hover:text-slate-300 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-4 pt-0 border-t border-slate-800/50 bg-slate-900/40">
          <p className="text-xs text-slate-300 mb-4 mt-3 leading-relaxed">
            {recommendation.reason}
          </p>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-950/50 rounded-lg p-3 flex items-center gap-3">
              <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-md">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase">Est. Cost</p>
                <p className="text-sm font-bold text-slate-200">{formatCurrency(recommendation.estimated_cost_usd)}</p>
              </div>
            </div>
            <div className="bg-slate-950/50 rounded-lg p-3 flex items-center gap-3">
              <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-md">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase">Est. Downtime</p>
                <p className="text-sm font-bold text-slate-200">{recommendation.estimated_downtime_hours} hrs</p>
              </div>
            </div>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 mb-4">
            <p className="text-[10px] text-emerald-500 uppercase font-bold mb-1">Expected Benefit</p>
            <p className="text-xs text-emerald-400/90">{recommendation.expected_benefit}</p>
          </div>

          <div className="flex gap-2">
            <button className="flex-1 py-2 text-xs font-bold text-slate-900 bg-violet-400 hover:bg-violet-300 rounded-lg transition-colors flex justify-center items-center gap-2">
              <Wrench className="w-3.5 h-3.5" /> Schedule Task
            </button>
            <button className="flex-1 py-2 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
