import React, { useState } from 'react';
import { useFacility } from '../context/FacilityContext';
import { GlassCard } from '../components/common/GlassCard';
import { 
  Settings, 
  Sun, 
  Moon, 
  Check
} from 'lucide-react';

export const SettingsPage = () => {
  const { theme, toggleTheme, triggerRefresh } = useFacility();

  const [spikePercent, setSpikePercent] = useState('20');
  const [hvacPercent, setHvacPercent] = useState('50');
  const [minPf, setMinPf] = useState('0.90');
  const [saved, setSaved] = useState(false);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSaved(true);
    triggerRefresh();
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 light:text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-cyan-400 light:text-cyan-600" />
          <span>Platform Settings & AI Rule Engine Controls</span>
        </h2>
        <p className="text-xs text-slate-400 light:text-slate-600 font-medium mt-1">
          Configure rule thresholds for the Energy Agent, simulator defaults, and theme preferences.
        </p>
      </div>

      {/* Form Card 1: Energy Agent Rule Parameters */}
      <GlassCard title="Energy AI Agent Threshold Rules" subtitle="Logic thresholds for automated alert creation & baseline comparisons">
        <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 light:text-slate-700 font-bold mb-1">
                Elevated Spike Threshold (%)
              </label>
              <input
                type="number"
                value={spikePercent}
                onChange={(e) => setSpikePercent(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 light:bg-white border border-slate-700 light:border-slate-300 text-slate-100 light:text-slate-900 focus:border-cyan-500 font-mono shadow-sm"
              />
              <p className="text-[10px] text-slate-500 light:text-slate-600 font-medium mt-1">IF electricity &gt; {spikePercent}% above 7-day average</p>
            </div>

            <div>
              <label className="block text-slate-300 light:text-slate-700 font-bold mb-1">
                HVAC Overload Ratio (%)
              </label>
              <input
                type="number"
                value={hvacPercent}
                onChange={(e) => setHvacPercent(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 light:bg-white border border-slate-700 light:border-slate-300 text-slate-100 light:text-slate-900 focus:border-cyan-500 font-mono shadow-sm"
              />
              <p className="text-[10px] text-slate-500 light:text-slate-600 font-medium mt-1">IF HVAC kWh &gt; {hvacPercent}% of total facility load</p>
            </div>

            <div>
              <label className="block text-slate-300 light:text-slate-700 font-bold mb-1">
                Min Power Factor (cos φ)
              </label>
              <input
                type="number"
                step="0.01"
                max="1.0"
                value={minPf}
                onChange={(e) => setMinPf(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 light:bg-white border border-slate-700 light:border-slate-300 text-slate-100 light:text-slate-900 focus:border-cyan-500 font-mono shadow-sm"
              />
              <p className="text-[10px] text-slate-500 light:text-slate-600 font-medium mt-1">IF Power Factor &lt; {minPf} (utility surcharge)</p>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between border-t border-slate-800 light:border-slate-200">
            {saved ? (
              <span className="text-emerald-400 light:text-emerald-700 text-xs font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> Agent Rules Updated!
              </span>
            ) : <span></span>}

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-bold text-slate-950 transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
            >
              Save Rule Configuration
            </button>
          </div>

        </form>
      </GlassCard>

      {/* Card 2: Visual Theme & Interface */}
      <GlassCard title="Interface & Aesthetic Preferences" subtitle="Switch between Enterprise Dark mode and Crisp Light mode">
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 light:bg-slate-100 border border-slate-800 light:border-slate-300">
          <div>
            <span className="font-bold text-slate-200 light:text-slate-900 text-xs block">Theme Palette Mode</span>
            <span className="text-[11px] text-slate-400 light:text-slate-600 font-medium">Currently active: <strong className="text-cyan-400 light:text-cyan-700 uppercase font-bold">{theme}</strong></span>
          </div>

          <button
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

      {/* Card 3: Platform Architecture & Roadmap */}
      <GlassCard title="Platform Architectural Roadmap" subtitle="Module status and future capabilities">
        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-xl bg-cyan-950/30 light:bg-cyan-50 border border-cyan-800/60 light:border-cyan-200 text-cyan-300 light:text-cyan-900 flex items-center justify-between">
            <span className="font-bold">Energy Intelligence & Monitoring</span>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 light:bg-cyan-200 text-cyan-200 light:text-cyan-800 text-[10px] font-mono border border-cyan-500/40 light:border-cyan-300 font-bold uppercase">ACTIVE</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 light:bg-slate-100 border border-slate-800 light:border-slate-300 text-slate-400 light:text-slate-700 font-medium flex items-center justify-between">
            <span>Predictive Maintenance Intelligence</span>
            <span className="text-[10px] font-mono text-slate-500 light:text-slate-600 font-bold">UPCOMING</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 light:bg-slate-100 border border-slate-800 light:border-slate-300 text-slate-400 light:text-slate-700 font-medium flex items-center justify-between">
            <span>Occupancy & Space Optimization</span>
            <span className="text-[10px] font-mono text-slate-500 light:text-slate-600 font-bold">UPCOMING</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 light:bg-slate-100 border border-slate-800 light:border-slate-300 text-slate-400 light:text-slate-700 font-medium flex items-center justify-between">
            <span>Security & Cost Intelligence</span>
            <span className="text-[10px] font-mono text-slate-500 light:text-slate-600 font-bold">UPCOMING</span>
          </div>
        </div>
      </GlassCard>

    </div>
  );
};
