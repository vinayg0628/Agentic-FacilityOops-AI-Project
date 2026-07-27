import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export const KpiCard = ({ 
  title, 
  value, 
  unit = '', 
  changePct = null, 
  icon: Icon, 
  color = 'cyan',
  subtext = '' 
}) => {
  const isPositive = changePct !== null && changePct > 0;
  const isNegative = changePct !== null && changePct < 0;

  const colorStyles = {
    cyan: 'from-cyan-500/20 to-blue-500/10 text-cyan-400 border-cyan-500/30 shadow-cyan-500/10',
    blue: 'from-blue-500/20 to-indigo-500/10 text-blue-400 border-blue-500/30 shadow-blue-500/10',
    emerald: 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/30 shadow-emerald-500/10',
    amber: 'from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/30 shadow-amber-500/10',
    rose: 'from-rose-500/20 to-pink-500/10 text-rose-400 border-rose-500/30 shadow-rose-500/10'
  };

  return (
    <div className="glass-panel p-5 relative flex flex-col justify-between hover:scale-[1.01] transition-transform">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-slate-400 tracking-wide uppercase">{title}</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-slate-100 tracking-tight font-mono">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
            {unit && <span className="text-xs font-semibold text-slate-400">{unit}</span>}
          </div>
        </div>
        
        {Icon && (
          <div className={`p-3 rounded-2xl bg-gradient-to-br border shadow-md ${colorStyles[color] || colorStyles.cyan}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
        {changePct !== null ? (
          <div className="flex items-center gap-1">
            <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-bold text-[11px] ${
              isPositive 
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                : isNegative 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-800 text-slate-400'
            }`}>
              {isPositive && <ArrowUpRight className="w-3 h-3" />}
              {isNegative && <ArrowDownRight className="w-3 h-3" />}
              {!isPositive && !isNegative && <Minus className="w-3 h-3" />}
              {Math.abs(changePct)}%
            </span>
            <span className="text-slate-500 text-[11px] font-medium">vs yesterday</span>
          </div>
        ) : (
          <span className="text-slate-400 text-[11px] font-medium truncate">{subtext}</span>
        )}
      </div>
    </div>
  );
};
