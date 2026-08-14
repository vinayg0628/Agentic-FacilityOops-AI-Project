import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart2, AlertTriangle, Calendar, Settings } from 'lucide-react';
import { fetchPredictions } from '../../services/maintenanceApi';

export const PredictionsPage = () => {
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchPredictions();
        setPredictions(data.sort((a, b) => b.risk_score - a.risk_score));
      } catch (error) {
        console.error("Failed to fetch predictions", error);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const formatDate = (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const handleScheduleClick = () => {
    navigate('/maintenance/schedule');
  };

  const getRulColor = (days) => {
    if (days < 30) return 'bg-rose-500';
    if (days < 90) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const hasCritical = predictions.some(p => p.health_score < 40);

  return (
    <div className="space-y-6 pb-12">
      {hasCritical && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-start gap-4">
          <div className="p-2 bg-rose-500/20 text-rose-400 rounded-lg shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-rose-400 font-bold">Critical Failure Imminent</h3>
            <p className="text-rose-400/80 text-sm mt-1">AI models predict failure for 1 or more critical assets within 7 days. Immediate action required.</p>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-violet-400" /> Failure Predictions
          </h1>
          <p className="text-slate-400 text-sm mt-1">Machine learning forecasts based on historical deterioration patterns</p>
        </div>
      </div>

      {loading ? (
        <div className="h-96 bg-slate-800/50 rounded-2xl animate-pulse"></div>
      ) : (
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-xs text-slate-400 uppercase border-b border-slate-800">
                  <th className="p-4 font-medium">Equipment</th>
                  <th className="p-4 font-medium">Risk Score</th>
                  <th className="p-4 font-medium">Predicted Failure</th>
                  <th className="p-4 font-medium">Remaining Useful Life</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map(p => (
                  <tr key={p.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <p className="text-sm font-bold text-slate-200">{p.name}</p>
                      <p className="text-xs text-slate-500">{p.type}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${p.risk_score > 60 ? 'text-rose-400' : p.risk_score > 30 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {p.risk_score}
                        </span>
                        <span className="text-[10px] text-slate-500">/100</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        {formatDate(p.predicted_failure_date)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-200 w-16">{p.remaining_useful_life} days</span>
                        <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden max-w-[150px]">
                          <div className={`h-full ${getRulColor(p.remaining_useful_life)}`} style={{ width: `${Math.min(100, (p.remaining_useful_life / 180) * 100)}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={handleScheduleClick}
                        className="px-3 py-1.5 bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 border border-violet-500/30 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ml-auto"
                      >
                        <Settings className="w-3.5 h-3.5" /> Schedule
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
