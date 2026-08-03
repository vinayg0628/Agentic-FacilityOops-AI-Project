import React from 'react';

export const RiskBadge = ({ level, size = 'sm' }) => {
  let colorStyles = '';
  const l = level?.toLowerCase();

  if (['excellent', 'low', 'safe'].includes(l)) {
    colorStyles = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  } else if (['good', 'medium'].includes(l)) {
    colorStyles = 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
  } else if (['warning', 'high'].includes(l)) {
    colorStyles = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  } else if (['critical', 'emergency', 'immediate maintenance'].includes(l)) {
    colorStyles = 'bg-rose-500/20 text-rose-400 border-rose-500/30';
  } else {
    colorStyles = 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  }

  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 font-bold rounded-full border ${colorStyles} ${sizeStyles}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
      {level}
    </span>
  );
};
