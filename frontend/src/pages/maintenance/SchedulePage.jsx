import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { fetchMaintenanceSchedule, updateScheduleStatus } from '../../services/maintenanceApi';

export const SchedulePage = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    loadSchedule();
  }, [activeTab]);

  const loadSchedule = async () => {
    setLoading(true);
    try {
      const data = await fetchMaintenanceSchedule(null, activeTab === 'All' ? 'ALL' : activeTab);
      setSchedule(data);
    } catch (error) {
      console.error("Failed to fetch schedule", error);
    }
    setLoading(false);
  };

  const handleStatusUpdate = async (id, newStatus) => {
    await updateScheduleStatus(id, newStatus);
    loadSchedule();
  };

  const tabs = ['All', 'Scheduled', 'In Progress', 'Overdue', 'Completed'];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-blue-400" /> Maintenance Schedule
          </h1>
          <p className="text-slate-400 text-sm mt-1">Track and manage planned maintenance activities</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-blue-900/20">
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      <div className="flex overflow-x-auto gap-2 pb-2 hide-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${
              activeTab === tab 
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:bg-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-96 bg-slate-800/50 rounded-2xl animate-pulse"></div>
      ) : (
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-xs text-slate-400 uppercase border-b border-slate-800">
                  <th className="p-4 font-medium">Task / Equipment</th>
                  <th className="p-4 font-medium">Type</th>
                  <th className="p-4 font-medium">Scheduled Date</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Engineer</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map(task => (
                  <tr key={task.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <p className="text-sm font-bold text-slate-200">{task.equipment}</p>
                      <p className="text-xs text-slate-500">{task.maintenance_type}</p>
                    </td>
                    <td className="p-4 text-sm text-slate-300">{task.type}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className={`w-4 h-4 ${task.status === 'Overdue' ? 'text-rose-400' : 'text-slate-500'}`} />
                        <span className={task.status === 'Overdue' ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                          {task.scheduled_date}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md border ${
                        task.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                        task.status === 'In Progress' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                        task.status === 'Overdue' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                        'bg-blue-500/20 text-blue-400 border-blue-500/30'
                      }`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-300">{task.engineer}</td>
                    <td className="p-4 text-right">
                      {task.status !== 'Completed' && (
                        <button 
                          onClick={() => handleStatusUpdate(task.id, 'Completed')}
                          className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                        </button>
                      )}
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
