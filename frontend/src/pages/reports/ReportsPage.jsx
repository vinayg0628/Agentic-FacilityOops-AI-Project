import React from 'react';
import { FileText, Download, Printer, BarChart2 } from 'lucide-react';
import { GlassCard } from '../../components/cards/GlassCard';

export const ReportsPage = () => {
  const downloadReport = (format) => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    window.open(`${apiUrl}/v1/reports/export/${format}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 backdrop-blur-md">
        <h1 className="text-xl font-extrabold text-slate-100 tracking-tight">Executive Compliance & Sustainability Reports</h1>
        <p className="text-xs text-slate-400 mt-1">Export ESG sustainability metrics, PDF audit reports, and Excel telemetry logs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard title="Executive PDF Report" subtitle="Automated summary with charts & recommendations">
          <div className="p-4 space-y-4">
            <FileText className="w-10 h-10 text-cyan-400" />
            <p className="text-xs text-slate-400">Generates complete PDF containing total energy spend, peak demand analysis, and AI agent insights.</p>
            <button 
              onClick={() => downloadReport('pdf')} 
              className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" /> Download PDF Report
            </button>
          </div>
        </GlassCard>

        <GlassCard title="Raw Excel Data Audit" subtitle="Full telemetry dataset export (.xlsx)">
          <div className="p-4 space-y-4">
            <BarChart2 className="w-10 h-10 text-emerald-400" />
            <p className="text-xs text-slate-400">Includes all 30-day sensor telemetry readings, power factor records, and HVAC load metrics.</p>
            <button 
              onClick={() => downloadReport('excel')} 
              className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" /> Export Excel Dataset
            </button>
          </div>
        </GlassCard>

        <GlassCard title="CSV Telemetry Log" subtitle="Standard CSV dataset for custom analysis">
          <div className="p-4 space-y-4">
            <FileText className="w-10 h-10 text-amber-400" />
            <p className="text-xs text-slate-400">Lightweight CSV log format suitable for third-party BI dashboard integration.</p>
            <button 
              onClick={() => downloadReport('csv')} 
              className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" /> Export CSV Log
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
