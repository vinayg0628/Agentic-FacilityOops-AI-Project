import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { GlassCard } from '../../components/cards/GlassCard';
import { Shield, Camera, AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';
import axios from 'axios';

const SEV_COLORS = {
    Critical: 'text-red-400', High: 'text-orange-400',
    Medium: 'text-amber-400', Low: 'text-slate-400',
};

const ICON_MAP = { shield: Shield, camera: Camera, alert: AlertTriangle };

export const IncidentDetailPage = () => {
    const { id } = useParams();
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]    = useState(null);
    const [updating, setUpdating] = useState(false);

    const load = async () => {
        setLoading(true); setError(null);
        try {
            const r = await axios.get(`http://localhost:8000/api/incidents/${id}`, { timeout: 10000 });
            setDetail(r.data);
        } catch (e) { setError('Failed to load incident details.'); }
        setLoading(false);
    };

    const updateStatus = async (status) => {
        setUpdating(true);
        try {
            await axios.patch(`http://localhost:8000/api/incidents/${id}/status`, { status });
            await load();
        } catch {}
        setUpdating(false);
    };

    useEffect(() => { load(); }, [id]);

    if (loading) return <div className='flex h-64 items-center justify-center text-slate-400'><RefreshCw className='w-6 h-6 animate-spin mr-2 text-red-400' />Loading...</div>;
    if (error)   return <div className='p-6 text-red-400 bg-red-500/10 rounded-lg border border-red-500/30'>{error}</div>;
    if (!detail) return <div className='p-6 text-slate-400'>Incident not found.</div>;

    const inc = detail.incident;
    const STATUS_OPTIONS = ['Open', 'Investigating', 'Contained', 'Resolved', 'False Positive'];

    return (
        <div className='p-6 space-y-6'>
            <div className='flex items-center gap-3'>
                <Link to='/security/incidents' className='p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400'>
                    <ArrowLeft className='w-4 h-4' />
                </Link>
                <div>
                    <h1 className='text-xl font-bold text-slate-100 flex items-center gap-2'>
                        <AlertTriangle className='w-5 h-5 text-red-400' />Incident #{inc?.incident_id}: {inc?.incident_type}
                    </h1>
                    <p className='text-slate-400 text-sm'>{inc?.zone_id} · {inc && new Date(inc.timestamp).toLocaleString()}</p>
                </div>
                <div className='ml-auto flex items-center gap-2'>
                    <select value={inc?.investigation_status} onChange={e => updateStatus(e.target.value)}
                        disabled={updating}
                        className='bg-slate-800 border border-slate-700 rounded-lg text-slate-200 px-3 py-2 text-sm'>
                        {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                {[
                    { label: 'Severity', value: inc?.severity, colorClass: SEV_COLORS[inc?.severity] },
                    { label: 'Risk Score', value: inc?.risk_score?.toFixed(1), colorClass: 'text-orange-400' },
                    { label: 'Status', value: inc?.investigation_status, colorClass: 'text-slate-200' },
                ].map(m => (
                    <div key={m.label} className='bg-slate-800/60 border border-slate-700/50 rounded-xl p-4'>
                        <div className='text-xs text-slate-400 mb-1'>{m.label}</div>
                        <div className={`text-2xl font-bold ${m.colorClass}`}>{m.value}</div>
                    </div>
                ))}
            </div>

            <GlassCard title='Description'>
                <p className='text-slate-300 text-sm'>{inc?.description}</p>
                {inc?.recommended_action && (
                    <p className='mt-3 text-sm text-emerald-400 italic'>{inc.recommended_action}</p>
                )}
            </GlassCard>

            <GlassCard title='Event Timeline'>
                <div className='relative pl-4'>
                    {detail.timeline.map((ev, i) => {
                        const Icon = ICON_MAP[ev.icon] || Shield;
                        const clr = SEV_COLORS[ev.severity] || 'text-slate-400';
                        return (
                            <div key={i} className='relative flex gap-4 pb-6'>
                                <div className={`absolute left-0 top-1.5 w-2 h-2 rounded-full mt-0.5 border-2 ${ev.severity === 'High' || ev.severity === 'Critical' ? 'bg-red-500 border-red-400' : 'bg-slate-600 border-slate-500'}`} />
                                {i < detail.timeline.length - 1 && <div className='absolute left-0.5 top-4 bottom-0 w-px bg-slate-700' />}
                                <div className='ml-5'>
                                    <div className='flex items-center gap-2 mb-1'>
                                        <Icon className={`w-3.5 h-3.5 ${clr}`} />
                                        <span className='text-xs text-slate-400'>{new Date(ev.time).toLocaleString()}</span>
                                        <span className={`text-[10px] ${clr}`}>{ev.severity}</span>
                                    </div>
                                    <p className='text-sm text-slate-200'>{ev.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </GlassCard>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <GlassCard title={`Access Logs (${detail.related_access_logs.length})`}>
                    <div className='space-y-2'>
                        {detail.related_access_logs.map(l => (
                            <div key={l.access_id} className={`p-2 rounded text-xs border ${l.result === 'Denied' ? 'bg-red-500/10 border-red-500/30 text-red-300' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>
                                <span className='font-mono'>{l.user_id}</span> · {l.zone_id} · {l.result} · {new Date(l.timestamp).toLocaleTimeString()}
                            </div>
                        ))}
                        {detail.related_access_logs.length === 0 && <div className='text-slate-500 text-sm'>No related access logs.</div>}
                    </div>
                </GlassCard>
                <GlassCard title={`CCTV Events (${detail.related_cctv_events.length})`}>
                    <div className='space-y-2'>
                        {detail.related_cctv_events.map(e => (
                            <div key={e.event_id} className='p-2 rounded text-xs bg-slate-800 border border-slate-700 text-slate-300'>
                                <Camera className='inline w-3 h-3 mr-1' />{e.event_type} · {e.zone_id} · {Math.round(e.confidence * 100)}% · {new Date(e.timestamp).toLocaleTimeString()}
                            </div>
                        ))}
                        {detail.related_cctv_events.length === 0 && <div className='text-slate-500 text-sm'>No related CCTV events.</div>}
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};
