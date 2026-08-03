import React, { useState, useEffect } from 'react';
import { BellDot, CheckSquare } from 'lucide-react';
import { fetchMaintenanceAlerts, updateAlertStatus } from '../../services/maintenanceApi';
import { AlertRow } from '../../components/maintenance/AlertRow';

export const AlertsManagementPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const data = await fetchMaintenanceAlerts();
      setAlerts(data);
    } catch (error) {
      console.error("Failed to fetch alerts", error);
    }
    setLoading(false);
  };

  const handleStatusChange = async (id, newStatus) => {
    await updateAlertStatus(id, newStatus);
    loadAlerts(); // Reload to get updated state
  };

  const openCount = alerts.filter(a => a.status === 'Open').length;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <BellDot className="w-6 h-6 text-rose-400" /> Maintenance Alerts
            {openCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-rose-500 text-white text-xs font-bold rounded-full">{openCount}</span>
            )}
          </h1>
          <p className="text-slate-400 text-sm mt-1">System-generated anomalies and AI threshold breaches</p>
        </div>
        <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold rounded-xl transition-colors border border-slate-700 flex items-center gap-2">
          <CheckSquare className="w-4 h-4" /> Acknowledge All
        </button>
      </div>

      {loading ? (
        <div className="h-96 bg-slate-800/50 rounded-2xl animate-pulse"></div>
      ) : (
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-xs text-slate-400 uppercase border-b border-slate-800">
                  <th className="p-4 font-medium">Severity</th>
                  <th className="p-4 font-medium">Equipment</th>
                  <th className="p-4 font-medium">Issue</th>
                  <th className="p-4 font-medium hidden md:table-cell">Timestamp</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {alerts.map(alert => (
                  <AlertRow key={alert.alert_id ?? alert.id} alert={alert} onStatusChange={handleStatusChange} />
                ))}
                {alerts.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-500">
                      No alerts found matching current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
