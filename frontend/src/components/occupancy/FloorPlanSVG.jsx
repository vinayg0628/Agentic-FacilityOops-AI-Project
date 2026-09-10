import React, { useState, useRef } from 'react';
import { FloorPlanRoom } from './FloorPlanRoom';

// Custom architectural layouts for different floors filling a 1000x640 canvas
const floorLayouts = {
    1: [
        { id: 0, d: "M 20 20 L 370 20 L 370 180 L 20 180 Z", cx: 195, cy: 100 }, // Top Left Workspace
        { id: 1, d: "M 390 20 L 640 20 L 640 230 L 390 230 Z", cx: 515, cy: 125 }, // Top Mid Conference
        { id: 2, d: "M 660 20 L 980 20 L 980 230 L 660 230 Z", cx: 820, cy: 125 }, // Top Right Cafeteria
        { id: 3, d: "M 20 200 L 370 200 L 370 390 L 20 390 Z", cx: 195, cy: 295 }, // Mid Left Server/Data
        { id: 4, d: "M 660 250 L 800 250 L 800 390 L 660 390 Z", cx: 730, cy: 320 }, // Mid Right Meeting 1
        { id: 5, d: "M 820 250 L 980 250 L 980 390 L 820 390 Z", cx: 900, cy: 320 }, // Mid Right Storage
        { id: 6, d: "M 20 410 L 250 410 L 250 620 L 20 620 Z", cx: 135, cy: 515 }, // Bottom Left Workspace
        { id: 7, d: "M 270 410 L 460 410 L 460 620 L 270 620 Z", cx: 365, cy: 515 }, // Bottom Common Area
        { id: 8, d: "M 480 410 L 750 410 L 750 620 L 480 620 Z", cx: 615, cy: 515 }, // Bottom Laboratory
        { id: 9, d: "M 770 410 L 980 410 L 980 620 L 770 620 Z", cx: 875, cy: 515 }, // Bottom Meeting 2
    ],
    2: [
        { id: 0, d: "M 20 20 L 480 20 L 480 300 L 20 300 Z", cx: 250, cy: 160 }, // Huge Open Workspace Left
        { id: 1, d: "M 500 20 L 980 20 L 980 150 L 500 150 Z", cx: 740, cy: 85 },  // Top Right Exec Suites
        { id: 2, d: "M 500 170 L 730 170 L 730 300 L 500 300 Z", cx: 615, cy: 235 }, // Mid Right Meeting
        { id: 3, d: "M 750 170 L 980 170 L 980 300 L 750 300 Z", cx: 865, cy: 235 }, // Mid Right Lounge
        { id: 4, d: "M 20 320 L 240 320 L 240 460 L 20 460 Z", cx: 130, cy: 390 }, // Bottom Left Pods
        { id: 5, d: "M 20 480 L 240 480 L 240 620 L 20 620 Z", cx: 130, cy: 550 }, // Bottom Left Pods 2
        { id: 6, d: "M 260 440 L 480 440 L 480 620 L 260 620 Z", cx: 370, cy: 530 }, // Bottom Left Breakout
        { id: 7, d: "M 750 320 L 980 320 L 980 460 L 750 460 Z", cx: 865, cy: 390 }, // Bottom Right Lab 1
        { id: 8, d: "M 750 480 L 980 480 L 980 620 L 750 620 Z", cx: 865, cy: 550 }, // Bottom Right Lab 2
        { id: 9, d: "M 500 440 L 730 440 L 730 620 L 500 620 Z", cx: 615, cy: 530 }, // Bottom Right Storage
    ],
    3: [
        { id: 0, d: "M 20 20 L 200 20 L 200 620 L 20 620 Z", cx: 110, cy: 320 }, // Massive Left Corridor Wing
        { id: 1, d: "M 220 20 L 480 20 L 480 200 L 220 200 Z", cx: 350, cy: 110 }, // Top Mid Wing
        { id: 2, d: "M 500 20 L 760 20 L 760 200 L 500 200 Z", cx: 630, cy: 110 }, // Top Right Mid
        { id: 3, d: "M 780 20 L 980 20 L 980 300 L 780 300 Z", cx: 880, cy: 160 }, // Top Right Deep
        { id: 4, d: "M 220 440 L 480 440 L 480 620 L 220 620 Z", cx: 350, cy: 530 }, // Bottom Mid Wing
        { id: 5, d: "M 500 440 L 760 440 L 760 620 L 500 620 Z", cx: 630, cy: 530 }, // Bottom Right Mid
        { id: 6, d: "M 780 320 L 980 320 L 980 620 L 780 620 Z", cx: 880, cy: 470 }, // Bottom Right Deep
        { id: 7, d: "M 220 220 L 340 220 L 340 420 L 220 420 Z", cx: 280, cy: 320 }, // Central small 1
        { id: 8, d: "M 640 220 L 760 220 L 760 420 L 640 420 Z", cx: 700, cy: 320 }, // Central small 2
    ]
};

export const FloorPlanSVG = ({ rooms = [], activeFloor, selectedRoomId, onRoomClick }) => {
    const svgRef = useRef(null);
    const [tooltipData, setTooltipData] = useState(null);

    const floorRooms = rooms.filter(r => r.floor === activeFloor);
    // Fallback to layout 1 if floor layout doesn't exist
    const layoutConfig = floorLayouts[activeFloor] || floorLayouts[1];

    const handleMouseEnter = (e, room, center) => {
        if (!svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();
        
        // Scale to viewbox
        const scaleX = rect.width / 1000;
        const scaleY = rect.height / 640;

        setTooltipData({
            x: center.cx * scaleX,
            y: center.cy * scaleY,
            room
        });
    };

    const handleMouseLeave = () => setTooltipData(null);

    return (
        <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 shadow-[0_0_40px_rgba(0,0,0,0.9)] bg-[#020617]" onMouseLeave={handleMouseLeave}>
            <style>{`
                .blueprint-wall { stroke: #1d4ed8; stroke-width: 4; fill: none; filter: drop-shadow(0 0 6px rgba(29, 78, 216, 0.5)); }
                .blueprint-core { fill: #0f172a; stroke: #334155; stroke-width: 2; }
                .blueprint-door { stroke: #06b6d4; stroke-width: 3; fill: none; }
            `}</style>
            
            {/* Real-time Hover Tooltip overlay */}
            {tooltipData && (
                <div 
                    className="absolute z-50 pointer-events-none bg-slate-900/95 backdrop-blur border border-cyan-700/50 rounded-lg p-3 text-xs text-slate-200 shadow-2xl w-60 transform -translate-x-1/2 -translate-y-full"
                    style={{ left: tooltipData.x, top: tooltipData.y - 15 }}
                >
                    <div className='font-bold text-slate-50 mb-1 border-b border-slate-700 pb-2 flex justify-between'>
                        <span>{tooltipData.room.room_name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">ID: {tooltipData.room.room_id}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-y-2 gap-x-1 mt-2">
                        <div className="text-slate-400">Occupancy:</div>
                        <div className={`font-bold text-right ${tooltipData.room.occupancy_pct > 100 ? 'text-red-400' : 'text-cyan-400'}`}>
                            {Math.round(tooltipData.room.occupancy_pct)}%
                        </div>
                        
                        <div className="text-slate-400">People:</div>
                        <div className="text-right font-mono">{tooltipData.room.people_count} / {tooltipData.room.capacity}</div>
                        
                        <div className="text-slate-400">Status:</div>
                        <div className="text-right font-bold text-emerald-400">{tooltipData.room.level}</div>
                        
                        <div className="text-slate-400">Zone:</div>
                        <div className="text-right text-slate-300 truncate">{tooltipData.room.zone}</div>
                    </div>
                </div>
            )}

            <svg ref={svgRef} viewBox="0 0 1000 640" className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
                <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e3a8a" strokeOpacity="0.1" strokeWidth="1"/>
                    </pattern>
                    <pattern id="grid-large" width="100" height="100" patternUnits="userSpaceOnUse">
                        <rect width="100" height="100" fill="url(#grid)" />
                        <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#1e3a8a" strokeOpacity="0.25" strokeWidth="1"/>
                    </pattern>
                </defs>

                {/* Canvas Background Grid */}
                <rect width="100%" height="100%" fill="url(#grid-large)" />

                {/* Static Outer Boundaries & Corridors */}
                <rect x="10" y="10" width="980" height="620" className="blueprint-wall" />
                
                {/* Central Elevator & Stair Core (Realistic architecture empty space filler) */}
                {(activeFloor === 1 || activeFloor === 2) && (
                    <g transform="translate(390, 250)">
                        <rect x="0" y="0" width="250" height="140" className="blueprint-core" />
                        <text x="125" y="60" fill="#475569" fontSize="14" fontWeight="bold" textAnchor="middle" stroke="none" className="tracking-widest">ELEVATOR CORE</text>
                        <text x="125" y="85" fill="#475569" fontSize="11" textAnchor="middle" stroke="none">STAIRS & SERVICES</text>
                        {/* Elevator shafts */}
                        <path d="M 0 0 L 0 140 M 40 0 L 40 140 M 80 0 L 80 140 M 170 0 L 170 140 M 210 0 L 210 140" stroke="#334155" strokeWidth="2" />
                    </g>
                )}
                {activeFloor === 3 && (
                    <g transform="translate(360, 220)">
                        <rect x="0" y="0" width="260" height="200" className="blueprint-core" />
                        <text x="130" y="90" fill="#475569" fontSize="14" fontWeight="bold" textAnchor="middle" stroke="none" className="tracking-widest">CENTRAL ATRIUM</text>
                        <text x="130" y="115" fill="#475569" fontSize="11" textAnchor="middle" stroke="none">OPEN TO BELOW</text>
                    </g>
                )}

                {/* Render the Rooms assigned to the Floor Layout */}
                {floorRooms.length === 0 ? (
                    <text x="500" y="320" fill="#64748b" fontSize="20" textAnchor="middle">No occupancy zones configured for Level {activeFloor}.</text>
                ) : (
                    floorRooms.map((room, i) => {
                        const region = layoutConfig[i % layoutConfig.length]; // fallback loop
                        if (!region) return null;
                        
                        return (
                            <FloorPlanRoom 
                                key={room.room_id} 
                                room={room} 
                                region={region}
                                onClick={onRoomClick}
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                                isSelected={selectedRoomId === room.room_id}
                            />
                        );
                    })
                )}
                
                {/* Embedded Top-Right Clean Legend */}
                <g transform="translate(860, 30)">
                    <rect x="-10" y="-15" width="130" height="110" fill="#0f172a" fillOpacity="0.85" rx="6" stroke="#334155" />
                    
                    <rect x="0" y="0" width="12" height="12" fill="#7dd3fc" />
                    <text x="20" y="10" fill="#cbd5e1" fontSize="10">LOW (0–25%)</text>

                    <rect x="0" y="18" width="12" height="12" fill="#38bdf8" />
                    <text x="20" y="28" fill="#cbd5e1" fontSize="10">MODERATE (26–50%)</text>
                    
                    <rect x="0" y="36" width="12" height="12" fill="#0ea5e9" />
                    <text x="20" y="46" fill="#cbd5e1" fontSize="10">HIGH (51–75%)</text>
                    
                    <rect x="0" y="54" width="12" height="12" fill="#06b6d4" />
                    <text x="20" y="64" fill="#cbd5e1" fontSize="10">VERY HIGH (76-100%)</text>
                    
                    <rect x="0" y="72" width="12" height="12" fill="#ef4444" />
                    <text x="20" y="82" fill="#cbd5e1" fontSize="10">OVER CAP (&gt;100%)</text>
                </g>
            </svg>
        </div>
    );
};
