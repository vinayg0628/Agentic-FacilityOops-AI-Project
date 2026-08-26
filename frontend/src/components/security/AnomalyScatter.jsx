import React, { useState } from 'react';

const W = 700, H = 220;
const PAD = { t: 20, r: 20, b: 40, l: 50 };

const scX = (h) => PAD.l + (h / 23) * (W - PAD.l - PAD.r);
const scY = (v) => PAD.t + (1 - v) * (H - PAD.t - PAD.b);

export const AnomalyScatter = ({ points = [] }) => {
    const [hover, setHover] = useState(null);
    if (!points.length) return <div className='h-40 flex items-center justify-center text-slate-500 text-sm'>No data</div>;

    const normal    = points.filter(p => !p.is_anomaly);
    const anomalies = points.filter(p =>  p.is_anomaly);

    return (
        <div className='relative w-full'>
            <svg viewBox={`0 0 ${W} ${H}`} className='w-full' style={{ height: H }}
                onMouseLeave={() => setHover(null)}>
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1.0].map(v => (
                    <g key={v}>
                        <line x1={PAD.l} y1={scY(v)} x2={W - PAD.r} y2={scY(v)} stroke='#1e293b' strokeWidth='1' />
                        <text x={PAD.l - 6} y={scY(v) + 4} textAnchor='end' fontSize='10' fill='#475569'>{v.toFixed(1)}</text>
                    </g>
                ))}
                {/* X-axis labels */}
                {[0, 6, 12, 18, 23].map(h => (
                    <text key={h} x={scX(h)} y={H - 6} textAnchor='middle' fontSize='10' fill='#475569'>{h}h</text>
                ))}
                {/* Y-axis label */}
                <text x={14} y={H / 2} textAnchor='middle' fontSize='10' fill='#64748b'
                    transform={`rotate(-90, 14, ${H / 2})`}>Zone Risk</text>
                {/* X-axis label */}
                <text x={W / 2} y={H - 2} textAnchor='middle' fontSize='10' fill='#64748b'>Hour of Day</text>

                {/* Normal points */}
                {normal.map((p, i) => (
                    <circle key={`n-${i}`}
                        cx={scX(p.x)} cy={scY(p.y)} r='3'
                        fill='#475569' opacity='0.6'
                        onMouseEnter={() => setHover(p)}
                    />
                ))}
                {/* Anomaly glow circles */}
                {anomalies.map((p, i) => (
                    <g key={`a-${i}`} onMouseEnter={() => setHover(p)}>
                        <circle cx={scX(p.x)} cy={scY(p.y)} r='10' fill='#ef4444' opacity='0.15' />
                        <circle cx={scX(p.x)} cy={scY(p.y)} r='6'  fill='#ef4444' opacity='0.4'  />
                        <circle cx={scX(p.x)} cy={scY(p.y)} r='3'  fill='#fca5a5' />
                    </g>
                ))}
            </svg>

            {/* Legend */}
            <div className='flex gap-4 mt-2'>
                <div className='flex items-center gap-1.5 text-xs text-slate-400'>
                    <div className='w-2.5 h-2.5 rounded-full bg-slate-500' />Normal
                </div>
                <div className='flex items-center gap-1.5 text-xs text-red-400'>
                    <div className='w-2.5 h-2.5 rounded-full bg-red-500' />Anomaly — Isolation Forest
                </div>
                <span className='text-xs text-slate-500 ml-auto'>{normal.length} normal, <strong className="text-red-400">{anomalies.length} anomalies</strong></span>
            </div>

            {/* Tooltip */}
            {hover && (
                <div className='absolute top-2 right-2 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-xs text-slate-200 shadow-xl max-w-[200px]'>
                    {hover.is_anomaly && <div className='text-red-400 font-semibold mb-1'>⚠ Anomaly</div>}
                    <div>User: <strong>{hover.user_id}</strong></div>
                    <div>Zone: {hover.zone_id}</div>
                    <div>Hour: {hover.x}:00</div>
                    <div>Zone Risk: {hover.y}</div>
                    <div>Result: <span className={hover.result === 'Denied' ? 'text-red-400' : 'text-emerald-400'}>{hover.result}</span></div>
                </div>
            )}
        </div>
    );
};
