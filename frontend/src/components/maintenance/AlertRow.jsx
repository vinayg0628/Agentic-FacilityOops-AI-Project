import React from 'react';
import { MoreVertical, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

export const AlertRow = ({ alert, onStatusChange }) => {
  const getSeverityStyle = (severity) => {
    switch(severity?.toLowerCase()) {
      case 'critical': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'warning':
      case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'low': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getStatusStyle = (status) => {
    switch(status?.toLowerCase()) {
      case 'open': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'acknowledged': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'resolved': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    const d = new Date(isoString);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Normalize field names — supports both real API (alert_id, equipment_name) and mock (id, equipment)
  const alertId = alert.alert_id ?? alert.id;
  const equipmentName = alert.equipment_name ?? alert.equipment ?? '—';

  return (
    <tr className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group">
      <td className="p-4 align-middle">
        <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md border ${getSeverityStyle(alert.severity)}`}>
          {alert.severity}
        </span>
      </td>
      <td className="p-4 align-middle text-sm font-medium text-slate-200">
        {equipmentName}
      </td>
      <td className="p-4 align-middle text-sm text-slate-300">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          {alert.issue}
        </div>
      </td>
      <td className="p-4 align-middle text-xs text-slate-400 hidden md:table-cell">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          {formatDate(alert.timestamp)}
        </div>
      </td>
      <td className="p-4 align-middle">
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border flex w-max items-center gap-1.5 ${getStatusStyle(alert.status)}`}>
          {alert.status?.toLowerCase() === 'resolved' && <CheckCircle2 className="w-3.5 h-3.5" />}
          {alert.status}
        </span>
      </td>
      <td className="p-4 align-middle text-right relative">
        <div className="relative inline-block group/menu">
          <button className="p-1.5 text-slate-500 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
          <div className="absolute right-0 top-full mt-1 w-36 bg-slate-900 border border-slate-700 rounded-xl shadow-xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10">
            <div className="p-1 space-y-0.5">
              <button onClick={() => onStatusChange && onStatusChange(alertId, 'Acknowledged')} className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-amber-400 rounded-lg transition-colors">Acknowledge</button>
              <button onClick={() => onStatusChange && onStatusChange(alertId, 'Resolved')} className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-emerald-400 rounded-lg transition-colors">Mark Resolved</button>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
};
