import React from 'react';

export const GlassCard = ({ children, className = '', title, subtitle, action }) => {
  return (
    <div className={`glass-panel p-5 relative overflow-hidden ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800/80 light:border-slate-200">
          <div>
            {title && <h3 className="text-sm font-bold text-slate-100 light:text-slate-900 tracking-wide">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-400 light:text-slate-600 font-medium mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
