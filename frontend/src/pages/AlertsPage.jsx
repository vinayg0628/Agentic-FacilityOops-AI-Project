import React, { useEffect, useState } from 'react';
import { useFacility } from '../context/FacilityContext';
import { fetchAlerts, updateAlertStatus } from '../services/api';
import { GlassCard } from '../components/common/GlassCard';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle, 
  Clock, 
  Filter,
  Lightbulb,
  Building,
  RefreshCw
} from 'lucide-react';

export const AlertsPage = () => {
  const { selectedFacilityId, refreshTrigger } = useFacility();

  const [alerts, setAlerts] = useState([]);
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, [selectedFacilityId, severityFilter, statusFilter, refreshTrigger]);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const data = await fetchAlerts(selectedFacilityId, severityFilter, statusFilter);
      setAlerts(data);
    } catch (err) {
      console.error("Failed to load energy alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (alertId, newStatus) => {
    try {
      await updateAlertStatus(alertId, newStatus);
      setAlerts(prev => prev.map(a => a.alert_id === alertId ? { ...a, status: newStatus } : a));
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-rose-400" />
            <span>Energy Anomaly & Incident Alerts</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Automated alerts triggered by the Energy AI Agent rules (Spikes &gt;20%, HVAC Overload, Low Power Factor, Water Leaks).
          </p>
        </div>

        <button
          onClick={loadAlerts}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Incidents</span>
        </button>
      </div>

      {/* Filter Bar Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl glass-panel">
        
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <Filter className="w-4 h-4 text-cyan-400" />
          <span>Filter Incidents:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          
          {/* Severity Select */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:border-cyan-500 cursor-pointer"
            >
              <option value="ALL">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Status Select */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:border-cyan-500 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

        </div>

      </div>

      {/* Alerts Cards List */}
      <div className="space-y-4">
        {alerts.map((alert) => {
          const isCritical = alert.severity === 'Critical';
          const isHigh = alert.severity === 'High';
          const isMedium = alert.severity === 'Medium';

          const borderStyle = isCritical 
            ? 'border-rose-500/40 bg-rose-950/10' 
            : isHigh 
            ? 'border-amber-500/40 bg-amber-950/10' 
            : 'border-blue-500/30 bg-slate-900/40';

          const severityBadge = isCritical
            ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
            : isHigh
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
            : 'bg-blue-500/20 text-blue-300 border-blue-500/50';

          return (
            <div 
              key={alert.alert_id} 
              className={`glass-panel p-5 border ${borderStyle} transition-all hover:scale-[1.005]`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-3 mb-3">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${severityBadge}`}>
                    {alert.severity}
                  </span>
                  <h3 className="font-bold text-sm text-slate-100">{alert.alert_type}</h3>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                    <Building className="w-3.5 h-3.5 text-cyan-400" />
                    {alert.facility_name || alert.facility_id}
                  </span>
                  <span className="text-slate-500 font-mono">
                    {new Date(alert.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Message */}
              <p className="text-xs text-slate-300 leading-relaxed font-medium mb-3">
                {alert.message}
              </p>

              {/* Energy Agent Recommendation Box */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs flex items-start gap-2.5 mb-4">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-200 text-[11px] uppercase tracking-wider block mb-0.5">
                    Energy AI Agent Recommendation:
                  </span>
                  <p className="text-slate-400 text-xs leading-normal">
                    {alert.recommendation}
                  </p>
                </div>
              </div>

              {/* Footer Status Controls */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">Status:</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    alert.status === 'Open' ? 'bg-rose-500/20 text-rose-300' :
                    alert.status === 'In Progress' ? 'bg-amber-500/20 text-amber-300' :
                    'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {alert.status}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {alert.status !== 'In Progress' && (
                    <button
                      onClick={() => handleStatusChange(alert.alert_id, 'In Progress')}
                      className="px-3 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                    >
                      Acknowledge & Investigate
                    </button>
                  )}
                  {alert.status !== 'Resolved' && (
                    <button
                      onClick={() => handleStatusChange(alert.alert_id, 'Resolved')}
                      className="px-3 py-1 rounded-lg text-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition-colors font-semibold"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>

            </div>
          );
        })}

        {alerts.length === 0 && (
          <GlassCard className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-200">No Incidents Found</h3>
            <p className="text-xs text-slate-400 mt-1">
              No active energy alerts matching the selected filters.
            </p>
          </GlassCard>
        )}
      </div>

    </div>
  );
};
