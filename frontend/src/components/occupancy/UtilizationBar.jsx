import React from 'react';

const LABEL_COLORS = {
    High:          'text-red-400 bg-red-500/10 border border-red-500/30',
    Moderate:      'text-amber-400 bg-amber-500/10 border border-amber-500/30',
    Low:           'text-yellow-400 bg-yellow-500/10 border border-yellow-500/30',
    Underutilized: 'text-slate-400 bg-slate-700 border border-slate-600',
};

const BAR_COLORS = {
    High:          'bg-red-500',
    Moderate:      'bg-amber-500',
    Low:           'bg-yellow-400',
    Underutilized: 'bg-slate-600',
};

export const UtilizationBar = ({ data = [], maxItems = 15 }) => {
    const items = data.slice(0, maxItems);
    if (!items.length) return <div className='py-6 text-center text-slate-500 text-sm'>No utilization data</div>;

    return (
        <div className='space-y-3'>
            {items.map(r => {
                const avgW = Math.min(100, r.avg_occupancy_pct);
                const peakW = Math.min(100, r.peak_occupancy_pct);
                const color = BAR_COLORS[r.utilization_label] || 'bg-slate-500';
                const labelCls = LABEL_COLORS[r.utilization_label] || LABEL_COLORS.Low;
                return (
                    <div key={r.room_id}>
                        <div className='flex items-center justify-between mb-1'>
                            <div className='flex items-center gap-2'>
                                <span className='text-sm text-slate-200 font-medium truncate max-w-[160px]'>{r.room_name}</span>
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${labelCls}`}>{r.utilization_label}</span>
                            </div>
                            <div className='flex items-center gap-3 text-xs text-slate-400'>
                                <span>Avg <strong className='text-slate-200'>{r.avg_occupancy_pct}%</strong></span>
                                <span>Peak <strong className='text-slate-200'>{r.peak_occupancy_pct}%</strong></span>
                            </div>
                        </div>
                        <div className='relative h-5 bg-slate-800 rounded-full overflow-hidden'>
                            {/* Peak bar (lighter, behind) */}
                            <div className={`absolute h-full rounded-full opacity-30 ${color} transition-all duration-500`}
                                style={{ width: `${peakW}%` }} />
                            {/* Avg bar */}
                            <div className={`absolute h-full rounded-full ${color} transition-all duration-500`}
                                style={{ width: `${avgW}%` }} />
                            {/* Avg label inside bar */}
                            {avgW > 15 && (
                                <span className='absolute left-2 top-0.5 text-[10px] text-white font-medium'>{r.avg_occupancy_pct}%</span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
