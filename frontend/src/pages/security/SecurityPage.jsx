import React, { useState, useEffect, useCallback } from 'react';
import { GlassCard } from '../../components/cards/GlassCard';
import { MetricCard } from '../../components/cards/MetricCard';
import { RiskGauge } from '../../components/security/RiskGauge';
import { AnomalyScatter } from '../../components/security/AnomalyScatter';
import { AccessTimelineChart } from '../../components/security/AccessTimelineChart';
import {
    fetchRiskSummary,
    fetchSecurityAnalytics,
    fetchUnauthorizedAccess,
    fetchAnomalies,
    fetchCCTVEvents,
    fetchVisitors,
    fetchVisitorViolations,
} from '../../services/securityService';
import { Shield, RefreshCw, AlertTriangle, Camera, Users, Eye, Activity } from 'lucide-react';

const FACILITY_OPTIONS = ['FAC-001', 'FAC-002', 'FAC-003', 'FAC-004', 'FAC-005'];

const SEV_COLORS = {
    Critical: 'bg-red-500/20 text-red-300 border-red-500/40',
    High:     'bg-orange-500/20 text-orange-300 border-orange-500/40',
    Medium:   'bg-amber-500/20 text-amber-300 border-amber-500/40',
    Low:      'bg-slate-700 text-slate-400 border-slate-600',
};

export const SecurityPage = () => {
    const [facilityId, setFacilityId]       = useState('FAC-001');
    const [riskData, setRiskData]           = useState(null);
    const [analytics, setAnalytics]         = useState(null);
    const [unauthorized, setUnauthorized]   = useState([]);
    const [anomalyData, setAnomalyData]     = useState(null);
    const [anomalyLoading, setAnomalyLoading] = useState(true);
    const [cctvEvents, setCCTVEvents]       = useState([]);
    const [visitors, setVisitors]           = useState([]);
    const [violations, setViolations]       = useState([]);
    const [insights, setInsights]           = useState([]);
    const [loading, setLoading]             = useState(true);
    const [lastUpdated, setLastUpdated]     = useState(null);

    // Load anomalies separately — IsolationForest training can take ~40s on first call
    const loadAnomalies = useCallback(async (fid) => {
        setAnomalyLoading(true);
        const anomaly = await fetchAnomalies(fid, 14);
        if (anomaly) setAnomalyData(anomaly);
        setAnomalyLoading(false);
    }, []);

    const loadAll = useCallback(async () => {
        setLoading(true);
        // Fast endpoints — load immediately
        const [risk, anl, unauth, cctv, vis, viols, ins] = await Promise.all([
            fetchRiskSummary(facilityId),
            fetchSecurityAnalytics(facilityId, 7),
            fetchUnauthorizedAccess(facilityId, 24),
            fetchCCTVEvents(facilityId, 30),
            fetchVisitors(facilityId, 'active'),
            fetchVisitorViolations(facilityId),
            import('../../services/intelligenceService').then(m => m.fetchIntelligenceInsights(facilityId)),
        ]);
        if (risk)    setRiskData(risk);
        if (anl)     setAnalytics(anl);
        if (unauth)  setUnauthorized(unauth);
        if (cctv)    setCCTVEvents(cctv);
        if (vis)     setVisitors(vis);
        if (viols)   setViolations(viols);
        if (ins)     setInsights(ins);
        setLastUpdated(new Date());
        setLoading(false);
        // Slow: anomaly detection — runs in background, panel shows spinner
        loadAnomalies(facilityId);
    }, [facilityId, loadAnomalies]);

    useEffect(() => {
        loadAll();
        const iv = setInterval(loadAll, 30000);
        return () => clearInterval(iv);
    }, [loadAll]);

    const riskScore     = riskData?.risk_score ?? 0;
    const totalEvents   = analytics?.total_access_events ?? 0;
    const deniedCount   = analytics?.denied_count ?? 0;
    const activeVisitors = analytics?.active_visitors ?? 0;
    const anomalyCount  = anomalyData?.anomalies_found ?? 0;
    const openIncidents = riskData?.critical_alerts + riskData?.high_alerts ?? 0;
    const deniedByHour  = analytics?.denied_by_hour ?? {};
    const allowedByHour = analytics?.allowed_by_hour ?? {};
    const scatter       = anomalyData?.scatter_data ?? [];

    const sevBadge = (sev) => (
        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${SEV_COLORS[sev] || SEV_COLORS.Low}`}>{sev}</span>
    );

    return (
        <div className='p-6 space-y-6'>
            {/* Header */}
            <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
                <div>
                    <h1 className='text-2xl font-bold text-slate-100 flex items-center gap-2'>
                        <Shield className='w-6 h-6 text-red-400' />Security Intelligence
                    </h1>
                    <p className='text-slate-400 text-sm mt-1'>
                        Access monitoring · Isolation Forest anomaly detection · Visitor tracking
                        {lastUpdated && <span className='ml-2 text-slate-600'>· {lastUpdated.toLocaleTimeString()}</span>}
                    </p>
                </div>
                <div className='flex items-center gap-3'>
                    <select value={facilityId} onChange={e => setFacilityId(e.target.value)}
                        className='bg-slate-800 border border-slate-700 rounded-lg text-slate-200 px-3 py-2 text-sm'>
                        {FACILITY_OPTIONS.map(f => <option key={f}>{f}</option>)}
                    </select>
                    <button onClick={loadAll} className='flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-red-400 text-sm'>
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-red-400' : ''}`} />Refresh
                    </button>
                </div>
            </div>

            {/* KPI Row */}
            <div className='grid grid-cols-2 md:grid-cols-6 gap-4'>
                <MetricCard label='Risk Score' value={`${riskScore}/100`}
                    status={riskScore >= 85 ? 'critical' : riskScore >= 60 ? 'warning' : 'normal'} badgeText={riskData?.severity} />
                <MetricCard label='Access Events' value={totalEvents} status='normal' badgeText='7d' />
                <MetricCard label='Denied Access' value={deniedCount}
                    status={deniedCount > 20 ? 'critical' : deniedCount > 10 ? 'warning' : 'normal'}
                    badgeText={`${analytics?.denial_rate_pct ?? 0}%`} />
                <MetricCard label='Active Visitors' value={activeVisitors}
                    status={violations.length > 0 ? 'warning' : 'normal'}
                    badgeText={violations.length > 0 ? `${violations.length} violations` : 'ok'} />
                <MetricCard label='Anomalies' value={anomalyCount}
                    status={anomalyCount > 5 ? 'critical' : anomalyCount > 0 ? 'warning' : 'normal'}
                    badgeText='Isolation Forest' />
                <MetricCard label='Open Alerts' value={openIncidents}
                    status={openIncidents > 2 ? 'critical' : openIncidents > 0 ? 'warning' : 'normal'}
                    badgeText='incidents' />
            </div>

            {/* Violations banner */}
            {violations.length > 0 && (
                <div className='flex items-start gap-3 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg text-orange-300 text-sm'>
                    <AlertTriangle className='w-5 h-5 flex-shrink-0 mt-0.5' />
                    <div>
                        <strong>{violations.length} visitor zone violation{violations.length > 1 ? 's' : ''}</strong> detected.
                        {violations.slice(0, 2).map((v, i) => (
                            <span key={i} className='ml-2 text-orange-400'>{v.visitor_name} in {v.zone_id}.</span>
                        ))}
                    </div>
                </div>
            )}

            {/* Row 1: Timeline (2/3) + Risk Gauge + CCTV (1/3) */}
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                <div className='lg:col-span-2'>
                    <GlassCard title='Access Timeline — Last 24 Hours' subtitle='Green = Allowed | Red = Denied'>
                        <AccessTimelineChart deniedByHour={deniedByHour} allowedByHour={allowedByHour} />
                    </GlassCard>
                </div>
                <div className='space-y-4'>
                    <GlassCard title='Security Risk Score'>
                        <RiskGauge score={riskScore} />
                    </GlassCard>
                </div>
            </div>
            {/* Row 1.5: Cross-Agent Intelligence (Occupancy + Security) */}
            {insights && insights.length > 0 && (
                <div className='mb-6'>
                    <GlassCard title='Cross-Agent Intelligence: Occupancy + Security' subtitle='AI engine correlating data across facility agents'>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-2'>
                            {insights.map((ins, i) => (
                                <div key={i} className={`p-4 rounded-xl border ${ins.severity === 'CRITICAL' ? 'bg-red-500/10 border-red-500/40' : 'bg-orange-500/10 border-orange-500/40'}`}>
                                    <div className='flex justify-between items-start mb-2'>
                                        <div className='flex items-center gap-2'>
                                            <Activity className={`w-5 h-5 ${ins.severity === 'CRITICAL' ? 'text-red-400' : 'text-orange-400'}`} />
                                            <span className='font-bold text-slate-100'>{ins.title}</span>
                                        </div>
                                        {sevBadge(ins.severity === 'CRITICAL' ? 'Critical' : 'High')}
                                    </div>
                                    <p className='text-sm text-slate-300 mb-3'>{ins.description}</p>
                                    <div className='bg-slate-900/50 p-2.5 rounded text-xs border border-slate-700/50'>
                                        <span className='text-emerald-400 font-semibold mb-1 block'>AI Recommendation:</span>
                                        <span className='text-slate-400'>{ins.recommended_action}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>
            )}

            {/* Row 2: Anomaly Scatter (2/3) + CCTV Feed (1/3) */}
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                <div className='lg:col-span-2'>
                    <GlassCard title='Anomaly Detection — Isolation Forest'
                        subtitle={anomalyLoading ? 'Training Isolation Forest model… this takes ~30s on first load' : anomalyData?.model_info?.trained ? `Model trained on ${anomalyData.model_info.n_samples} events — ${anomalyData.anomalies_found} anomalies found` : 'Ready'}>
                        {anomalyLoading ? (
                            <div className='h-52 flex flex-col items-center justify-center gap-3 text-slate-400'>
                                <RefreshCw className='w-8 h-8 animate-spin text-red-400' />
                                <span className='text-sm'>Running Isolation Forest anomaly detection…</span>
                                <span className='text-xs text-slate-500'>Model trains on 14 days of access logs — results will appear automatically</span>
                            </div>
                        ) : (
                            <AnomalyScatter points={scatter} />
                        )}
                    </GlassCard>
                </div>
                <div>
                    <GlassCard title='CCTV Event Feed'>
                        <div className='space-y-2'>
                            {cctvEvents.slice(0, 8).map(ev => (
                                <div key={ev.event_id} className={`flex items-start gap-3 p-2 rounded-lg border ${SEV_COLORS[ev.severity] || SEV_COLORS.Low}`}>
                                    <Camera className='w-4 h-4 flex-shrink-0 mt-0.5' />
                                    <div className='min-w-0'>
                                        <div className='text-xs font-medium truncate'>{ev.event_type}</div>
                                        <div className='text-[10px] opacity-70'>{ev.zone_id} · {Math.round(ev.confidence * 100)}% conf</div>
                                    </div>
                                    {sevBadge(ev.severity)}
                                </div>
                            ))}
                            {cctvEvents.length === 0 && <div className='py-4 text-center text-slate-500 text-sm'>No CCTV events</div>}
                        </div>
                    </GlassCard>
                </div>
            </div>

            {/* Row 3: Unauthorized Access Table (2/3) + Visitor Tracking (1/3) */}
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                <div className='lg:col-span-2'>
                    <GlassCard title='Unauthorized Access Feed' subtitle='All denied access events with risk scoring'>
                        <div className='overflow-x-auto'>
                            <table className='w-full text-xs text-left text-slate-300'>
                                <thead>
                                    <tr className='border-b border-slate-700/50 text-slate-500'>
                                        <th className='pb-2 pr-3'>Time</th>
                                        <th className='pb-2 pr-3'>User</th>
                                        <th className='pb-2 pr-3'>Zone</th>
                                        <th className='pb-2 pr-3'>Method</th>
                                        <th className='pb-2 pr-3'>Reasons</th>
                                        <th className='pb-2 pr-3'>Risk</th>
                                        <th className='pb-2'>Severity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {unauthorized.slice(0, 15).map(log => (
                                        <tr key={log.access_id} className='border-b border-slate-700/30 last:border-0 hover:bg-red-500/5'>
                                            <td className='py-2 pr-3 text-slate-400 whitespace-nowrap'>{new Date(log.timestamp).toLocaleTimeString()}</td>
                                            <td className='py-2 pr-3 font-mono text-slate-200'>{log.user_id}</td>
                                            <td className='py-2 pr-3 text-slate-400 truncate max-w-[120px]'>{log.zone_id}</td>
                                            <td className='py-2 pr-3 text-slate-400'>{log.access_method}</td>
                                            <td className='py-2 pr-3 text-slate-500'>{log.risk_reasons?.join(', ')}</td>
                                            <td className='py-2 pr-3'>
                                                <span className={`font-bold ${log.risk_score >= 85 ? 'text-red-400' : log.risk_score >= 70 ? 'text-orange-400' : 'text-amber-400'}`}>
                                                    {log.risk_score}
                                                </span>
                                            </td>
                                            <td className='py-2'>{sevBadge(log.severity)}</td>
                                        </tr>
                                    ))}
                                    {unauthorized.length === 0 && (
                                        <tr><td colSpan={7} className='py-6 text-center text-slate-500'>No denied access events in last 24 hours</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>
                </div>

                <div>
                    <GlassCard title='Active Visitors'>
                        <div className='space-y-2'>
                            {visitors.slice(0, 8).map(v => {
                                const hasViolation = violations.some(vl => vl.visitor_id === v.visitor_id);
                                return (
                                    <div key={v.visitor_id} className={`p-2 rounded-lg border text-xs ${hasViolation ? 'bg-orange-500/10 border-orange-500/30' : 'bg-slate-800/50 border-slate-700/30'}`}>
                                        <div className='flex justify-between items-center'>
                                            <span className='font-medium text-slate-200 truncate'>{v.visitor_name}</span>
                                            {hasViolation && <AlertTriangle className='w-3 h-3 text-orange-400 flex-shrink-0' />}
                                        </div>
                                        <div className='text-slate-400 mt-0.5'>Host: {v.host_employee}</div>
                                        <div className={`text-[10px] mt-0.5 ${hasViolation ? 'text-orange-400' : 'text-slate-500'}`}>
                                            {hasViolation ? 'Zone violation' : v.current_zone}
                                        </div>
                                    </div>
                                );
                            })}
                            {visitors.length === 0 && <div className='py-4 text-center text-slate-500 text-sm'>No active visitors</div>}
                        </div>
                    </GlassCard>
                </div>
            </div>

            {/* Anomaly Detail Table */}
            {anomalyData?.anomalies && anomalyData.anomalies.length > 0 && (
                <GlassCard title='Anomaly Details — Isolation Forest Results'>
                    <div className='overflow-x-auto'>
                        <table className='w-full text-xs text-left text-slate-300'>
                            <thead>
                                <tr className='border-b border-slate-700/50 text-slate-500'>
                                    <th className='pb-2 pr-3'>Timestamp</th>
                                    <th className='pb-2 pr-3'>User</th>
                                    <th className='pb-2 pr-3'>Zone</th>
                                    <th className='pb-2 pr-3'>Anomaly Type</th>
                                    <th className='pb-2 pr-3'>Score</th>
                                    <th className='pb-2 pr-3'>Risk</th>
                                    <th className='pb-2'>Result</th>
                                </tr>
                            </thead>
                            <tbody>
                                {anomalyData.anomalies.slice(0, 20).map((a, i) => (
                                    <tr key={i} className='border-b border-slate-700/20 last:border-0 hover:bg-red-500/5'>
                                        <td className='py-1.5 pr-3 text-slate-400'>{new Date(a.timestamp).toLocaleString()}</td>
                                        <td className='py-1.5 pr-3 font-mono text-slate-200'>{a.user_id}</td>
                                        <td className='py-1.5 pr-3 text-slate-400 truncate max-w-[100px]'>{a.zone_id}</td>
                                        <td className='py-1.5 pr-3 text-orange-300'>{a.anomaly_type}</td>
                                        <td className='py-1.5 pr-3 text-slate-400 font-mono'>{a.anomaly_score?.toFixed(3)}</td>
                                        <td className='py-1.5 pr-3'><span className='text-red-400 font-bold'>{a.risk_score}</span></td>
                                        <td className='py-1.5'><span className={a.result === 'Denied' ? 'text-red-400' : 'text-emerald-400'}>{a.result}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>
            )}
        </div>
    );
};
