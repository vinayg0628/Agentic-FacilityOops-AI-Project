import React, { useState } from 'react';

const rateToColor = (rate) => {
    if (rate >= 0.95) return 'bg-red-600';
    if (rate >= 0.80) return 'bg-orange-500';
    if (rate >= 0.60) return 'bg-amber-400';
    if (rate >= 0.40) return 'bg-yellow-300';
    if (rate >= 0.20) return 'bg-emerald-400';
    return 'bg-slate-700';
};

export const HeatmapMatrix = ({ matrix = [] }) => {
    const [tooltip, setTooltip] = useState(null);
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
        <div>
            {/* Hour headers */}
            <div className='flex gap-0.5 mb-1 ml-10'>
                {hours.map(h => (
                    <div key={h} className='flex-1 text-center text-[10px] text-slate-500'>
                        {h % 3 === 0 ? `${h}h` : ''}
                    </div>
                ))}
            </div>

            {/* Rows */}
            <div className='space-y-0.5'>
                {matrix.map(row => (
                    <div key={row.day} className='flex items-center gap-0.5'>
                        <div className='w-9 text-right text-xs text-slate-400 pr-1 flex-shrink-0'>{row.day}</div>
                        {hours.map(h => {
                            const rate = row.hours?.[String(h)] ?? 0;
                            const key = `${row.day}-${h}`;
                            return (
                                <div
                                    key={key}
                                    onMouseEnter={() => setTooltip({ day: row.day, h, rate })}
                                    onMouseLeave={() => setTooltip(null)}
                                    className={`flex-1 h-7 rounded-sm cursor-pointer transition-opacity hover:opacity-80 relative ${rateToColor(rate)}`}
                                >
                                    {tooltip && tooltip.day === row.day && tooltip.h === h && (
                                        <div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-20 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-[10px] text-slate-200 shadow-xl whitespace-nowrap pointer-events-none'>
                                            {row.day} {h}:00 — {Math.round(rate * 100)}%
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className='flex items-center gap-2 mt-3'>
                <span className='text-xs text-slate-500'>Low</span>
                {['bg-slate-700','bg-emerald-400','bg-yellow-300','bg-amber-400','bg-orange-500','bg-red-600'].map((cls, i) => (
                    <div key={i} className={`flex-1 h-2 rounded ${cls}`} />
                ))}
                <span className='text-xs text-slate-500'>High</span>
            </div>
        </div>
    );
};
