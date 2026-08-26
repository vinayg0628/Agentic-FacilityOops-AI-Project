import React, { useEffect, useMemo, useState } from 'react';
import { Activity, AlertCircle, RefreshCw } from 'lucide-react';
import { GlassCard } from '../../components/cards/GlassCard';
import { useFacility } from '../../context/FacilityContext';
import { fetchFloorHeatmap } from '../../services/occupancyService';

const levelStyles = {
    Low: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
    Moderate: 'bg-amber-500/25 border-amber-500/40 text-amber-300',
    High: 'bg-orange-500/30 border-orange-500/50 text-orange-300',
    Critical: 'bg-red-500/35 border-red-500/50 text-red-300',
};

export const OccupancyHeatmapPage = () => {
    const { facilities, selectedFacilityId } = useFacility();
    const [facilityId, setFacilityId] = useState(selectedFacilityId === 'ALL' ? '' : selectedFacilityId);
    const [floor, setFloor] = useState('all');
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const availableFacilityId = facilityId || facilities[0]?.facility_id || 'FAC-001';
    const floors = useMemo(() => [...new Set(rooms.map((room) => room.floor))].sort((a, b) => a - b), [rooms]);
    const visibleRooms = floor === 'all' ? rooms : rooms.filter((room) => String(room.floor) === floor);

    const loadHeatmap = async () => {
        setLoading(true);
        setError(null);
        try {
            setRooms(await fetchFloorHeatmap(availableFacilityId, floor === 'all' ? null : Number(floor)));
        } catch (err) {
            setError('Failed to load the occupancy heatmap.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedFacilityId !== 'ALL') setFacilityId(selectedFacilityId);
    }, [selectedFacilityId]);

    useEffect(() => {
        loadHeatmap();
    }, [availableFacilityId, floor]);

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2"><Activity className="w-6 h-6 text-emerald-400" />Occupancy Heatmap</h1>
                    <p className="text-slate-400 text-sm mt-1">Room-level utilization by facility and floor</p>
                </div>
                <div className="flex items-center gap-2">
                    <select value={facilityId} onChange={(event) => setFacilityId(event.target.value)} className="bg-slate-900 text-slate-200 border border-slate-700 rounded-lg px-3 py-2 text-xs">
                        {facilities.length === 0 && <option value="">Loading facilities...</option>}
                        {facilities.map((facility) => <option key={facility.facility_id} value={facility.facility_id}>{facility.facility_name}</option>)}
                    </select>
                    <select value={floor} onChange={(event) => setFloor(event.target.value)} className="bg-slate-900 text-slate-200 border border-slate-700 rounded-lg px-3 py-2 text-xs">
                        <option value="all">All floors</option>
                        {floors.map((value) => <option key={value} value={value}>Floor {value}</option>)}
                    </select>
                    <button onClick={loadHeatmap} className="p-2 text-slate-400 hover:text-emerald-400" title="Refresh heatmap"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
                </div>
            </div>

            {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 flex items-center gap-3"><AlertCircle className="w-5 h-5" />{error}<button onClick={loadHeatmap} className="ml-auto underline">Retry</button></div>}

            <GlassCard title={`${visibleRooms.length} Rooms - ${availableFacilityId}`} subtitle="Occupancy intensity is based on the latest reading for each room">
                {loading ? <div className="h-64 flex items-center justify-center text-slate-400"><RefreshCw className="w-5 h-5 animate-spin mr-2" />Loading heatmap...</div> : visibleRooms.length === 0 ? <div className="h-64 flex items-center justify-center text-slate-500">No occupancy readings found.</div> : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {visibleRooms.map((room) => (
                            <div key={room.room_id} className={`min-h-28 rounded-xl border p-3 ${levelStyles[room.level] || levelStyles.Low}`}>
                                <div className="flex items-start justify-between gap-2"><span className="text-xs font-bold truncate" title={room.room_name}>{room.room_name}</span><span className="text-xs font-mono">{Math.round(room.occupancy_pct)}%</span></div>
                                <div className="mt-4 h-2 rounded-full bg-black/20"><div className="h-2 rounded-full bg-current opacity-80" style={{ width: `${Math.min(100, room.occupancy_pct)}%` }} /></div>
                                <div className="mt-2 flex justify-between text-[11px] opacity-80"><span>{room.level}</span><span>{room.people_count}/{room.capacity} people</span></div>
                            </div>
                        ))}
                    </div>
                )}
            </GlassCard>
        </div>
    );
};