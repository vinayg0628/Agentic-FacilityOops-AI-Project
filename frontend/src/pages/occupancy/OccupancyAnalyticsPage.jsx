import React, { useEffect, useState, useCallback } from 'react';
import { GlassCard } from '../../components/cards/GlassCard';
import { UtilizationBar } from '../../components/occupancy/UtilizationBar';
import { BarChart3, RefreshCw, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { fetchOccupancyAnalytics, fetchUtilizationReport } from '../../services/occupancyService';

const FACILITY_OPTIONS = ['FAC-001', 'FAC-002', 'FAC-003', 'FAC-004', 'FAC-005'];

const LABEL_COLORS = {
    High:          'text-red-400',
    Moderate:      'text-amber-400',
    Low:           'text-yellow-400',
    Underutilized: 'text-slate-400',
};

// Safe number formatter — never crashes on null / undefined
const fmt = (v) => (v == null ? '—' : Number(v).toLocaleString());
const pct = (v) => (v == null ? '—' : `${Number(v).toFixed(1)}%`);

export const OccupancyAnalyticsPage = () => {
    const [facilityId, setFacilityId] = useState('FAC-001');
    const [analytics, setAnalytics]   = useState(null);
    const [utilization, setUtil]      = useState([]);
    const [sortBy, setSortBy]         = useState('avg');
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState(null);

    const load = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const [anl, util] = await Promise.all([
                fetchOccupancyAnalytics(facilityId, 7),
                fetchUtilizationReport(facilityId, 7),
            ]);
            if (anl)  setAnalytics(anl);
            if (util) setUtil(Array.isArray(util) ? util : []);
            if (!anl && !util) setError('Failed to load analytics data. Is the backend running?');
        } catch (err) {
            setError(`Error: ${err.message}`);
        }
        setLoading(false);
    }, [facilityId]);

    useEffect(() => { load(); }, [load]);

    // Safe data extraction — default to empty objects/arrays if backend key is missing
    const dailyTrend  = Object.entries(analytics?.daily_trend   ?? {});
    const hourlyTrend = Object.entries(analytics?.hourly_trend  ?? {});
    const floorUtil   = Object.entries(analytics?.floor_utilization ?? {});
    const maxDaily    = Math.max(...dailyTrend.map(([, v]) => Number(v) || 0), 0.01);
    const peakHour    = hourlyTrend.length
        ? hourlyTrend.reduce((best, cur) => (Number(cur[1]) > Number(best[1]) ? cur : best), ['—', 0])
        : ['—', 0];

    const sortedUtil = [...utilization].sort((a, b) =>
        sortBy === 'avg'  ? (b.avg_occupancy_rate  ?? 0) - (a.avg_occupancy_rate  ?? 0) :
        sortBy === 'peak' ? (b.peak_occupancy_rate ?? 0) - (a.peak_occupancy_rate ?? 0) :
        (a.room_name ?? '').localeCompare(b.room_name ?? '')
    );

    if (loading) return (
        <div className='flex h-64 items-center justify-center gap-3 text-slate-400'>
            <RefreshCw className='w-6 h-6 animate-spin text-emerald-400' />
            Loading analytics…
        </div>
    );

    if (error) return (
        <div className='p-6'>
            <div className='bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 flex items-center gap-3'>
                <AlertCircle className='w-5 h-5 flex-shrink-0' />
                {error}
                <button onClick={load} className='ml-auto underline hover:text-red-300'>Retry</button>
            </div>
        </div>
    );

    return (
        <div className='p-6 space-y-6'>
            {/* Header */}
            <div className='flex justify-between items-center flex-wrap gap-3'>
                <div>
                    <h1 className='text-2xl font-bold text-slate-100 flex items-center gap-2'>
                        <BarChart3 className='w-6 h-6 text-emerald-400' />Occupancy Analytics
                    </h1>
                    <p className='text-slate-400 text-sm mt-1'>Historical trends · Utilization breakdown · Floor comparisons</p>
                </div>
                <div className='flex items-center gap-3'>
                    <select value={facilityId} onChange={e => setFacilityId(e.target.value)}
                        className='bg-slate-800 border border-slate-700 rounded-lg text-slate-200 px-3 py-2 text-sm'>
                        {FACILITY_OPTIONS.map(f => <option key={f}>{f}</option>)}
                    </select>
                    <button onClick={load}
                        className='flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700'>
                        <RefreshCw className='w-4 h-4' />Refresh
                    </button>
                </div>
            </div>

            {/* KPI cards */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                {[
                    {
                        label: 'Avg Occupancy (7d)',
                        value: pct(analytics?.avg_occupancy_pct),
                        icon: <BarChart3 className='w-4 h-4 text-emerald-400' />,
                    },
                    {
                        label: 'Peak Hour',
                        value: peakHour[0] === '—' ? '—' : `${peakHour[0]}:00`,
                        icon: <TrendingUp className='w-4 h-4 text-amber-400' />,
                    },
                    {
                        label: 'Overcrowded Rooms',
                        value: analytics?.overcrowded_count ?? 0,
                        icon: <AlertCircle className='w-4 h-4 text-red-400' />,
                    },
                    {
                        label: 'Underutilized Rooms',
                        value: analytics?.underutilized_count ?? 0,
                        icon: <TrendingDown className='w-4 h-4 text-slate-400' />,
                    },
                ].map(m => (
                    <div key={m.label} className='bg-slate-800/60 border border-slate-700/50 rounded-xl p-4'>
                        <div className='flex items-center gap-2 text-xs text-slate-400 mb-1'>{m.icon}{m.label}</div>
                        <div className='text-2xl font-bold text-slate-100'>{m.value}</div>
                    </div>
                ))}
            </div>

            {/* Daily trend chart */}
            <GlassCard title='14-Day Daily Occupancy Trend'>
                {dailyTrend.length === 0 ? (
                    <div className='h-52 flex items-center justify-center text-slate-500 text-sm'>No daily trend data</div>
                ) : (
                    <div className='h-52 flex items-end gap-1.5 border-b border-slate-700/50 px-2 pb-2'>
                        {dailyTrend.map(([date, rate]) => {
                            const r = Number(rate) || 0;
                            const p = Math.round(r * 100);
                            const h = Math.max(6, (r / maxDaily) * 170);
                            const color = r >= 0.80 ? 'bg-red-500' : r >= 0.60 ? 'bg-amber-500' : 'bg-emerald-500';
                            return (
                                <div key={date} className='flex-1 h-full flex flex-col items-center justify-end gap-1'
                                    title={`${date}: ${p}%`}>
                                    <span className='text-[9px] text-slate-400'>{p}%</span>
                                    <div className={`w-full rounded-t ${color} opacity-80`} style={{ height: h }} />
                                    <span className='text-[9px] text-slate-500 truncate w-full text-center'>{date.slice(5)}</span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </GlassCard>

            {/* Hourly profile + Floor comparison */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <GlassCard title='Average Occupancy by Hour'>
                    {hourlyTrend.length === 0 ? (
                        <div className='h-40 flex items-center justify-center text-slate-500 text-sm'>No hourly data</div>
                    ) : (
                        <>
                            <div className='h-40 flex items-end gap-0.5 px-1'>
                                {hourlyTrend.map(([h, rate]) => {
                                    const r = Number(rate) || 0;
                                    const ht = Math.max(4, r * 130);
                                    const color = r >= 0.80 ? 'bg-red-500' : r >= 0.60 ? 'bg-amber-500' : 'bg-emerald-500';
                                    return (
                                        <div key={h} className='flex-1 flex flex-col items-center justify-end gap-0.5'
                                            title={`${h}:00 — ${Math.round(r * 100)}%`}>
                                            <div className={`w-full rounded-t ${color} opacity-80`} style={{ height: ht }} />
                                            {parseInt(h) % 4 === 0 &&
                                                <span className='text-[8px] text-slate-500'>{h}h</span>}
                                        </div>
                                    );
                                })}
                            </div>
                            <p className='mt-2 text-xs text-slate-500 text-center'>
                                Peak hour: <strong className='text-emerald-400'>{peakHour[0]}:00</strong>
                                {peakHour[1] > 0 && ` · ${Math.round(Number(peakHour[1]) * 100)}%`}
                            </p>
                        </>
                    )}
                </GlassCard>

                <GlassCard title='Floor Utilization Comparison'>
                    {floorUtil.length === 0 ? (
                        <div className='h-40 flex items-center justify-center text-slate-500 text-sm'>No floor data</div>
                    ) : (
                        <div className='space-y-4 mt-2'>
                            {floorUtil.map(([floor, rate]) => {
                                const r = Number(rate) || 0;
                                return (
                                    <div key={floor}>
                                        <div className='flex justify-between text-xs text-slate-400 mb-1'>
                                            <span>Floor {floor}</span>
                                            <span>{Math.round(r * 100)}%</span>
                                        </div>
                                        <div className='h-3 rounded-full bg-slate-800'>
                                            <div className='h-3 rounded-full bg-emerald-500 transition-all'
                                                style={{ width: `${Math.min(100, r * 100)}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </GlassCard>
            </div>

            {/* Utilization bars */}
            <GlassCard title='Room-Level Utilization (Last 7 Days)'>
                <div className='flex items-center gap-3 mb-4 flex-wrap'>
                    <span className='text-xs text-slate-400'>Sort by:</span>
                    {['avg', 'peak', 'name'].map(k => (
                        <button key={k} onClick={() => setSortBy(k)}
                            className={`px-2 py-1 rounded text-xs transition-colors ${
                                sortBy === k
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                    : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-500'
                            }`}>
                            {k === 'avg' ? 'Avg Occupancy' : k === 'peak' ? 'Peak Occupancy' : 'Name'}
                        </button>
                    ))}
                    <span className='ml-auto text-xs text-slate-500'>{sortedUtil.length} rooms</span>
                </div>
                <UtilizationBar data={sortedUtil} maxItems={20} />
            </GlassCard>

            {/* Detailed table */}
            <GlassCard title='Detailed Utilization Table'>
                <div className='overflow-x-auto'>
                    <table className='w-full text-sm text-left text-slate-300'>
                        <thead>
                            <tr className='border-b border-slate-700/50 text-slate-400 text-xs'>
                                <th className='pb-2 pr-4'>Room</th>
                                <th className='pb-2 pr-4'>Floor</th>
                                <th className='pb-2 pr-4'>Type</th>
                                <th className='pb-2 pr-4'>Avg %</th>
                                <th className='pb-2 pr-4'>Peak %</th>
                                <th className='pb-2 pr-4'>Label</th>
                                <th className='pb-2 pr-4'>Entries</th>
                                <th className='pb-2'>Exits</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedUtil.length === 0 ? (
                                <tr><td colSpan={8} className='py-8 text-center text-slate-500'>No utilization data found.</td></tr>
                            ) : sortedUtil.map(r => (
                                <tr key={r.room_id} className='border-b border-slate-700/30 last:border-0 hover:bg-slate-800/30'>
                                    <td className='py-2 pr-4 font-medium text-slate-200'>{r.room_name ?? '—'}</td>
                                    <td className='py-2 pr-4 text-slate-400'>{r.floor ?? '—'}</td>
                                    <td className='py-2 pr-4 text-slate-400 text-xs'>{r.room_type ?? '—'}</td>
                                    <td className='py-2 pr-4'>{r.avg_occupancy_pct ?? '—'}%</td>
                                    <td className='py-2 pr-4'>{r.peak_occupancy_pct ?? '—'}%</td>
                                    <td className={`py-2 pr-4 text-xs font-medium ${LABEL_COLORS[r.utilization_label] ?? 'text-slate-400'}`}>
                                        {r.utilization_label ?? '—'}
                                    </td>
                                    <td className='py-2 pr-4 text-slate-400'>{fmt(r.total_entries)}</td>
                                    <td className='py-2 text-slate-400'>{fmt(r.total_exits)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </div>
    );
};
