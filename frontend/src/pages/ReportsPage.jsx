import React, { useState } from 'react';
import { useFacility } from '../context/FacilityContext';
import { getExportUrl } from '../services/api';
import { GlassCard } from '../components/common/GlassCard';
import { 
  FileSpreadsheet, 
  FileText, 
  Download, 
  CheckCircle, 
  Calendar, 
  Building,
  Table
} from 'lucide-react';

export const ReportsPage = () => {
  const { facilities, selectedFacilityId, setSelectedFacilityId } = useFacility();
  const [reportType, setReportType] = useState('full');
  const [downloading, setDownloading] = useState(null);

  const handleExport = (format) => {
    setDownloading(format);
    const url = getExportUrl(format, selectedFacilityId);
    
    // Trigger file download via invisible link
    const link = document.createElement('a');
    link.href = url;
    link.download = `energy_audit_report_${selectedFacilityId}_${new Date().toISOString().slice(0, 10)}.${format === 'excel' ? 'xlsx' : format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setDownloading(null);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6 text-cyan-400" />
          <span>Enterprise Energy Reports & Audit Exporter</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Generate and download compliant energy audit telemetry reports in standard CSV, Excel (.xlsx), and PDF formats.
        </p>
      </div>

      {/* Export Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CSV Export Card */}
        <div className="glass-panel p-6 border border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center mb-4">
              <Table className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-100">CSV Raw Data Export</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Full hourly IoT sensor telemetry stream formatted as comma-separated values for data science and custom scripts.
            </p>
          </div>
          
          <button
            onClick={() => handleExport('csv')}
            disabled={downloading === 'csv'}
            className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{downloading === 'csv' ? 'Generating CSV...' : 'Download CSV Report'}</span>
          </button>
        </div>

        {/* Excel Export Card */}
        <div className="glass-panel p-6 border border-slate-800 hover:border-emerald-500/50 transition-all flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-4">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Excel Workbook (.xlsx)</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Formatted multi-column spreadsheet with headers, automated totals, and facility metrics formatted for finance teams.
            </p>
          </div>
          
          <button
            onClick={() => handleExport('excel')}
            disabled={downloading === 'excel'}
            className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{downloading === 'excel' ? 'Generating XLSX...' : 'Download Excel Report'}</span>
          </button>
        </div>

        {/* PDF Executive Report Card */}
        <div className="glass-panel p-6 border border-slate-800 hover:border-rose-500/50 transition-all flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-100">PDF Executive Audit</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Formal audit document generated with ReportLab including summary statistics, compliance headers, and sample logs.
            </p>
          </div>
          
          <button
            onClick={() => handleExport('pdf')}
            disabled={downloading === 'pdf'}
            className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs shadow-lg shadow-rose-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{downloading === 'pdf' ? 'Generating PDF...' : 'Download PDF Report'}</span>
          </button>
        </div>

      </div>

      {/* Target Scope Configurator */}
      <GlassCard title="Report Configuration & Scope Selection" subtitle="Filter report dataset prior to exporting">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Target Facility Scope</label>
            <select
              value={selectedFacilityId}
              onChange={(e) => setSelectedFacilityId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:border-cyan-500 cursor-pointer"
            >
              <option value="ALL">🏢 All Facilities (Full Enterprise Audit)</option>
              {facilities.map((f) => (
                <option key={f.facility_id} value={f.facility_id}>
                  {f.facility_name} ({f.facility_type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Audit Report Scope Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:border-cyan-500 cursor-pointer"
            >
              <option value="full">Full Energy Telemetry Log (1,000 Records)</option>
              <option value="anomalies">Anomalies & AI Alerts Only</option>
              <option value="carbon">Sustainability & Scope 2 Carbon Audit</option>
            </select>
          </div>
        </div>
      </GlassCard>

    </div>
  );
};
