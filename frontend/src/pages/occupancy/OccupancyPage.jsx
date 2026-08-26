import React, { useState, useEffect, useCallback } from 'react';
import { GlassCard } from '../../components/cards/GlassCard';
import { MetricCard } from '../../components/cards/MetricCard';
import { FloorHeatmap } from '../../components/occupancy/FloorHeatmap';
import { HeatmapMatrix } from '../../components/occupancy/HeatmapMatrix';
import { ForecastChart } from '../../components/occupancy/ForecastChart';
import { UtilizationBar } from '../../components/occupancy/UtilizationBar';
import {
    fetchLiveOccupancy,
    fetchHeatmapMatrix,
    fetchMLForecast,
    fetchUtilizationReport,
    fetchActiveAlerts,
    fetchRecommendations,
} from '../../services/occupancyService';
import { Activity, RefreshCw, AlertTriangle, Users, TrendingUp, Lightbulb } from 'lucide-react';

const FACILITY_OPTIONS = ['FAC-001', 'FAC-002', 'FAC-003', 'FAC-004', 'FAC-005'];

export const OccupancyPage = () => {
    const [facilityId, setFacilityId]     = useState('FAC-001');
    const [live, setLive]                 = useState(null);
    const [matrix, setMatrix]             = useState([]);
    const [forecast, setForecast]         = useState(null);
    const [forecastLoading, setForecastLoading] = useState(true);
    const [utilization, setUtil]          = useState([]);
    const [alerts, setAlerts]             = useState([]);
    const [recs, setRecs]                 = useState([]);
    const [loading, setLoading]           = useState(true);
    const [lastUpdated, setLastUpdated]   = useState(null);

    // Load ML forecast separately — RandomForest trains ~30-40s on first call after restart
    const loadForecast = useCallback(async (fid) => {
        setForecastLoading(true);
        const fcData = await fetchMLForecast(fid, 24);
        if (fcData) setForecast(fcData);
        setForecastLoading(false);
    }, []);

    const loadAll = useCallback(async () => {
        setLoading(true);
        // Fast endpoints — respond in ~2s
        const [liveData, matData, utilData, alertData, recData] = await Promise.all([
            fetchLiveOccupancy(facilityId),
            fetchHeatmapMatrix(facilityId, 7),
            fetchUtilizationReport(facilityId, 7),
            fetchActiveAlerts(facilityId),
            fetchRecommendations(facilityId),
        ]);
        if (liveData)  setLive(liveData);
        if (matData)   setMatrix(matData);
        if (utilData)  setUtil(utilData);
        if (alertData) setAlerts(alertData);
        if (recData)   setRecs(recData);
        setLastUpdated(new Date());
        setLoading(false);
        // Slow: ML forecast — runs in background, card shows spinner until ready
        loadForecast(facilityId);
    }, [facilityId, loadForecast]);

    useEffect(() => {
        loadAll();
        const iv = setInterval(loadAll, 30000);
        return () => clearInterval(iv);
    }, [loadAll]);

    const rooms = live?.rooms ?? [];
    const totalPeople   = live?.total_people   ?? 0;
    const totalCapacity = live?.total_capacity ?? 0;
    const avgPct        = live?.avg_pct        ?? 0;
    const activeAlerts  = live?.active_alerts  ?? 0;
    const overcrowded   = rooms.filter(r => r.status === 'Critical' || r.status === 'Overcrowded').length;
    const underutilized = rooms.filter(r => r.occupancy_rate < 0.20).length;
    const nextHrPct     = forecast?.forecast?.[0]?.predicted_occupancy_pct ?? null;
    const effScore      = Math.max(0, Math.round(100 - underutilized * 10 - overcrowded * 5));

    return (
        <div className='p-6 space-y-6'>
            {/* ── Header ── */}
            <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
                <div>
                    <h1 className='text-2xl font-bold text-slate-100 flex items-center gap-2'>
                        <Activity className='w-6 h-6 text-emerald-400' />Occupancy Intelligence
                    </h1>
                    <p className='text-slate-400 text-sm mt-1'>
                        Live monitoring · Space utilization · ML-powered forecasting
                        {lastUpdated && <span className='ml-2 text-slate-600'>· Updated {lastUpdated.toLocaleTimeString()}</span>}
                    </p>
                </div>
                <div className='flex items-center gap-3'>
                    <select value={facilityId} onChange={e => setFacilityId(e.target.value)}
                        className='bg-slate-800 border border-slate-700 rounded-lg text-slate-200 px-3 py-2 text-sm'>
                        {FACILITY_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                    <button onClick={loadAll} className='flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-emerald-400 text-sm transition-colors'>
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />Refresh
                    </button>
                </div>
            </div>

            {/* ── KPI Row ── */}
            <div className='grid grid-cols-2 md:grid-cols-6 gap-4'>
                <MetricCard label='Live Occupancy' value={`${avgPct}%`}
                    status={avgPct >= 95 ? 'critical' : avgPct >= 80 ? 'warning' : 'normal'}
                    badgeText={`${totalPeople}/${totalCapacity}`} />
                <MetricCard label='Active Rooms' value={rooms.length}
                    status='normal' badgeText='total' />
                <MetricCard label='Overcrowded' value={overcrowded}
                    status={overcrowded > 0 ? 'critical' : 'normal'}
                    badgeText='rooms' />
                <MetricCard label='Underutilized' value={underutilized}
                    status={underutilized > 3 ? 'warning' : 'normal'}
                    badgeText='rooms' />
                <MetricCard label='Next Hour Forecast'
                    value={nextHrPct !== null ? `${nextHrPct}%` : '—'}
                    status={nextHrPct >= 85 ? 'warning' : 'normal'}
                    badgeText='ML' />
                <MetricCard label='Efficiency Score' value={effScore}
                    status={effScore < 60 ? 'critical' : effScore < 80 ? 'warning' : 'normal'}
                    badgeText='/ 100' />
            </div>

            {/* ── Active Alerts Banner ── */}
            {activeAlerts > 0 && (
                <div className='flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm'>
                    <AlertTriangle className='w-5 h-5 flex-shrink-0' />
                    <strong>{activeAlerts} overcrowding alert{activeAlerts > 1 ? 's' : ''} active.</strong>
                    {alerts.slice(0, 2).map(a => (
                        <span key={a.alert_id} className='text-red-400'>
                            {a.room_name} ({a.occupancy_pct}%).
                        </span>
                    ))}
                </div>
            )}

            {/* ── Panel 1+2: Floor Heatmap + Pattern Matrix ── */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                <GlassCard title='Floor Heatmap'>
                    <FloorHeatmap rooms={rooms} />
                </GlassCard>

                <GlassCard title='Occupancy Pattern — Last 7 Days'>
                    {matrix.length > 0
                        ? <HeatmapMatrix matrix={matrix} />
                        : <div className='py-8 text-center text-slate-500 text-sm'>Loading pattern data...</div>
                    }
                </GlassCard>
            </div>

            {/* ── Panel 3+4: Utilization + Forecast ── */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                <GlassCard title='Space Utilization — All Rooms'>
                    <UtilizationBar data={utilization} maxItems={12} />
                </GlassCard>

                <GlassCard title='24-Hour ML Forecast'
                    subtitle={forecastLoading ? 'Training RandomForest model… ~30s on first load' : forecast?.model_info?.trained ? `RandomForest · ${forecast.model_info.n_samples} samples` : 'ML Forecast'}>
                    {forecastLoading ? (
                        <div className='h-40 flex flex-col items-center justify-center gap-2 text-slate-400'>
                            <RefreshCw className='w-7 h-7 animate-spin text-emerald-400' />
                            <span className='text-sm'>Training ML forecast model…</span>
                            <span className='text-xs text-slate-500'>Results appear automatically once ready</span>
                        </div>
                    ) : (
                        <>
                            <ForecastChart forecast={forecast?.forecast ?? []} />
                            {forecast?.peak && (
                                <div className='mt-3 grid grid-cols-2 gap-3'>
                                    <div className='p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-300 text-center'>
                                        <div className='text-slate-400 mb-0.5'>Peak</div>
                                        <strong>{forecast.peak.label}</strong>
                                    </div>
                                    <div className='p-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-400 text-center'>
                                        <div className='mb-0.5'>Low</div>
                                        <strong className='text-slate-300'>{forecast.low?.label}</strong>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </GlassCard>
            </div>

            {/* ── Recommendations ── */}
            {recs.length > 0 && (
                <GlassCard title='AI Recommendations'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        {recs.slice(0, 6).map(r => {
                            const priColor = r.priority === 'High' ? 'border-red-500/40 bg-red-500/5' : r.priority === 'Medium' ? 'border-amber-500/40 bg-amber-500/5' : 'border-slate-700 bg-slate-800/40';
                            return (
                                <div key={r.recommendation_id} className={`p-4 rounded-lg border ${priColor}`}>
                                    <div className='flex items-center gap-2 mb-2'>
                                        <Lightbulb className='w-4 h-4 text-emerald-400 flex-shrink-0' />
                                        <span className='text-xs font-semibold text-slate-300'>{r.category}</span>
                                        <span className={`ml-auto px-1.5 py-0.5 rounded text-[10px] font-medium ${r.priority === 'High' ? 'bg-red-500/20 text-red-400' : r.priority === 'Medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-400'}`}>{r.priority}</span>
                                    </div>
                                    <p className='text-xs text-slate-400 mb-2'>{r.reason}</p>
                                    <p className='text-xs text-slate-200'>{r.recommended_action}</p>
                                    <p className='text-[10px] text-emerald-500 mt-1'>{r.expected_benefit}</p>
                                </div>
                            );
                        })}
                    </div>
                </GlassCard>
            )}
        </div>
    );
};
