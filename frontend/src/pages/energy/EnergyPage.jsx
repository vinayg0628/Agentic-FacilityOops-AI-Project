import React, { useState, useEffect } from 'react';
import { Zap, Activity, Sun, BatteryCharging, Filter } from 'lucide-react';
import { GlassCard } from '../../components/cards/GlassCard';
import { KpiCard } from '../../components/cards/KpiCard';
import { HourlyLineChart } from '../../components/charts/HourlyLineChart';
import { TelemetryTable } from '../../components/tables/TelemetryTable';
import { fetchEnergyData, fetchFacilities } from '../../services/api';

export const EnergyPage = () => {
  const [telemetry, setTelemetry] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEnergyData();
  }, [selectedFacility]);

  const loadEnergyData = async () => {
    setLoading(true);
    try {
      const facId = selectedFacility === 'ALL' ? null : selectedFacility;
      const [energyRes, facRes] = await Promise.all([
        fetchEnergyData(facId, 50),
        fetchFacilities()
      ]);
      setTelemetry(energyRes.data || []);
      setFacilities(facRes.data || []);
    } catch (err) {
      console.error("Failed to load energy telemetry:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalKwh = telemetry.reduce((sum, item) => sum + (item.electricity_kwh || 0), 0);
  const totalHvac = telemetry.reduce((sum, item) => sum + (item.hvac_kwh || 0), 0);
  const totalSolar = telemetry.reduce((sum, item) => sum + (item.solar_generation_kwh || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 tracking-tight">Energy & Power Intelligence</h1>
          <p className="text-xs text-slate-400 mt-1">High-frequency telemetry analysis, solar generation, and diurnal grid load tracking.</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-400">Filter Facility:</label>
          <select 
            value={selectedFacility}
            onChange={(e) => setSelectedFacility(e.target.value)}
            className="bg-slate-950 text-slate-200 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-cyan-500 transition-colors"
          >
            <option value="ALL">All Facilities</option>
            {facilities.map(f => (
              <option key={f.facility_id} value={f.facility_id}>{f.facility_name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard title="Sample Interval Electricity" value={Math.round(totalKwh)} unit="kWh" icon={Zap} color="cyan" />
        <KpiCard title="Sample HVAC Consumption" value={Math.round(totalHvac)} unit="kWh" icon={Activity} color="amber" />
        <KpiCard title="Solar Self-Supply Generation" value={Math.round(totalSolar)} unit="kWh" icon={Sun} color="emerald" />
      </div>

      <GlassCard title="Real-Time Power Telemetry Logs" subtitle="Showing recent 50 sensor readings">
        <TelemetryTable telemetry={telemetry} />
      </GlassCard>
    </div>
  );
};
