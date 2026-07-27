import React from 'react';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export const AlertTable = ({ alerts = [], onUpdateStatus }) => {
  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'MEDIUM':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs text-slate-300">
        <thead className="bg-slate-900/60 uppercase text-slate-400 font-semibold border-b border-slate-800">
          <tr>
            <th className="py-3 px-4">Severity</th>
            <th className="py-3 px-4">Alert Title</th>
            <th className="py-3 px-4">Metric</th>
            <th className="py-3 px-4">Value / Limit</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Timestamp</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {alerts.length === 0 ? (
            <tr>
              <td colSpan="7" className="py-8 text-center text-slate-500 font-medium">
                No active alerts detected. All systems operating normally.
              </td>
            </tr>
          ) : (
            alerts.map((alert) => (
              <tr key={alert.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-0.5 rounded-full border font-bold text-[10px] ${getSeverityBadge(alert.severity)}`}>
                    {alert.severity}
                  </span>
                </td>
                <td className="py-3 px-4 font-semibold text-slate-100">{alert.title}</td>
                <td className="py-3 px-4 font-mono text-slate-400">{alert.metric_name || 'N/A'}</td>
                <td className="py-3 px-4 font-mono text-cyan-400 font-bold">
                  {alert.metric_value ? `${alert.metric_value} / ${alert.threshold_value}` : 'N/A'}
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center gap-1 font-medium ${alert.status === 'Open' ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {alert.status === 'Open' ? <Clock className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                    {alert.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-400 font-mono">
                  {alert.created_at ? new Date(alert.created_at).toLocaleString() : 'Just now'}
                </td>
                <td className="py-3 px-4 text-right">
                  {alert.status === 'Open' && onUpdateStatus && (
                    <button
                      onClick={() => onUpdateStatus(alert.id, 'Resolved')}
                      className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-[11px] font-bold rounded-lg border border-emerald-500/30 transition-colors"
                    >
                      Resolve
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
