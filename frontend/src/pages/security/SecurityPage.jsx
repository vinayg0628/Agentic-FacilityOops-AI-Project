import React from 'react';
import { ShieldCheck, Lock, Eye, AlertOctagon } from 'lucide-react';
import { GlassCard } from '../../components/cards/GlassCard';
import { MetricCard } from '../../components/cards/MetricCard';

export const SecurityPage = () => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 backdrop-blur-md">
        <h1 className="text-xl font-extrabold text-slate-100 tracking-tight">Security & Anomaly Monitoring Agent</h1>
        <p className="text-xs text-slate-400 mt-1">Perimeter integrity checks, access badge anomalies, and off-hours power spike detection.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard label="Perimeter Security Status" value="Secured" badgeText="All Zones Nominal" status="normal" />
        <MetricCard label="Off-Hours Access Logs" value="0 Anomalies" badgeText="Verified" status="normal" />
        <MetricCard label="Security Index" value="98/100" badgeText="High Integrity" status="normal" />
      </div>

      <GlassCard title="Security Surveillance & Perimeter Logs" subtitle="AI agent scan status">
        <div className="p-6 text-center text-slate-400 font-medium">
          <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-200">Facility Security Monitoring Active</p>
          <p className="text-xs text-slate-500 mt-1">No unauthorized access attempts or off-hours physical anomalies detected across facility zones.</p>
        </div>
      </GlassCard>
    </div>
  );
};
