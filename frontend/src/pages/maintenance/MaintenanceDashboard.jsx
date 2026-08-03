import React, { useState, useEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Filler, Tooltip, Legend } from 'chart.js';
import { Activity, ShieldCheck, AlertTriangle, AlertOctagon, Calendar, Gauge } from 'lucide-react';
import { MaintenanceKpiCard } from '../../components/maintenance/MaintenanceKpiCard';
import { AlertRow } from '../../components/maintenance/AlertRow';
import { RecommendationCard } from '../../components/maintenance/RecommendationCard';
import { fetchMaintenanceAnalytics } from '../../services/maintenanceApi';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Filler, Tooltip, Legend);

export const MaintenanceDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const result = await fetchMaintenanceAnalytics();
        setData(result);
      } catch (error) {
        console.error("Error loading maintenance analytics", error);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-slate-800/50 rounded-2xl w-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-32 bg-slate-800/50 rounded-2xl"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-800/50 rounded-2xl"></div>
          <div className="h-80 bg-slate-800/50 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const healthScoreData = {
    labels: data.equipment_health_list.slice(0, 7).map(e => e.name),
    datasets: [{
      label: 'Health Score',
      data: data.equipment_health_list.slice(0, 7).map(e => e.score),
      backgroundColor: data.equipment_health_list.slice(0, 7).map(e => e.score > 75 ? 'rgba(16, 185, 129, 0.7)' : e.score > 50 ? 'rgba(245, 158, 11, 0.7)' : 'rgba(244, 63, 94, 0.7)'),
      borderRadius: 4
    }]
  };

  const costData = {
    labels: data.monthly_maintenance_cost.map(m => m.month),
    datasets: [{
      label: 'Maintenance Cost ($)',
      data: data.monthly_maintenance_cost.map(m => m.cost),
      fill: true,
      backgroundColor: 'rgba(99, 102, 241, 0.2)',
      borderColor: 'rgba(99, 102, 241, 1)',
      tension: 0.4
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: 'rgba(15, 23, 42, 0.9)', titleColor: '#f1f5f9', bodyColor: '#cbd5e1', borderColor: 'rgba(51, 65, 85, 0.5)', borderWidth: 1 }
    },
    scales: {
      y: { grid: { color: '#1e293b' }, ticks: { color: '#94a3b8' } },
      x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
    }
  };

  const horizChartOptions = { ...chartOptions, indexAxis: 'y' };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            Predictive Maintenance Intelligence
          </h1>
          <p className="text-slate-400 mt-1">Real-time asset health monitoring and AI-driven predictions.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-medium text-emerald-400">Live Monitoring</span>
          </div>
          <select className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none">
            <option>All Facilities</option>
            <option>Main Campus</option>
          </select>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MaintenanceKpiCard label="Total Equipment" value={data.total_equipment} subtitle="Tracked Assets" icon={Activity} color="blue" />
        <MaintenanceKpiCard label="Healthy" value={data.healthy_equipment_count} subtitle="Operating Nominally" icon={ShieldCheck} color="emerald" trend="up" trendValue={2} />
        <MaintenanceKpiCard label="Warning" value={data.warning_equipment_count} subtitle="Needs Attention" icon={AlertTriangle} color="amber" trend="up" trendValue={1} />
        <MaintenanceKpiCard label="Critical" value={data.critical_equipment_count} subtitle="Immediate Action" icon={AlertOctagon} color="rose" trend="down" trendValue={1} />
        <MaintenanceKpiCard label="Due Today" value={data.maintenance_due_today_count} subtitle="Scheduled Tasks" icon={Calendar} color="violet" />
        <MaintenanceKpiCard label="Avg Health" value={`${data.average_health_score}%`} subtitle="Facility Wide" icon={Gauge} color="cyan" trend="up" trendValue={0.5} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 p-5 shadow-lg">
          <h3 className="text-slate-200 font-bold mb-4 flex items-center gap-2">
            <Gauge className="w-4 h-4 text-cyan-400" /> Equipment Health Scores
          </h3>
          <div className="h-64">
            <Bar data={healthScoreData} options={horizChartOptions} />
          </div>
        </div>
        <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 p-5 shadow-lg">
          <h3 className="text-slate-200 font-bold mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" /> Monthly Maintenance Cost ($)
          </h3>
          <div className="h-64">
            <Line data={costData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 p-5 shadow-lg overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-slate-200 font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" /> Recent Alerts
            </h3>
            <button className="text-xs text-cyan-400 hover:text-cyan-300 font-medium">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase bg-slate-900/50">
                  <th className="p-3 font-medium rounded-tl-lg">Severity</th>
                  <th className="p-3 font-medium">Equipment</th>
                  <th className="p-3 font-medium">Issue</th>
                  <th className="p-3 font-medium hidden md:table-cell">Time</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium rounded-tr-lg"></th>
                </tr>
              </thead>
              <tbody>
                {data.recent_alerts.slice(0, 4).map(alert => (
                  <AlertRow key={alert.id} alert={alert} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 p-5 shadow-lg flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-slate-200 font-bold flex items-center gap-2">
              <span className="w-4 h-4 rounded text-center leading-4 bg-violet-500/20 text-violet-400 text-[10px]">AI</span> 
              Actionable Recommendations
            </h3>
            <span className="text-xs px-2 py-1 bg-violet-500/10 text-violet-400 rounded-md border border-violet-500/20">
              {data.ai_recommendations.length} New
            </span>
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
            {data.ai_recommendations.map(rec => (
              <RecommendationCard key={rec.id} recommendation={rec} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
