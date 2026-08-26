import React, { useState, useEffect } from 'react';
import { GlassCard } from '../../components/cards/GlassCard';
import { AlertTriangle, RefreshCw, Search } from 'lucide-react';
import { fetchSecurityAlerts } from '../../services/securityService';

const FACILITY_OPTIONS = ['FAC-001', 'FAC-002', 'FAC-003', 'FAC-004', 'FAC-005'];
const SEV_COLORS = {
    Critical: 'bg-red-500/20 text-red-300 border-red-500/40',
    High:     'bg-orange-500/20 text-orange-300 border-orange-500/40',
    Medium:   'bg-amber-500/20 text-amber-300 border-amber-500/40',
    Low:      'bg-slate-700 text-slate-400 border-slate-600',
};

export const SecurityAlertsPage = () => {
    const [facilityId, setFacilityId] = useState('FAC-001');
    const [alerts, setAlerts]         = useState([]);
    const [loading, setLoading]       = useState(true);
    const [search, setSearch]         = useState('');
    const [sevFilter, setSevFilter]   = useState('');

    const load = async () => {
        setLoading(true);
        const data = await fetchSecurityAlerts(facilityId, null, sevFilter || undefined);
        if (data) setAlerts(data);
        setLoading(false);
    };

    useEffect(() => { load(); }, [facilityId, sevFilter]);

    const filtered = alerts.filter(a =>
        !search || a.alert_type?.toLowerCase().includes(search.toLowerCase()) ||
        a.zone_id?.toLowerCase().includes(search.toLowerCase()) ||
        a.message?.toLowerCase().includes(search.toLowerCase()) ||
        a.user_id?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className='p-6 space-y-6'>
            <div className='flex justify-between items-center'>
                <h1 className='text-2xl font-bold text-slate-100 flex items-center gap-2'>
                    <AlertTriangle className='w-6 h-6 text-red-400' />Security Alerts
                </h1>
                <div className='flex items-center gap-3'>
                    <select value={facilityId} onChange={e => setFacilityId(e.target.value)}
                        className='bg-slate-800 border border-slate-700 rounded-lg text-slate-200 px-3 py-2 text-sm'>
                        {FACILITY_OPTIONS.map(f => <option key={f}>{f}</option>)}
                    </select>
                    <select value={sevFilter} onChange={e => setSevFilter(e.target.value)}
                        className='bg-slate-800 border border-slate-700 rounded-lg text-slate-200 px-3 py-2 text-sm'>
                        <option value=''>All Severity</option>
                        <option>Critical</option><option>High</option><option>Medium</option><option>Low</option>
                    </select>
                    <div className='relative'>
                        <Search className='absolute left-2 top-2.5 w-4 h-4 text-slate-500' />
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder='Search...' className='pl-8 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 px-3 py-2 text-sm w-48' />
                    </div>
                    <button onClick={load} className='p-2 text-slate-400 hover:text-red-400'><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
                </div>
            </div>

            <div className='text-sm text-slate-400'>{filtered.length} alerts</div>

            <GlassCard>
                <div className='space-y-3'>
                    {filtered.map(a => (
                        <div key={a.alert_id} className={`p-4 rounded-lg border ${SEV_COLORS[a.severity] || SEV_COLORS.Low}`}>
                            <div className='flex items-center justify-between mb-2'>
                                <div className='flex items-center gap-2'>
                                    <AlertTriangle className='w-4 h-4 flex-shrink-0' />
                                    <span className='font-semibold text-sm'>{a.alert_type}</span>
                                    {a.user_id && <span className='text-xs font-mono opacity-70'>{a.user_id}</span>}
                                </div>
                                <div className='flex items-center gap-2'>
                                    <span className='text-xs font-bold'>Risk: {Math.round(a.risk_score)}</span>
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${SEV_COLORS[a.severity]}`}>{a.severity}</span>
                                    <span className='text-xs text-slate-500'>{new Date(a.timestamp).toLocaleString()}</span>
                                </div>
                            </div>
                            <div className='text-xs opacity-80 mb-1'>{a.message}</div>
                            {a.recommended_action && <div className='text-xs opacity-60 italic'>{a.recommended_action}</div>}
                            <div className='flex gap-2 mt-2'>
                                <span className='text-[10px] text-slate-500'>Zone: {a.zone_id}</span>
                                <span className='text-[10px] text-slate-600'>Status: {a.status}</span>
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && <div className='py-8 text-center text-slate-500'>No alerts found.</div>}
                </div>
            </GlassCard>
        </div>
    );
};
