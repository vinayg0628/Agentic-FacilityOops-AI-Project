import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, CheckCircle, RefreshCw } from 'lucide-react';
import { GlassCard } from '../../components/cards/GlassCard';
import { AlertTable } from '../../components/tables/AlertTable';
import { fetchAlerts, updateAlertStatus } from '../../services/api';

export const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, [statusFilter]);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetchAlerts(null, statusFilter === 'ALL' ? null : statusFilter);
      setAlerts(res.data || []);
    } catch (err) {
      console.error("Failed to load alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAlert = async (alertId, newStatus) => {
    try {
      await updateAlertStatus(alertId, newStatus);
      loadAlerts();
    } catch (err) {
      console.error("Failed to update alert status:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 tracking-tight">Facility System Alerts</h1>
          <p className="text-xs text-slate-400 mt-1">Real-time threshold breaches, power spikes, and HVAC temperature excursions.</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-400">Filter Status:</label>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 text-slate-200 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-cyan-500 transition-colors"
          >
            <option value="ALL">All Alerts</option>
            <option value="Open">Open Alerts Only</option>
            <option value="Resolved">Resolved Alerts Only</option>
          </select>

          <button 
            onClick={loadAlerts}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <GlassCard title="Active & Historical Alert Console" subtitle="Managed by AI Telemetry Engine">
        <AlertTable alerts={alerts} onUpdateStatus={handleResolveAlert} />
      </GlassCard>
    </div>
  );
};
