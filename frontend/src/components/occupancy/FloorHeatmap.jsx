import React, { useState } from 'react';

const LEVEL_COLORS = {
    Critical:   'bg-red-600 border-red-400 text-white',
    Overcrowded:'bg-orange-500 border-orange-400 text-white',
    High:       'bg-amber-500 border-amber-400 text-slate-900',
    Moderate:   'bg-yellow-400 border-yellow-300 text-slate-900',
    Normal:     'bg-emerald-600 border-emerald-400 text-white',
};

const LEVEL_DOT = {
    Critical:   'bg-red-400',
    Overcrowded:'bg-orange-400',
    High:       'bg-amber-400',
    Moderate:   'bg-yellow-300',
    Normal:     'bg-emerald-400',
};

export const FloorHeatmap = ({ rooms = [], onRoomClick }) => {
    const [tooltip, setTooltip] = useState(null);

    // Group by floor
    const floors = [...new Set(rooms.map(r => r.floor))].sort();
    const [activeFloor, setActiveFloor] = useState(floors[0] ?? 1);
    const floorRooms = rooms.filter(r => r.floor === activeFloor);

    return (
        <div>
            {/* Floor tabs */}
            <div className='flex gap-2 mb-4'>
                {floors.map(f => (
                    <button key={f}
                        onClick={() => setActiveFloor(f)}
                        className={`px-4 py-1.5 rounded text-sm font-medium transition-colors border ${activeFloor === f ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-emerald-500/30'}`}
                    >Floor {f}</button>
                ))}
            </div>

            {/* Legend */}
            <div className='flex gap-4 mb-4 flex-wrap'>
                {Object.entries(LEVEL_DOT).map(([level, dot]) => (
                    <div key={level} className='flex items-center gap-1.5 text-xs text-slate-400'>
                        <span className={`w-2.5 h-2.5 rounded-full ${dot}`} />
                        {level === 'Normal' ? '< 60%' : level === 'Moderate' ? '60-80%' : level === 'High' ? '80-95%' : level === 'Overcrowded' ? '95-100%' : '> 100%'}
                        <span className='text-slate-500'>({level})</span>
                    </div>
                ))}
            </div>

            {/* Room grid */}
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'>
                {floorRooms.map(room => (
                    <div
                        key={room.room_id}
                        onClick={() => onRoomClick && onRoomClick(room)}
                        onMouseEnter={() => setTooltip(room.room_id)}
                        onMouseLeave={() => setTooltip(null)}
                        className={`relative rounded-lg border p-3 cursor-pointer transition-all hover:scale-105 hover:shadow-lg ${LEVEL_COLORS[room.level] || LEVEL_COLORS.Normal}`}
                    >
                        <div className='text-xs font-semibold truncate mb-1'>{room.room_name}</div>
                        <div className='text-2xl font-bold'>{room.occupancy_pct}%</div>
                        <div className='text-xs opacity-80 mt-0.5'>{room.people_count} / {room.capacity} people</div>
                        <div className='text-xs opacity-70 mt-0.5'>{room.room_type}</div>
                        {/* Tooltip */}
                        {tooltip === room.room_id && (
                            <div className='absolute bottom-full left-0 mb-2 z-10 bg-slate-900 border border-slate-600 rounded-lg p-3 text-xs text-slate-200 shadow-xl w-48 pointer-events-none'>
                                <div className='font-semibold mb-1'>{room.room_name}</div>
                                <div>Occupancy: <strong>{room.occupancy_pct}%</strong></div>
                                <div>People: <strong>{room.people_count} / {room.capacity}</strong></div>
                                <div>Status: <strong>{room.level}</strong></div>
                                <div>Zone: {room.zone}</div>
                            </div>
                        )}
                    </div>
                ))}
                {floorRooms.length === 0 && (
                    <div className='col-span-4 py-8 text-center text-slate-500 text-sm'>No rooms on Floor {activeFloor}</div>
                )}
            </div>
        </div>
    );
};
