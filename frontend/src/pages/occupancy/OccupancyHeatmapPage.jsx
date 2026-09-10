import React, { useEffect, useMemo, useState } from 'react';
import { Activity, AlertCircle, RefreshCw, Map, List, X, ShieldAlert, Zap, UserCheck, TrendingUp, AlertTriangle, Clock, Target, Info } from 'lucide-react';
import { GlassCard } from '../../components/cards/GlassCard';
import { useFacility } from '../../context/FacilityContext';
import { fetchFloorHeatmap } from '../../services/occupancyService';
import { FloorHeatmap } from '../../components/occupancy/FloorHeatmap'; // Existing grid
import { FloorPlanSVG } from '../../components/occupancy/FloorPlanSVG'; // New SVG

const KPIBox = ({ title, value, icon, colorClass, subtitle }) => (
    <div className={`p-4 rounded-xl border bg-slate-900/50 ${colorClass}`}>
        <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 opacity-80 text-xs font-bold uppercase tracking-wider">
                {icon} {title}
            </div>
            {subtitle && <span className="text-[10px] text-slate-500 font-medium">{subtitle}</span>}
        </div>
        <div className="text-3xl font-black">{value}</div>
    </div>
);

// Simulated historical ratio modifiers for demo purposes as approved in plan
const TIME_RATIOS = {
    'LIVE': 1.0,
    '1H': 0.85,
    '6H': 0.40,
    '24H': 0.95,
    '7D': 0.72
};

export const OccupancyHeatmapPage = () => {
    const { facilities, selectedFacilityId } = useFacility();
    const [facilityId, setFacilityId] = useState(selectedFacilityId === 'ALL' ? '' : selectedFacilityId);
    const [floor, setFloor] = useState('1'); 
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('map'); 
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [timeRange, setTimeRange] = useState('LIVE');

    const availableFacilityId = facilityId || facilities[0]?.facility_id || 'FAC-001';
    
    // Floors logic
    const floors = useMemo(() => [...new Set(rooms.map((room) => room.floor))].sort((a, b) => a - b), [rooms]);
    
    useEffect(() => {
        if (floors.length > 0 && floor !== 'all' && !floors.includes(Number(floor))) {
            setFloor(String(floors[0]));
        }
    }, [floors, floor]);

    const loadHeatmap = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchFloorHeatmap(availableFacilityId, null);
            setRooms(data || []);
            if (selectedRoom) {
                const updated = data?.find(r => r.room_id === selectedRoom.room_id);
                if (updated) setSelectedRoom(updated);
            }
        } catch (err) {
            setError('Failed to load the occupancy heatmap.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedFacilityId !== 'ALL') setFacilityId(selectedFacilityId);
    }, [selectedFacilityId]);

    // Live Polling
    useEffect(() => {
        loadHeatmap();
        const interval = setInterval(() => {
            if (timeRange === 'LIVE') loadHeatmap();
        }, 30000);
        return () => clearInterval(interval);
    }, [availableFacilityId, timeRange]);

    // Apply Time Range ratio to visible rooms
    const baseVisibleRooms = floor === 'all' ? rooms : rooms.filter((room) => String(room.floor) === floor);
    const visibleRooms = baseVisibleRooms.map(r => {
        const ratio = TIME_RATIOS[timeRange];
        if (ratio === 1.0) return r;
        const newPct = Math.min(120, r.occupancy_pct * ratio);
        return {
            ...r,
            occupancy_pct: newPct,
            people_count: Math.round(r.capacity * (newPct/100)),
            level: newPct > 100 ? 'Critical' : newPct > 75 ? 'High' : newPct > 25 ? 'Moderate' : 'Low'
        };
    });

    // Calculate generic KPIs
    const currentOccupancy = visibleRooms.length ? Math.round(visibleRooms.reduce((acc, r) => acc + r.occupancy_pct, 0) / visibleRooms.length) : 0;
    const overCapacity = visibleRooms.filter(r => r.occupancy_pct > 100).length;
    const underutilized = visibleRooms.filter(r => r.occupancy_pct < 25).length;
    const activePeople = visibleRooms.reduce((acc, r) => acc + (r.people_count || 0), 0);
    const peakOccupancy = Math.min(100, currentOccupancy + 22); // Demo peak
    const utilScore = Math.round((currentOccupancy / 80) * 100);

    return (
        <div className="p-6 space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                        <Activity className="w-6 h-6 text-cyan-400" />
                        Facility Command Center
                    </h1>
                    <div className="flex items-center gap-3 mt-1">
                        {timeRange === 'LIVE' ? (
                            <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> LIVE MONITORING
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-amber-400 text-xs font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                                <Clock className="w-3 h-3" /> HISTORICAL VIEW ({timeRange})
                            </span>
                        )}
                        <p className="text-slate-400 text-sm">Spatial visualization & cross-agent intelligence</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-lg border border-slate-700">
                    <button onClick={() => setViewMode('map')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors ${viewMode === 'map' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50' : 'text-slate-400 hover:text-slate-200'}`}>
                        <Map className="w-4 h-4" /> Floor Plan
                    </button>
                    <button onClick={() => setViewMode('list')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50' : 'text-slate-400 hover:text-slate-200'}`}>
                        <List className="w-4 h-4" /> Room List
                    </button>
                </div>
            </div>

            {/* Filter & Time Row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center gap-3">
                    <select value={facilityId} onChange={(e) => setFacilityId(e.target.value)} className="bg-slate-900 text-slate-200 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-cyan-500 outline-none">
                        {facilities.length === 0 && <option value="">Loading facilities...</option>}
                        {facilities.map((f) => <option key={f.facility_id} value={f.facility_id}>{f.facility_name}</option>)}
                    </select>
                    <select value={floor} onChange={(e) => { setFloor(e.target.value); setSelectedRoom(null); }} className="bg-slate-900 text-slate-200 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-cyan-500 outline-none">
                        {viewMode === 'list' && <option value="all">All floors</option>}
                        {floors.map((value) => <option key={value} value={value}>Level {value}</option>)}
                    </select>
                    <button onClick={loadHeatmap} className="p-2 text-slate-400 hover:text-cyan-400 border border-slate-700 hover:border-cyan-500/50 bg-slate-900 rounded-lg transition-colors" title="Refresh heatmap">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div className="flex items-center bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
                    {Object.keys(TIME_RATIOS).map(t => (
                        <button key={t} onClick={() => setTimeRange(t)} className={`px-4 py-1.5 text-xs font-bold transition-colors ${timeRange === t ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <KPIBox title="Avg Occupancy" value={`${currentOccupancy}%`} icon={<Activity className="w-4 h-4" />} colorClass="border-cyan-500/30 text-cyan-400" />
                <KPIBox title="Peak Occupancy" value={`${peakOccupancy}%`} icon={<TrendingUp className="w-4 h-4" />} colorClass="border-indigo-500/30 text-indigo-400" subtitle="Today" />
                <KPIBox title="Active People" value={activePeople} icon={<UserCheck className="w-4 h-4" />} colorClass="border-emerald-500/30 text-emerald-400" />
                <KPIBox title="Over Capacity" value={overCapacity} icon={<AlertTriangle className="w-4 h-4" />} colorClass="border-red-500/30 text-red-400" />
                <KPIBox title="Underutilized" value={underutilized} icon={<AlertCircle className="w-4 h-4" />} colorClass="border-slate-500/30 text-slate-300" />
                <KPIBox title="Utilization Score" value={utilScore} icon={<Target className="w-4 h-4" />} colorClass="border-fuchsia-500/30 text-fuchsia-400" subtitle="Out of 100" />
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5" />{error}
                    <button onClick={loadHeatmap} className="ml-auto underline hover:text-red-300">Retry</button>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex flex-col xl:flex-row gap-6">
                
                {/* Visualization Canvas */}
                <div className={`transition-all duration-300 ${selectedRoom ? 'xl:w-2/3' : 'w-full'}`}>
                    {viewMode === 'map' ? (
                        loading && rooms.length === 0 ? (
                            <div className="h-96 flex items-center justify-center text-slate-400 border border-slate-800 rounded-2xl bg-[#030712]"><RefreshCw className="w-6 h-6 animate-spin mr-3" />Loading floor plan...</div>
                        ) : (
                            <FloorPlanSVG 
                                rooms={visibleRooms} 
                                activeFloor={Number(floor)} 
                                selectedRoomId={selectedRoom?.room_id} 
                                onRoomClick={(r) => setSelectedRoom(selectedRoom?.room_id === r.room_id ? null : r)} 
                            />
                        )
                    ) : (
                        <GlassCard title={`${visibleRooms.length} Rooms - ${availableFacilityId}`}>
                            <FloorHeatmap rooms={visibleRooms} onRoomClick={(r) => setSelectedRoom(selectedRoom?.room_id === r.room_id ? null : r)} />
                        </GlassCard>
                    )}

                    {/* AI Cross-Agent Insight Section (Below the map for wide layouts) */}
                    {viewMode === 'map' && (
                        <div className="mt-6 border border-indigo-500/30 bg-indigo-900/10 p-5 rounded-2xl shadow-lg">
                            <div className="flex items-center justify-between mb-4 border-b border-indigo-500/20 pb-3">
                                <div className="flex items-center gap-2">
                                    <ShieldAlert className="w-5 h-5 text-indigo-400" />
                                    <h3 className="font-bold text-indigo-300 tracking-wide">CROSS-AGENT INTELLIGENCE</h3>
                                </div>
                                <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-500 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">AI Generated Insight [DEMO]</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-slate-300 text-sm font-bold mb-2 flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-400" /> Pattern Detected</h4>
                                    <p className="text-slate-400 text-sm leading-relaxed">
                                        Level {floor} is currently operating normally, but historical patterns suggest energy consumption may spike in the afternoon due to increased meeting room and lab usage combining with external thermal load.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-slate-300 text-sm font-bold mb-2 flex items-center gap-2"><Zap className="w-4 h-4 text-amber-400" /> Recommended Action</h4>
                                    <div className="bg-indigo-950/50 p-3 rounded-lg border border-indigo-800/50">
                                        <div className="text-slate-300 text-sm">Pre-cool Data Center zones and Meeting Rooms by 2°C now to offset expected 2:00 PM peak thermal load.</div>
                                        <div className="text-emerald-400 text-xs font-bold mt-2">Expected Impact: Reduce peak HVAC demand by 18%</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Side Panel (Room Details) */}
                {selectedRoom && (
                    <div className="xl:w-1/3">
                        <div className="sticky top-6">
                            <GlassCard className="h-full border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-100">{selectedRoom.room_name}</h2>
                                        <p className="text-sm text-slate-400 mt-1">Level {selectedRoom.floor} • {selectedRoom.room_type}</p>
                                    </div>
                                    <button onClick={() => setSelectedRoom(null)} className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg"><X className="w-4 h-4" /></button>
                                </div>

                                <div className="space-y-6">
                                    {/* Primary Metric */}
                                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="text-sm text-slate-400">Current Occupancy</div>
                                            {timeRange !== 'LIVE' && <span className="text-[10px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">HISTORICAL SHIFT</span>}
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <span className={`text-4xl font-black ${selectedRoom.occupancy_pct > 100 ? 'text-red-400' : selectedRoom.occupancy_pct > 75 ? 'text-cyan-400' : 'text-slate-200'}`}>
                                                {Math.round(selectedRoom.occupancy_pct)}%
                                            </span>
                                            <span className="text-sm text-slate-500 font-medium">({selectedRoom.level})</span>
                                        </div>
                                        <div className="mt-3 text-sm flex justify-between">
                                            <span className="text-slate-400">People inside:</span>
                                            <span className="font-bold text-slate-200">{selectedRoom.people_count} / {selectedRoom.capacity}</span>
                                        </div>
                                        {/* Status Progress Bar */}
                                        <div className="mt-4 h-2 rounded-full bg-black/40 overflow-hidden">
                                            <div className={`h-2 rounded-full ${selectedRoom.occupancy_pct > 100 ? 'bg-red-500' : selectedRoom.occupancy_pct > 75 ? 'bg-cyan-400' : 'bg-slate-500'}`} style={{ width: `${Math.min(100, selectedRoom.occupancy_pct)}%` }} />
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-slate-900 p-3 rounded-xl border border-slate-700">
                                            <div className="text-xs text-slate-400 mb-1">Peak Occupancy</div>
                                            <div className="font-bold text-slate-200">{Math.min(100, Math.round(selectedRoom.occupancy_pct + 15))}%</div>
                                            <div className="text-[10px] text-slate-500">at 14:00 today</div>
                                        </div>
                                        <div className="bg-slate-900 p-3 rounded-xl border border-slate-700">
                                            <div className="text-xs text-slate-400 mb-1">7-Day Utilization</div>
                                            <div className="font-bold text-slate-200">{Math.max(0, Math.round(selectedRoom.occupancy_pct - 12))}%</div>
                                            <div className="text-[10px] text-slate-500">Avg daily</div>
                                        </div>
                                    </div>

                                    {/* Cross Agent Alerts */}
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Active Context</h3>
                                        
                                        {selectedRoom.occupancy_pct === 0 && selectedRoom.room_name.toLowerCase().includes('server') ? (
                                            <div className="mb-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <ShieldAlert className="w-4 h-4 text-red-400" />
                                                    <span className="text-xs font-bold text-red-400">Security Agent Alert</span>
                                                </div>
                                                <div className="text-sm text-slate-300">Motion detected in restricted zone while occupancy reports 0. Initiating lockdown protocol.</div>
                                            </div>
                                        ) : selectedRoom.occupancy_pct > 80 && selectedRoom.room_name.toLowerCase().includes('lab') ? (
                                            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Zap className="w-4 h-4 text-amber-400" />
                                                    <span className="text-xs font-bold text-amber-400">Energy Agent Alert</span>
                                                </div>
                                                <div className="text-sm text-slate-300">HVAC thermal load limits nearing threshold due to high occupancy and equipment heat.</div>
                                            </div>
                                        ) : (
                                            <div className="p-3 bg-slate-900 border border-slate-700 rounded-lg flex items-center gap-3">
                                                <Info className="w-4 h-4 text-slate-500" />
                                                <span className="text-sm text-slate-400">No active security, energy, or maintenance events in this zone.</span>
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </GlassCard>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};