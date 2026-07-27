import React from 'react';

export const MetricCard = ({ label, value, badgeText, status = 'normal' }) => {
  const statusColors = {
    normal: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10',
    warning: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
    critical: 'border-rose-500/30 text-rose-400 bg-rose-500/10',
  };

  return (
    <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold text-slate-100 mt-1 font-mono">{value}</p>
      </div>
      {badgeText && (
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusColors[status] || statusColors.normal}`}>
          {badgeText}
        </span>
      )}
    </div>
  );
};
