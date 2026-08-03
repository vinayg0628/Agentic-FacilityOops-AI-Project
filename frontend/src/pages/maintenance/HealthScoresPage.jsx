import React, { useState, useEffect } from 'react';
import { Gauge, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { fetchHealthScores } from '../../services/maintenanceApi';
import { HealthScoreGauge } from '../../components/maintenance/HealthScoreGauge';
import { RiskBadge } from '../../components/maintenance/RiskBadge';

export const HealthScoresPage = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadScores = async () => {
      setLoading(true);
      try {
        const data = await fetchHealthScores();
        setScores(data.sort((a, b) => a.health_score - b.health_score));
      } catch (error) {
        console.error("Failed to fetch health scores", error);
      }
      setLoading(false);
    };
    loadScores();
  }, []);

  const excellentCount = scores.filter(s => s.health_category === 'Excellent').length;
  const goodCount = scores.filter(s => s.health_category === 'Good').length;
  const warningCount = scores.filter(s => s.health_category === 'Warning').length;
  const criticalCount = scores.filter(s => s.health_category === 'Critical' || s.health_category === 'Immediate Maintenance').length;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Gauge className="w-6 h-6 text-cyan-400" /> Equipment Health Scores
          </h1>
          <p className="text-slate-400 text-sm mt-1">Real-time health index based on multi-sensor telemetry</p>
        </div>
      </div>

      {!loading && (
        <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex gap-1 h-12 overflow-hidden shadow-lg">
          <div style={{ width: `${(excellentCount/scores.length)*100}%` }} className="bg-emerald-500 hover:bg-emerald-400 transition-colors cursor-help rounded-l-lg group relative">
             <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-slate-800 text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 z-10">Excellent</div>
          </div>
          <div style={{ width: `${(goodCount/scores.length)*100}%` }} className="bg-cyan-500 hover:bg-cyan-400 transition-colors cursor-help group relative">
             <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-slate-800 text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 z-10">Good</div>
          </div>
          <div style={{ width: `${(warningCount/scores.length)*100}%` }} className="bg-amber-500 hover:bg-amber-400 transition-colors cursor-help group relative">
             <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-slate-800 text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 z-10">Warning</div>
          </div>
          <div style={{ width: `${(criticalCount/scores.length)*100}%` }} className="bg-rose-500 hover:bg-rose-400 transition-colors cursor-help rounded-r-lg group relative">
             <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-slate-800 text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 z-10">Critical</div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[...Array(8)].map((_, i) => <div key={i} className="h-64 bg-slate-800/50 rounded-2xl"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {scores.map(eq => (
            <div key={eq.id} className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 p-6 flex flex-col items-center hover:bg-slate-800/50 transition-colors relative overflow-hidden group">
              <div className={`absolute top-0 left-0 w-full h-1 ${eq.health_score > 75 ? 'bg-emerald-500' : eq.health_score > 50 ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
              
              <div className="w-full flex justify-between items-start mb-4">
                <RiskBadge level={eq.health_category} />
                <div className="flex items-center gap-1 text-xs font-bold text-slate-400">
                  {Math.random() > 0.5 ? <ArrowUpRight className="w-3 h-3 text-emerald-400" /> : <ArrowDownRight className="w-3 h-3 text-rose-400" />}
                  {Math.floor(Math.random() * 5) + 1}%
                </div>
              </div>

              <HealthScoreGauge score={eq.health_score} size="lg" />
              
              <h3 className="text-slate-100 font-bold mt-6 text-center">{eq.name}</h3>
              <p className="text-slate-500 text-xs mb-4">{eq.type} • {eq.id}</p>

              <div className="w-full grid grid-cols-2 gap-2 mt-auto">
                <div className="bg-slate-950 p-2 rounded-lg flex flex-col items-center">
                  <Activity className="w-3 h-3 text-cyan-400 mb-1" />
                  <span className="text-xs text-slate-300">{eq.metrics?.temp || 0}°C</span>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg flex flex-col items-center">
                  <Activity className="w-3 h-3 text-cyan-400 mb-1" />
                  <span className="text-xs text-slate-300">{eq.metrics?.vibration || 0}mm/s</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
