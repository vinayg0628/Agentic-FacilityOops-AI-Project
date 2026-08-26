import React, { useState, useEffect } from 'react';
import { GlassCard } from '../../components/cards/GlassCard';
import { fetchIncidents } from '../../services/incidentService';
import { AlertOctagon, RefreshCw, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SEV = sev => sev==='Critical'?'bg-red-500/20 text-red-400 border-red-500/30':sev==='High'?'bg-orange-500/20 text-orange-400 border-orange-500/30':sev==='Medium'?'bg-amber-500/20 text-amber-400 border-amber-500/30':'bg-slate-800 text-slate-400 border-slate-700';
const STAT = s => s==='Open'?'text-red-400':s==='Investigating'?'text-amber-400':s==='Resolved'?'text-emerald-400':'text-slate-400';

export const IncidentPage = () => {
    const navigate = useNavigate();
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading]     = useState(true);
    const [filterStatus, setFilterStatus] = useState('');

    const load = async () => {
        setLoading(true);
        setIncidents(await fetchIncidents(null, filterStatus||null));
        setLoading(false);
    };
    useEffect(() => { load(); }, [filterStatus]);

    const statuses = ['Open', 'Investigating', 'Contained', 'Resolved', 'False Positive'];

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                        <AlertOctagon className="w-6 h-6 text-red-400" />Incident Investigation
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Manage and investigate security incidents</p>
                </div>
                <button onClick={load} className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-400">
                    <RefreshCw className={`w-4 h-4 ${loading?'animate-spin text-red-400':''}`} />Refresh
                </button>
            </div>

            {/* Status filter pills */}
            <div className="flex flex-wrap gap-2">
                <button onClick={()=>setFilterStatus('')} className={`px-3 py-1 rounded text-sm border transition-colors ${filterStatus===''?'bg-slate-600 text-white border-slate-500':'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'}`}>All</button>
                {statuses.map(s => (
                    <button key={s} onClick={()=>setFilterStatus(s)} className={`px-3 py-1 rounded text-sm border transition-colors ${filterStatus===s?'bg-red-500/20 text-red-300 border-red-500/50':'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'}`}>{s}</button>
                ))}
            </div>

            {loading ? <div className="py-8 text-center text-slate-500">Loading incidents...</div> : (
            <div className="space-y-3">
                {incidents.length===0 && <div className="py-8 text-center text-slate-500">No incidents found</div>}
                {incidents.map(i => (
                    <GlassCard key={i.incident_id}>
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="font-mono text-xs text-slate-500">INC-{i.incident_id}</span>
                                    <span className={`px-2 py-0.5 rounded text-xs border ${SEV(i.severity)}`}>{i.severity}</span>
                                    <span className="text-xs bg-slate-800 px-2 py-0.5 rounded border border-slate-700">Risk: {i.risk_score}</span>
                                    <span className={`text-xs font-medium ${STAT(i.investigation_status)}`}>{i.investigation_status}</span>
                                </div>
                                <h3 className="text-base font-semibold text-slate-200">{i.incident_type}</h3>
                                <p className="text-sm text-slate-400 mt-0.5">Zone: {i.zone_id} · {new Date(i.timestamp).toLocaleString()}</p>
                                {i.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{i.description}</p>}
                            </div>
                            <button onClick={()=>navigate(`/security/incidents/${i.incident_id}`)}
                                className="flex items-center gap-1 px-3 py-2 rounded bg-slate-700 hover:bg-red-500/20 hover:text-red-300 text-slate-300 text-sm transition-colors ml-4 flex-shrink-0">
                                Investigate <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </GlassCard>
                ))}
            </div>
            )}
        </div>
    );
};
