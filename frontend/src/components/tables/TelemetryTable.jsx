import React from 'react';

export const TelemetryTable = ({ telemetry = [] }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs text-slate-300">
        <thead className="bg-slate-900/60 uppercase text-slate-400 font-semibold border-b border-slate-800">
          <tr>
            <th className="py-3 px-4">Facility ID</th>
            <th className="py-3 px-4">Timestamp</th>
            <th className="py-3 px-4">Power (kWh)</th>
            <th className="py-3 px-4">HVAC (kWh)</th>
            <th className="py-3 px-4">Lighting (kWh)</th>
            <th className="py-3 px-4">Solar (kWh)</th>
            <th className="py-3 px-4">Power Factor</th>
            <th className="py-3 px-4">Temp (°C)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 font-mono">
          {telemetry.length === 0 ? (
            <tr>
              <td colSpan="8" className="py-8 text-center text-slate-500 font-sans font-medium">
                No telemetry readings recorded.
              </td>
            </tr>
          ) : (
            telemetry.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4 font-sans font-bold text-cyan-400">{row.facility_id}</td>
                <td className="py-3 px-4 text-slate-400">{row.timestamp}</td>
                <td className="py-3 px-4 text-slate-100 font-bold">{row.electricity_kwh}</td>
                <td className="py-3 px-4 text-slate-300">{row.hvac_kwh}</td>
                <td className="py-3 px-4 text-slate-300">{row.lighting_kwh}</td>
                <td className="py-3 px-4 text-emerald-400">{row.solar_generation_kwh}</td>
                <td className="py-3 px-4 text-amber-400">{row.power_factor}</td>
                <td className="py-3 px-4 text-slate-200">{row.temperature}°C</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
