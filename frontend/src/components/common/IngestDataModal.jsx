import React, { useState } from 'react';
import { useFacility } from '../../context/FacilityContext';
import { createEnergyReading } from '../../services/api';
import { X, Cpu, CheckCircle2, AlertCircle } from 'lucide-react';

export const IngestDataModal = () => {
  const { facilities, isIngestModalOpen, setIsIngestModalOpen, triggerRefresh } = useFacility();

  const [facilityId, setFacilityId] = useState(facilities[0]?.facility_id || 'FAC-001');
  const [electricityKwh, setElectricityKwh] = useState('420.5');
  const [waterLiters, setWaterLiters] = useState('850.0');
  const [hvacKwh, setHvacKwh] = useState('240.0');
  const [lightingKwh, setLightingKwh] = useState('85.0');
  const [solarKwh, setSolarKwh] = useState('50.0');
  const [powerFactor, setPowerFactor] = useState('0.87');
  const [temperature, setTemperature] = useState('26.5');
  const [humidity, setHumidity] = useState('55.0');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isIngestModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const payload = {
        facility_id: facilityId,
        electricity_kwh: parseFloat(electricityKwh),
        water_liters: parseFloat(waterLiters),
        hvac_kwh: parseFloat(hvacKwh),
        lighting_kwh: parseFloat(lightingKwh),
        solar_generation_kwh: parseFloat(solarKwh),
        power_factor: parseFloat(powerFactor),
        temperature: parseFloat(temperature),
        humidity: parseFloat(humidity),
        timestamp: new Date().toISOString()
      };

      await createEnergyReading(payload);
      setSuccessMsg('Telemetry ingested successfully! Energy AI Agent has evaluated stream.');
      triggerRefresh();

      setTimeout(() => {
        setIsIngestModalOpen(false);
        setSuccessMsg('');
      }, 1800);
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Failed to ingest IoT telemetry data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 light:bg-slate-900/40 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-lg p-6 relative border border-slate-700 light:border-slate-300 shadow-2xl bg-slate-950 light:bg-white">
        
        {/* Close button */}
        <button
          onClick={() => setIsIngestModalOpen(false)}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 light:text-slate-600 hover:text-white light:hover:text-slate-900 hover:bg-slate-800 light:hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 light:text-cyan-700 border border-cyan-500/30 flex items-center justify-center">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 light:text-slate-900">Simulate IoT Sensor Reading</h2>
            <p className="text-xs text-slate-400 light:text-slate-600 font-medium">Post new telemetry metric stream to triggering AI Energy Agent rules</p>
          </div>
        </div>

        {/* Feedback alert */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 light:bg-emerald-100 border border-emerald-500/40 light:border-emerald-300 text-emerald-300 light:text-emerald-800 text-xs flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 light:text-emerald-700 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/20 light:bg-rose-100 border border-rose-500/40 light:border-rose-300 text-rose-300 light:text-rose-800 text-xs flex items-center gap-2 font-semibold">
            <AlertCircle className="w-4 h-4 text-rose-400 light:text-rose-700 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Facility Select */}
          <div>
            <label className="block text-slate-300 light:text-slate-700 mb-1 font-bold">Select Target Facility</label>
            <select
              value={facilityId}
              onChange={(e) => setFacilityId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 light:bg-slate-100 border border-slate-700 light:border-slate-300 text-slate-200 light:text-slate-900 focus:outline-none focus:border-cyan-500 font-medium"
            >
              {facilities.map((fac) => (
                <option key={fac.facility_id} value={fac.facility_id}>
                  {fac.facility_name} ({fac.facility_id})
                </option>
              ))}
            </select>
          </div>

          {/* Grid fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 light:text-slate-600 mb-1 font-semibold">Electricity (kWh)</label>
              <input
                type="number"
                step="0.1"
                value={electricityKwh}
                onChange={(e) => setElectricityKwh(e.target.value)}
                required
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 light:bg-slate-100 border border-slate-700 light:border-slate-300 text-slate-100 light:text-slate-900 focus:border-cyan-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 light:text-slate-600 mb-1 font-semibold">HVAC (kWh)</label>
              <input
                type="number"
                step="0.1"
                value={hvacKwh}
                onChange={(e) => setHvacKwh(e.target.value)}
                required
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 light:bg-slate-100 border border-slate-700 light:border-slate-300 text-slate-100 light:text-slate-900 focus:border-cyan-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 light:text-slate-600 mb-1 font-semibold">Lighting (kWh)</label>
              <input
                type="number"
                step="0.1"
                value={lightingKwh}
                onChange={(e) => setLightingKwh(e.target.value)}
                required
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 light:bg-slate-100 border border-slate-700 light:border-slate-300 text-slate-100 light:text-slate-900 focus:border-cyan-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 light:text-slate-600 mb-1 font-semibold">Water (Liters)</label>
              <input
                type="number"
                step="0.1"
                value={waterLiters}
                onChange={(e) => setWaterLiters(e.target.value)}
                required
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 light:bg-slate-100 border border-slate-700 light:border-slate-300 text-slate-100 light:text-slate-900 focus:border-cyan-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 light:text-slate-600 mb-1 font-semibold">Solar Gen (kWh)</label>
              <input
                type="number"
                step="0.1"
                value={solarKwh}
                onChange={(e) => setSolarKwh(e.target.value)}
                required
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 light:bg-slate-100 border border-slate-700 light:border-slate-300 text-slate-100 light:text-slate-900 focus:border-cyan-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 light:text-slate-600 mb-1 font-semibold">Power Factor (0.00-1.00)</label>
              <input
                type="number"
                step="0.01"
                max="1.0"
                min="0.5"
                value={powerFactor}
                onChange={(e) => setPowerFactor(e.target.value)}
                required
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 light:bg-slate-100 border border-slate-700 light:border-slate-300 text-slate-100 light:text-slate-900 focus:border-cyan-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 light:text-slate-600 mb-1 font-semibold">Temperature (°C)</label>
              <input
                type="number"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                required
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 light:bg-slate-100 border border-slate-700 light:border-slate-300 text-slate-100 light:text-slate-900 focus:border-cyan-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 light:text-slate-600 mb-1 font-semibold">Humidity (%)</label>
              <input
                type="number"
                step="0.1"
                value={humidity}
                onChange={(e) => setHumidity(e.target.value)}
                required
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 light:bg-slate-100 border border-slate-700 light:border-slate-300 text-slate-100 light:text-slate-900 focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-800 light:border-slate-200">
            <button
              type="button"
              onClick={() => setIsIngestModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-400 light:text-slate-600 hover:text-slate-200 light:hover:text-slate-900 transition-colors font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-slate-950 hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Evaluating Stream...' : 'Submit & Trigger Agent'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
