import React from 'react';

/**
 * Semi-circle gauge (0–100) using stroke-dasharray.
 * The track and filled arc share the same SVG path so geometry is always correct.
 */
export const RiskGauge = ({ score = 0 }) => {
    const pct = Math.min(100, Math.max(0, score));

    const cx = 110, cy = 105, r = 80;
    // Arc from left (180°) to right (0°) going through the top — sweep=1 in SVG
    const pathD = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
    // Total arc length = π * r  (half circumference)
    const totalLen = Math.PI * r;
    const filledLen = (pct / 100) * totalLen;

    const color = pct >= 85 ? '#ef4444'
                : pct >= 60 ? '#f97316'
                : pct >= 40 ? '#eab308'
                : '#22c55e';

    const label = pct >= 85 ? 'Critical'
                : pct >= 60 ? 'High'
                : pct >= 40 ? 'Medium'
                : 'Low';

    const labelColor = pct >= 85 ? 'text-red-400'
                     : pct >= 60 ? 'text-orange-400'
                     : pct >= 40 ? 'text-yellow-400'
                     : 'text-emerald-400';

    return (
        <div className="flex flex-col items-center gap-1">
            <svg viewBox="22 18 176 100" className="w-full max-w-[220px]">
                {/* Background track */}
                <path
                    d={pathD}
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="15"
                    strokeLinecap="round"
                />
                {/* Filled arc — same path, dasharray controls length */}
                {pct > 0 && (
                    <path
                        d={pathD}
                        fill="none"
                        stroke={color}
                        strokeWidth="15"
                        strokeLinecap="round"
                        strokeDasharray={`${filledLen} ${totalLen}`}
                        strokeDashoffset={0}
                    />
                )}
                {/* Score label */}
                <text x={cx} y={cy - 14} textAnchor="middle" fontSize="36"
                    fontWeight="bold" fill="white">{Math.round(pct)}</text>
                <text x={cx} y={cy + 8}  textAnchor="middle" fontSize="12"
                    fill="#94a3b8">/100</text>
            </svg>
            <span className={`text-base font-bold ${labelColor}`}>{label} Risk</span>
        </div>
    );
};
