import React, { useState } from 'react';

export const AccessTimelineChart = ({ deniedByHour = {}, allowedByHour = {} }) => {
    const [hover, setHover] = useState(null);
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const maxVal = Math.max(...hours.map(h => (allowedByHour[h] || 0) + (deniedByHour[h] || 0)), 1);

    return (
        <div>
            <div className='flex items-end gap-1 h-40 border-b border-slate-700/50 pb-1 relative'>
                {hours.map(h => {
                    const allowed = allowedByHour[String(h)] || 0;
                    const denied  = deniedByHour[String(h)]  || 0;
                    const total   = allowed + denied;
                    const aH = (allowed / maxVal) * 140;
                    const dH = (denied  / maxVal) * 140;
                    return (
                        <div key={h} className='flex-1 flex flex-col items-center justify-end gap-0 relative'
                            onMouseEnter={() => setHover({ h, allowed, denied, total })}
                            onMouseLeave={() => setHover(null)}
                        >
                            {dH > 0 && <div className='w-full bg-red-500/80 rounded-t-sm transition-all' style={{ height: dH }} />}
                            {aH > 0 && <div className='w-full bg-emerald-600/70 transition-all' style={{ height: aH }} />}
                            {hover?.h === h && (
                                <div className='absolute bottom-full mb-1 left-1/2 -translate-x-1/2 z-10 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-[10px] text-slate-200 shadow whitespace-nowrap pointer-events-none'>
                                    {h}:00 — Allowed: <strong className='text-emerald-400'>{allowed}</strong>, Denied: <strong className='text-red-400'>{denied}</strong>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            <div className='flex justify-between text-[9px] text-slate-500 mt-1 px-0.5'>
                {[0,4,8,12,16,20,23].map(h => <span key={h}>{h}h</span>)}
            </div>
            <div className='flex gap-4 mt-2'>
                <div className='flex items-center gap-1.5 text-xs text-emerald-400'><div className='w-2.5 h-2.5 rounded-sm bg-emerald-600' />Allowed</div>
                <div className='flex items-center gap-1.5 text-xs text-red-400'><div className='w-2.5 h-2.5 rounded-sm bg-red-500' />Denied</div>
            </div>
        </div>
    );
};
