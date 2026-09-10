import React from 'react';

export const FloorPlanRoom = ({ room, region, onClick, onMouseEnter, onMouseLeave, isSelected }) => {
    if (!room || !region) return null;

    const pct = room.occupancy_pct || 0;
    
    // Determine Heatmap Glow Colors & Intensity based on exact rules
    let glowBase = '#22d3ee'; // cyan-400
    let glowCore = '#0891b2'; // cyan-600
    let glowStroke = '#06b6d4';
    
    // Status ranges
    if (pct > 100) {
        glowBase = '#ef4444'; // red-500
        glowCore = '#b91c1c'; // red-700
        glowStroke = '#f87171';
    } else if (pct > 75) {
        glowBase = '#06b6d4'; // strong bright cyan
        glowCore = '#0284c7'; 
        glowStroke = '#38bdf8';
    } else if (pct > 50) {
        glowBase = '#0ea5e9'; // medium sky blue
        glowCore = '#1d4ed8'; 
        glowStroke = '#3b82f6';
    } else if (pct > 25) {
        glowBase = '#38bdf8'; // low sky blue
        glowCore = '#1e40af'; 
        glowStroke = '#2563eb';
    } else {
        glowBase = '#7dd3fc'; // very low glow
        glowCore = '#1e3a8a'; 
        glowStroke = '#1e3a8a';
    }

    // Scale intensity
    const baseOpacity = Math.max(0.05, Math.min(0.9, (pct / 100)));
    const maxOpacity = pct > 100 ? 0.9 : baseOpacity;
    
    // Cross-agent mock alerts (simulated logic)
    const hasSecurityAlert = room.room_name.toLowerCase().includes('server') && pct === 0;
    const hasEnergyAlert = room.room_name.toLowerCase().includes('lab') && pct > 80;
    const hasMaintenanceAlert = room.room_name.toLowerCase().includes('conference') && pct > 50;

    // Format label: strip "Floor X " from the start
    const shortName = room.room_name.replace(/^Floor\s+\d+\s+/i, '');
    
    // Calculate center for text placement (approximate based on bounding box provided by region metadata)
    const cx = region.cx || (region.x + region.w / 2);
    const cy = region.cy || (region.y + region.h / 2);
    const isSmall = region.w && region.w < 100; // Determine if room is too small for big text

    return (
        <g 
            style={{ cursor: 'pointer', transition: 'all 0.5s ease' }} 
            onClick={() => onClick(room)}
            onMouseEnter={(e) => onMouseEnter(e, room, {cx, cy})}
            onMouseLeave={onMouseLeave}
            className={`hover:opacity-90 ${isSelected ? 'opacity-100' : 'opacity-100'}`}
        >
            <defs>
                {/* Glow Filter for Bloom */}
                <filter id={`bloom-${room.room_id}`} x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation={pct > 75 ? "8" : "3"} result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>

                {/* Selection Highlight */}
                {isSelected && (
                    <filter id={`select-glow-${room.room_id}`} x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                )}
            </defs>

            {/* Base Room Boundary & Heat Bloom Fill */}
            {region.d ? (
                // Polygon/Path Room
                <g>
                    {/* The intense glowing fill */}
                    <path d={region.d} fill={glowBase} fillOpacity={maxOpacity * 0.4} filter={`url(#bloom-${room.room_id})`} style={{ mixBlendMode: 'screen', transition: 'fill-opacity 0.5s ease, fill 0.5s ease' }} />
                    <path d={region.d} fill={glowCore} fillOpacity={maxOpacity * 0.7} style={{ transition: 'fill-opacity 0.5s ease, fill 0.5s ease' }} />
                    {/* The architectural border */}
                    <path d={region.d} fill="none" stroke={isSelected ? '#22d3ee' : glowStroke} strokeWidth={isSelected ? "3" : "1.5"} strokeOpacity={isSelected ? "1" : "0.7"} filter={isSelected ? `url(#select-glow-${room.room_id})` : ''} />
                </g>
            ) : (
                // Rectangular Room
                <g>
                    <rect x={region.x} y={region.y} width={region.w} height={region.h} fill={glowBase} fillOpacity={maxOpacity * 0.4} filter={`url(#bloom-${room.room_id})`} style={{ mixBlendMode: 'screen', transition: 'fill-opacity 0.5s ease, fill 0.5s ease' }} />
                    <rect x={region.x} y={region.y} width={region.w} height={region.h} fill={glowCore} fillOpacity={maxOpacity * 0.7} style={{ transition: 'fill-opacity 0.5s ease, fill 0.5s ease' }} />
                    <rect x={region.x} y={region.y} width={region.w} height={region.h} fill="none" stroke={isSelected ? '#22d3ee' : glowStroke} strokeWidth={isSelected ? "3" : "1.5"} strokeOpacity={isSelected ? "1" : "0.7"} filter={isSelected ? `url(#select-glow-${room.room_id})` : ''} />
                </g>
            )}

            {/* Room Labels & Percentages */}
            {!isSmall ? (
                <>
                    {/* Label Pill */}
                    <rect x={cx - 50} y={cy - 20} width="100" height="20" rx="4" fill="#0f172a" fillOpacity="0.85" stroke={pct > 100 ? '#ef4444' : '#3b82f6'} strokeWidth="1" />
                    <text x={cx} y={cy - 6} fill="#e2e8f0" fontSize="10" fontWeight="bold" textAnchor="middle" pointerEvents="none">
                        {shortName.length > 18 ? shortName.substring(0, 16) + '..' : shortName}
                    </text>
                    
                    {/* Percentage Pill */}
                    <rect x={cx - 24} y={cy + 4} width="48" height="20" rx="4" fill="#030712" fillOpacity="0.9" stroke={pct > 100 ? '#ef4444' : '#06b6d4'} strokeWidth="1" />
                    <text x={cx} y={cy + 18} fill={pct > 100 ? '#ef4444' : '#22d3ee'} fontSize="11" fontWeight="bold" textAnchor="middle" pointerEvents="none">
                        {Math.round(pct)}%
                    </text>
                </>
            ) : (
                <>
                    {/* Compact Label for small rooms */}
                    <rect x={cx - 16} y={cy - 10} width="32" height="20" rx="4" fill="#030712" fillOpacity="0.9" stroke={pct > 100 ? '#ef4444' : '#06b6d4'} strokeWidth="1" />
                    <text x={cx} y={cy + 4} fill={pct > 100 ? '#ef4444' : '#22d3ee'} fontSize="10" fontWeight="bold" textAnchor="middle" pointerEvents="none">
                        {Math.round(pct)}%
                    </text>
                </>
            )}

            {/* Sensor Dots */}
            {pct > 0 || !hasSecurityAlert ? (
                <circle cx={region.x ? region.x + 12 : cx - 30} cy={region.y ? region.y + 12 : cy - 30} r="2.5" fill="#22d3ee" className="animate-pulse" />
            ) : (
                <circle cx={region.x ? region.x + 12 : cx - 30} cy={region.y ? region.y + 12 : cy - 30} r="2.5" fill="#ef4444" className="animate-pulse" />
            )}
            
            {/* Cross-Agent Indicators */}
            {hasSecurityAlert && (
                <g transform={`translate(${region.x ? region.x + region.w - 18 : cx + 20}, ${region.y ? region.y + 6 : cy - 35})`}>
                    <circle cx="6" cy="6" r="8" fill="#ef4444" opacity="0.9" />
                    <text x="6" y="10" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">🛡</text>
                </g>
            )}
            {hasEnergyAlert && (
                <g transform={`translate(${region.x ? region.x + region.w - 36 : cx}, ${region.y ? region.y + 6 : cy - 35})`}>
                    <circle cx="6" cy="6" r="8" fill="#eab308" opacity="0.9" />
                    <text x="6" y="10" fill="#000" fontSize="9" fontWeight="bold" textAnchor="middle">⚡</text>
                </g>
            )}
            {hasMaintenanceAlert && (
                <g transform={`translate(${region.x ? region.x + region.w - 18 : cx + 20}, ${region.y ? region.y + 6 : cy - 35})`}>
                    <circle cx="6" cy="6" r="8" fill="#f97316" opacity="0.9" />
                    <text x="6" y="10" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">🔧</text>
                </g>
            )}
        </g>
    );
};
