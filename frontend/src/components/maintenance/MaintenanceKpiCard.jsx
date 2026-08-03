import React from 'react';

export const MaintenanceKpiCard = ({ label, value, subtitle, icon: Icon, color = 'cyan', trend, trendValue }) => {
  const colorStyles = {
    cyan: 'from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30',
    emerald: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
    amber: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
    rose: 'from-rose-500/20 to-pink-500/20 text-rose-400 border-rose-500/30',
    violet: 'from-violet-500/20 to-purple-500/20 text-violet-400 border-violet-500/30',
    blue: 'from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30'
  };

  const selectedColor = colorStyles[color] || colorStyles.cyan;

  return (
    <div className={`bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 p-5 flex flex-col justify-between transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(0,0,0,0.3)] hover:border-opacity-50 relative overflow-hidden group`}>
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${selectedColor.split(' ')[0]} ${selectedColor.split(' ')[1]} opacity-0 group-hover:opacity-20 blur transition duration-500 rounded-2xl`}></div>
      <div className="relative flex justify-between items-start mb-4">
        <div>
          <p className="text-slate-400 text-sm font-medium">{label}</p>
          <h3 className="text-3xl font-bold text-slate-100 mt-1">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${selectedColor.split(' ').slice(0, 2).join(' ')} ${selectedColor.split(' ')[3]}`}>
          {Icon && <Icon className={`w-6 h-6 ${selectedColor.split(' ')[2]}`} />}
        </div>
      </div>
      <div className="flex items-center justify-between relative mt-2">
        <span className="text-xs text-slate-500">{subtitle}</span>
        {trend && (
          <span className={`text-xs font-bold ${trend === 'up' ? 'text-emerald-400' : 'text-rose-400'} flex items-center gap-1`}>
            {trend === 'up' ? '↑' : '↓'} {trendValue}%
          </span>
        )}
      </div>
    </div>
  );
};
