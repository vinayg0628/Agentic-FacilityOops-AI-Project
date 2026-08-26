import React, { useState } from 'react';
import { useFacility } from '../context/FacilityContext';
import { GlassCard } from '../components/common/GlassCard';
import { 
  Settings, 
  Sun, 
  Moon, 
  Check,
  Zap,
  Wrench,
  Users,
  ShieldAlert,
  DollarSign,
  Palette
} from 'lucide-react';

export const SettingsPage = () => {
  const { theme, toggleTheme, triggerRefresh } = useFacility();
  const [activeTab, setActiveTab] = useState('Energy');
  const [saved, setSaved] = useState(false);

  // Energy Settings
  const [spikePercent, setSpikePercent] = useState('20');
  const [hvacPercent, setHvacPercent] = useState('50');
  const [minPf, setMinPf] = useState('0.90');

  // Maintenance Settings
  const [autoScheduleThreshold, setAutoScheduleThreshold] = useState('60');
  const [vibrationLimit, setVibrationLimit] = useState('4.5');
  const [thermalMargin, setThermalMargin] = useState('10');

  // Occupancy Settings
  const [ecoSetbackTemp, setEcoSetbackTemp] = useState('25.5');
  const [idleTime, setIdleTime] = useState('15');
  const [overcrowdLimit, setOvercrowdLimit] = useState('110');

  // Security Settings
  const [offHoursStart, setOffHoursStart] = useState('20:00');
  const [offHoursEnd, setOffHoursEnd] = useState('06:00');
  const [ghostLoadTolerance, setGhostLoadTolerance] = useState('5.0');

  // Cost Settings
  const [peakDemandLimit, setPeakDemandLimit] = useState('1500');
  const [sheddingPriority, setSheddingPriority] = useState('Decorative Lighting, Secondary Chillers');

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSaved(true);
    triggerRefresh();
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = [
    { id: 'Energy', icon: Zap, label: 'Energy AI' },
    { id: 'Maintenance', icon: Wrench, label: 'Maintenance' },
    { id: 'Occupancy', icon: Users, label: 'Occupancy' },
    { id: 'Security', icon: ShieldAlert, label: 'Security' },
    { id: 'Cost', icon: DollarSign, label: 'Cost/Tariff' },
    { id: 'General', icon: Palette, label: 'General' }
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 light:text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-cyan-400 light:text-cyan-600" />
          <span>Platform Settings & AI Rule Engine Controls</span>
        </h2>
        <p className="text-xs text-slate-400 light:text-slate-600 font-medium mt-1">
          Configure rule thresholds across all domain agents, simulator defaults, and theme preferences.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive 
                  ? 'bg-cyan-500/20 light:bg-cyan-100 text-cyan-400 light:text-cyan-700 border border-cyan-500/50 light:border-cyan-300' 
                  : 'bg-slate-900/50 light:bg-white text-slate-400 light:text-slate-600 border border-slate-800 light:border-slate-300 hover:bg-slate-800 light:hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        
        {/* ENERGY TAB */}
        {activeTab === 'Energy' && (
          <GlassCard title="Energy Agent Thresholds" subtitle="Logic thresholds for automated alert creation & baseline comparisons">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div>
                <label className="block text-slate-300 light:text-slate-700 font-bold mb-1">Elevated Spike Threshold (%)</label>
                <input type="number" value={spikePercent} onChange={(e) => setSpikePercent(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-900 light:bg-white border border-slate-700 light:border-slate-300 text-slate-100 light:text-slate-900 focus:border-cyan-500 font-mono" />
                <p className="text-[10px] text-slate-500 light:text-slate-500 mt-1">IF electricity &gt; {spikePercent}% above 7-day average</p>
              </div>
              <div>
                <label className="block text-slate-300 light:text-slate-700 font-bold mb-1">HVAC Overload Ratio (%)</label>
                <input type="number" value={hvacPercent} onChange={(e) => setHvacPercent(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-900 light:bg-white border border-slate-700 light:border-slate-300 text-slate-100 light:text-slate-900 focus:border-cyan-500 font-mono" />
                <p className="text-[10px] text-slate-500 light:text-slate-500 mt-1">IF HVAC kWh &gt; {hvacPercent}% of total facility load</p>
              </div>
              <div>
                <label className="block text-slate-300 light:text-slate-700 font-bold mb-1">Min Power Factor (cos φ)</label>
                <input type="number" step="0.01" max="1.0" value={minPf} onChange={(e) => setMinPf(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-900 light:bg-white border border-slate-700 light:border-slate-300 text-slate-100 light:text-slate-900 focus:border-cyan-500 font-mono" />
                <p className="text-[10px] text-slate-500 light:text-slate-500 mt-1">IF Power Factor &lt; {minPf} (utility surcharge)</p>
              </div>
            </div>
          </GlassCard>
        )}

        {/* MAINTENANCE TAB */}
        {activeTab === 'Maintenance' && (
          <GlassCard title="Predictive Maintenance Rules" subtitle="Automated RUL triggers and hardware safety limits">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div>
                <label className="block text-slate-300 light:text-slate-700 font-bold mb-1">Auto-Schedule Threshold (Health %)</label>
                <input type="number" value={autoScheduleThreshold} onChange={(e) => setAutoScheduleThreshold(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-900 light:bg-white border border-slate-700 light:border-slate-300 text-slate-100 light:text-slate-900 focus:border-cyan-500 font-mono" />
                <p className="text-[10px] text-slate-500 light:text-slate-500 mt-1">Generate work order if health &lt; {autoScheduleThreshold}%</p>
              </div>
              <div>
                <label className="block text-slate-300 light:text-slate-700 font-bold mb-1">Vibration Critical Limit (mm/s)</label>
                <input type="number" step="0.1" value={vibrationLimit} onChange={(e) => setVibrationLimit(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-900 light:bg-white border border-slate-700 light:border-slate-300 text-slate-100 light:text-slate-900 focus:border-cyan-500 font-mono" />
                <p className="text-[10px] text-slate-500 light:text-slate-500 mt-1">Trigger shutdown if vibration &gt; {vibrationLimit}</p>
              </div>
              <div>
                <label className="block text-slate-300 light:text-slate-700 font-bold mb-1">Thermal Warning Margin (°C)</label>
                <input type="number" value={thermalMargin} onChange={(e) => setThermalMargin(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-900 light:bg-white border border-slate-700 light:border-slate-300 text-slate-100 light:text-slate-900 focus:border-cyan-500 font-mono" />
                <p className="text-[10px] text-slate-500 light:text-slate-500 mt-1">Warn when within {thermalMargin}°C of failure max</p>
              </div>
            </div>
          </GlassCard>
        )}

        {/* OCCUPANCY TAB */}
        {activeTab === 'Occupancy' && (
          <GlassCard title="Space & Comfort Optimization" subtitle="Automated HVAC adjustments based on physical presence">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div>
                <label className="block text-slate-300 light:text-slate-700 font-bold mb-1">HVAC Eco-Setback Temp (°C)</label>
                <input type="number" step="0.5" value={ecoSetbackTemp} onChange={(e) => setEcoSetbackTemp(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-900 light:bg-white border border-slate-700 light:border-slate-300 text-slate-100 light:text-slate-900 focus:border-cyan-500 font-mono" />
                <p className="text-[10px] text-slate-500 light:text-slate-500 mt-1">Set to {ecoSetbackTemp}°C when zero occupancy</p>
              </div>
              <div>
                <label className="block text-slate-300 light:text-slate-700 font-bold mb-1">Idle Time Before Setback (Mins)</label>
                <input type="number" value={idleTime} onChange={(e) => setIdleTime(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-900 light:bg-white border border-slate-700 light:border-slate-300 text-slate-100 light:text-slate-900 focus:border-cyan-500 font-mono" />
                <p className="text-[10px] text-slate-500 light:text-slate-500 mt-1">Wait {idleTime} mins of empty room before eco mode</p>
              </div>
              <div>
                <label className="block text-slate-300 light:text-slate-700 font-bold mb-1">Overcrowding Alert Threshold (%)</label>
                <input type="number" value={overcrowdLimit} onChange={(e) => setOvercrowdLimit(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-900 light:bg-white border border-slate-700 light:border-slate-300 text-slate-100 light:text-slate-900 focus:border-cyan-500 font-mono" />
                <p className="text-[10px] text-slate-500 light:text-slate-500 mt-1">Safety alert if zone capacity &gt; {overcrowdLimit}%</p>
              </div>
            </div>
          </GlassCard>
        )}

        {/* SECURITY TAB */}
        {activeTab === 'Security' && (
          <GlassCard title="Anomaly & Security Intelligence" subtitle="Detecting unauthorized activity through cross-domain telemetry">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div>
                <label className="block text-slate-300 light:text-slate-700 font-bold mb-1">Off-Hours Start</label>
                <input type="time" value={offHoursStart} onChange={(e) => setOffHoursStart(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-900 light:bg-white border border-slate-700 light:border-slate-300 text-slate-100 light:text-slate-900 focus:border-cyan-500 font-mono" />
                <p className="text-[10px] text-slate-500 light:text-slate-500 mt-1">Begin strict monitoring schedule</p>
              </div>
              <div>
                <label className="block text-slate-300 light:text-slate-700 font-bold mb-1">Off-Hours End</label>
                <input type="time" value={offHoursEnd} onChange={(e) => setOffHoursEnd(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-900 light:bg-white border border-slate-700 light:border-slate-300 text-slate-100 light:text-slate-900 focus:border-cyan-500 font-mono" />
                <p className="text-[10px] text-slate-500 light:text-slate-500 mt-1">End strict monitoring schedule</p>
              </div>
              <div>
                <label className="block text-slate-300 light:text-slate-700 font-bold mb-1">Ghost-Load Tolerance (kW)</label>
                <input type="number" step="0.5" value={ghostLoadTolerance} onChange={(e) => setGhostLoadTolerance(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-900 light:bg-white border border-slate-700 light:border-slate-300 text-slate-100 light:text-slate-900 focus:border-cyan-500 font-mono" />
                <p className="text-[10px] text-slate-500 light:text-slate-500 mt-1">Flag intrusion if off-hours spike &gt; {ghostLoadTolerance} kW</p>
              </div>
            </div>
          </GlassCard>
        )}

        {/* COST TAB */}
        {activeTab === 'Cost' && (
          <GlassCard title="Financial Optimization & Tariffs" subtitle="Peak-demand shaving and utility cost reduction rules">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div>
                <label className="block text-slate-300 light:text-slate-700 font-bold mb-1">Peak Demand Limit Target (kW)</label>
                <input type="number" value={peakDemandLimit} onChange={(e) => setPeakDemandLimit(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-900 light:bg-white border border-slate-700 light:border-slate-300 text-slate-100 light:text-slate-900 focus:border-cyan-500 font-mono" />
                <p className="text-[10px] text-slate-500 light:text-slate-500 mt-1">Initiate load-shedding if grid pull exceeds {peakDemandLimit} kW</p>
              </div>
              <div>
                <label className="block text-slate-300 light:text-slate-700 font-bold mb-1">Load-Shedding Priority List</label>
                <input type="text" value={sheddingPriority} onChange={(e) => setSheddingPriority(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-900 light:bg-white border border-slate-700 light:border-slate-300 text-slate-100 light:text-slate-900 focus:border-cyan-500" />
                <p className="text-[10px] text-slate-500 light:text-slate-500 mt-1">Comma separated list of systems to shut down during peak events</p>
              </div>
            </div>
          </GlassCard>
        )}

        {/* GENERAL TAB */}
        {activeTab === 'General' && (
          <GlassCard title="Interface & Aesthetic Preferences" subtitle="Switch between Enterprise Dark mode and Crisp Light mode">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 light:bg-slate-100 border border-slate-800 light:border-slate-300">
              <div>
                <span className="font-bold text-slate-200 light:text-slate-900 text-xs block">Theme Palette Mode</span>
                <span className="text-[11px] text-slate-400 light:text-slate-600 font-medium">Currently active: <strong className="text-cyan-400 light:text-cyan-700 uppercase font-bold">{theme}</strong></span>
              </div>

              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 light:bg-white hover:bg-slate-700 light:hover:bg-slate-200 text-slate-200 light:text-slate-900 text-xs font-bold border border-slate-700 light:border-slate-300 shadow-sm transition-colors cursor-pointer"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>Switch to Light Theme</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-slate-700" />
                    <span>Switch to Dark Theme</span>
                  </>
                )}
              </button>
            </div>
          </GlassCard>
        )}

        {/* Global Save Button (Hidden on General tab) */}
        {activeTab !== 'General' && (
          <div className="pt-3 flex items-center justify-between border-t border-slate-800 light:border-slate-200">
            {saved ? (
              <span className="text-emerald-400 light:text-emerald-700 text-xs font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> Rules Updated Successfully!
              </span>
            ) : <span></span>}

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-bold text-slate-950 transition-all shadow-md shadow-cyan-500/20 cursor-pointer flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Save {activeTab} Configuration
            </button>
          </div>
        )}

      </form>
    </div>
  );
};
