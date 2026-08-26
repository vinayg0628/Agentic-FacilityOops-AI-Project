import React, { useRef, useState } from 'react';

const W = 800, H = 240, PAD = { t: 20, r: 20, b: 40, l: 48 };

const scaleX = (i, n) => PAD.l + (i / (n - 1)) * (W - PAD.l - PAD.r);
const scaleY = (v) => PAD.t + (1 - v) * (H - PAD.t - PAD.b);

const toPath = (pts) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');

export const ForecastChart = ({ forecast = [], historicalRates = [] }) => {
    const [hover, setHover] = useState(null);
    if (!forecast.length) return <div className='h-40 flex items-center justify-center text-slate-500 text-sm'>No forecast data</div>;

    const n = forecast.length;
    const predPts  = forecast.map((d, i) => ({ x: scaleX(i, n), y: scaleY(d.predicted_occupancy_rate) }));
    // Confidence band (±8%)
    const bandTop  = forecast.map((d, i) => ({ x: scaleX(i, n), y: scaleY(Math.min(1, d.predicted_occupancy_rate + 0.08)) }));
    const bandBot  = forecast.map((d, i) => ({ x: scaleX(i, n), y: scaleY(Math.max(0, d.predicted_occupancy_rate - 0.08)) })).reverse();
    const bandPath = [...bandTop, ...bandBot].map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + ' Z';

    // Grid lines
    const gridY = [0, 0.25, 0.50, 0.75, 1.0];

    // Peak & low
    const peak = forecast.reduce((a, b) => a.predicted_occupancy_rate > b.predicted_occupancy_rate ? a : b);
    const low  = forecast.reduce((a, b) => a.predicted_occupancy_rate < b.predicted_occupancy_rate ? a : b);
    const peakIdx = forecast.indexOf(peak);
    const lowIdx  = forecast.indexOf(low);

    return (
        <div className='relative w-full'>
            <svg viewBox={`0 0 ${W} ${H}`} className='w-full' style={{ height: 240 }}
                onMouseLeave={() => setHover(null)}
            >
                {/* Grid */}
                {gridY.map(v => (
                    <g key={v}>
                        <line x1={PAD.l} y1={scaleY(v)} x2={W - PAD.r} y2={scaleY(v)}
                            stroke='#334155' strokeWidth='1' strokeDasharray='4 4' />
                        <text x={PAD.l - 6} y={scaleY(v) + 4} textAnchor='end'
                            fontSize='10' fill='#64748b'>{Math.round(v * 100)}%</text>
                    </g>
                ))}

                {/* Confidence band */}
                <path d={bandPath} fill='#10b981' fillOpacity='0.12' />

                {/* Predicted line */}
                <path d={toPath(predPts)} fill='none' stroke='#10b981' strokeWidth='2.5' strokeLinecap='round' />

                {/* Peak annotation */}
                <circle cx={predPts[peakIdx]?.x} cy={predPts[peakIdx]?.y} r='5' fill='#10b981' />
                <text x={predPts[peakIdx]?.x} y={(predPts[peakIdx]?.y ?? 0) - 10}
                    textAnchor='middle' fontSize='10' fill='#10b981'
                >Peak {peak.predicted_occupancy_pct}% at {peak.hour}:00</text>

                {/* Low annotation */}
                <circle cx={predPts[lowIdx]?.x} cy={predPts[lowIdx]?.y} r='5' fill='#94a3b8' />
                <text x={predPts[lowIdx]?.x} y={(predPts[lowIdx]?.y ?? 0) + 18}
                    textAnchor='middle' fontSize='10' fill='#94a3b8'
                >Low {low.predicted_occupancy_pct}% at {low.hour}:00</text>

                {/* X-axis labels */}
                {forecast.filter((_, i) => i % 4 === 0).map((d, i) => {
                    const idx = i * 4;
                    return (
                        <text key={idx} x={scaleX(idx, n)} y={H - 6}
                            textAnchor='middle' fontSize='10' fill='#64748b'>
                            {d.hour}:00
                        </text>
                    );
                })}

                {/* Hover tracking */}
                {forecast.map((d, i) => (
                    <rect key={i}
                        x={scaleX(i, n) - (W / (n * 2))} y={PAD.t}
                        width={W / n} height={H - PAD.t - PAD.b}
                        fill='transparent'
                        onMouseEnter={() => setHover({ d, i })}
                    />
                ))}

                {/* Hover line */}
                {hover && (
                    <line x1={predPts[hover.i]?.x} y1={PAD.t}
                        x2={predPts[hover.i]?.x} y2={H - PAD.b}
                        stroke='#475569' strokeWidth='1' strokeDasharray='3 3' />
                )}
            </svg>

            {/* Tooltip */}
            {hover && (
                <div className='absolute top-2 right-4 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-xs text-slate-200 shadow-xl'>
                    <div className='font-semibold'>{hover.d.day_label} {hover.d.hour}:00</div>
                    <div>Predicted: <strong className='text-emerald-400'>{hover.d.predicted_occupancy_pct}%</strong></div>
                    <div>Confidence: {Math.round(hover.d.confidence * 100)}%</div>
                    <div>Status: <strong>{hover.d.status}</strong></div>
                </div>
            )}
        </div>
    );
};
