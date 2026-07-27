import React, { useEffect, useState } from 'react';
import { useFacility } from '../context/FacilityContext';
import { fetchEnergyTelemetry } from '../services/api';
import { GlassCard } from '../components/common/GlassCard';
import { 
  Activity, 
  PlusCircle, 
  Cpu, 
  Gauge, 
  Thermometer, 
  Sun, 
  Zap, 
  Droplets, 
  RefreshCw,
  Search
} from 'lucide-react';

export const MonitoringPage = () => {
  const { selectedFacilityId, setIsIngestModalOpen, refreshTrigger } = useFacility();
  const [telemetry, setTelemetry] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTelemetry();
  }, [selectedFacilityId, refreshTrigger]);

  const loadTelemetry = async () => {
    setLoading(true);
    try {
      const data = await fetchEnergyTelemetry(selectedFacilityId, 150);
      setTelemetry(data);
    } catch (err) {
      console.error("Failed to load telemetry data:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTelemetry = telemetry.filter(t => 
    t.facility_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.timestamp.includes(searchTerm)
  );

  // Compute live gauges from latest telemetry reading
  const latest = telemetry[0] || {
    power_factor: 0.95,
    electricity_kwh: 350.0,
    hvac_kwh: 165.0,
    solar_generation_kwh: 45.0,
    temperature: 24.5,
    humidity: 52.0
  };

  const hvacPct = latest.electricity_kwh > 0 ? ((latest.hvac_kwh / latest.electricity_kwh) * 100).toFixed(1) : 45.0;
  const pfColor = latest.power_factor >= 0.92 ? 'text-emerald-400' : latest.power_factor >= 0.88 ? 'text-amber-400' : 'text-rose-400';

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-6 h-6 text-cyan-400 animate-pulse" />
            <span>Energy Telemetry & IoT Sensor Stream</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time sensor logs including electricity (kWh), water, HVAC, solar, power factor, and microclimate sensors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadTelemetry}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={() => setIsIngestModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/25 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Ingest Sensor Metric</span>
          </button>
        </div>
      </div>

      {/* Real-time Telemetry Live Gauges Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Gauge 1: Power Factor */}
        <div className="glass-panel p-4 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Gauge className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase">Power Factor (PF)</p>
            <p className={`text-xl font-bold font-mono mt-0.5 ${pfColor}`}>
              {latest.power_factor} <span className="text-xs text-slate-400">cos φ</span>
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">Target &gt; 0.90 (Penalty threshold)</p>
          </div>
        </div>

        {/* Gauge 2: HVAC Load Ratio */}
        <div className="glass-panel p-4 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase">HVAC Load Percentage</p>
            <p className="text-xl font-bold font-mono text-slate-100 mt-0.5">
              {hvacPct}% <span className="text-xs text-slate-400">of total</span>
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">Baseline benchmark: 45.0%</p>
          </div>
        </div>

        {/* Gauge 3: Solar Generation Offset */}
        <div className="glass-panel p-4 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Sun className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase">Solar Generation</p>
            <p className="text-xl font-bold font-mono text-amber-400 mt-0.5">
              {latest.solar_generation_kwh} <span className="text-xs text-slate-400">kWh</span>
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">Rooftop PV array active</p>
          </div>
        </div>

        {/* Gauge 4: Ambient Microclimate */}
        <div className="glass-panel p-4 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Thermometer className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase">Facility Temperature</p>
            <p className="text-xl font-bold font-mono text-slate-100 mt-0.5">
              {latest.temperature}°C <span className="text-xs text-slate-400">/ {latest.humidity}% RH</span>
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">HVAC zone setpoint active</p>
          </div>
        </div>

      </div>

      {/* Main Telemetry Table */}
      <GlassCard 
        title="Raw Sensor Telemetry Records" 
        subtitle="Showing latest IoT sensor readings in reverse chronological order"
        action={
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter table..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] uppercase text-slate-400 bg-slate-900/80 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Facility ID</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Electricity (kWh)</th>
                <th className="py-3 px-4">HVAC (kWh)</th>
                <th className="py-3 px-4">Lighting (kWh)</th>
                <th className="py-3 px-4">Water (L)</th>
                <th className="py-3 px-4">Solar (kWh)</th>
                <th className="py-3 px-4">Power Factor</th>
                <th className="py-3 px-4">Temp (°C)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredTelemetry.map((row) => (
                <tr key={row.energy_id} className="hover:bg-slate-800/40 transition-colors font-mono text-[11px]">
                  <td className="py-2.5 px-4 text-slate-500">#{row.energy_id}</td>
                  <td className="py-2.5 px-4 font-sans font-semibold text-cyan-400">{row.facility_id}</td>
                  <td className="py-2.5 px-4 text-slate-400">{row.timestamp.replace('T', ' ').slice(0, 19)}</td>
                  <td className="py-2.5 px-4 font-bold text-slate-100">{row.electricity_kwh}</td>
                  <td className="py-2.5 px-4 text-blue-400">{row.hvac_kwh}</td>
                  <td className="py-2.5 px-4 text-emerald-400">{row.lighting_kwh}</td>
                  <td className="py-2.5 px-4 text-indigo-400">{row.water_liters}</td>
                  <td className="py-2.5 px-4 text-amber-400">{row.solar_generation_kwh}</td>
                  <td className={`py-2.5 px-4 font-bold ${
                    row.power_factor < 0.90 ? 'text-rose-400' : 'text-emerald-400'
                  }`}>
                    {row.power_factor}
                  </td>
                  <td className="py-2.5 px-4 text-slate-300">{row.temperature}°C</td>
                </tr>
              ))}
              {filteredTelemetry.length === 0 && (
                <tr>
                  <td colSpan="10" className="py-8 text-center text-slate-500 font-sans">
                    No matching telemetry records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

    </div>
  );
};
