import React from 'react';
import { Wind, Zap, Droplets, Building2, Activity } from 'lucide-react';
import { HealthScoreGauge } from './HealthScoreGauge';
import { RiskBadge } from './RiskBadge';

export const EquipmentCard = ({ equipment, onClick }) => {
  const getIcon = (type) => {
    switch(type) {
      case 'HVAC':
      case 'Chiller': return Wind;
      case 'Generator':
      case 'Transformer':
      case 'UPS':
      case 'Lighting Panel': return Zap;
      case 'Water Pump':
      case 'Air Compressor': return Droplets;
      case 'Elevator': return Building2;
      default: return Activity;
    }
  };

  // Normalize: real API uses equipment_name/equipment_type; mock uses name/type
  const name  = equipment.equipment_name ?? equipment.name  ?? 'Unknown';
  const type  = equipment.equipment_type ?? equipment.type  ?? 'Unknown';

  const Icon = getIcon(type);

  const getBorderColor = (score) => {
    if (score < 40) return 'border-l-rose-500';
    if (score < 60) return 'border-l-orange-500';
    if (score < 75) return 'border-l-amber-500';
    if (score < 90) return 'border-l-cyan-500';
    return 'border-l-emerald-500';
  };

  return (
    <div 
      onClick={() => onClick && onClick(equipment)}
      className={`bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 ${getBorderColor(equipment.health_score)} border-l-4 p-5 hover:bg-slate-800/80 transition-all cursor-pointer group`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-800 rounded-lg text-slate-300 group-hover:text-cyan-400 transition-colors">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-slate-100 font-bold text-sm truncate max-w-[150px]">{name}</h4>
            <p className="text-slate-500 text-xs">{type}</p>
          </div>
        </div>
        <HealthScoreGauge score={equipment.health_score} size="sm" showLabel={false} />
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400">Status</span>
          <span className="text-slate-200 font-medium">{equipment.status}</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400">Risk Level</span>
          <RiskBadge level={equipment.health_category} size="sm" />
        </div>
        
        <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-800/50">
          <div className="bg-slate-950/50 p-2 rounded-lg text-center">
            <div className="text-[10px] text-slate-500 mb-1">Temp</div>
            <div className="text-xs text-slate-300 font-mono">{equipment.metrics?.temp || '--'} °C</div>
          </div>
          <div className="bg-slate-950/50 p-2 rounded-lg text-center">
            <div className="text-[10px] text-slate-500 mb-1">Vibration</div>
            <div className="text-xs text-slate-300 font-mono">{equipment.metrics?.vibration || '--'} mm/s</div>
          </div>
        </div>
        
        <button className="w-full mt-2 py-2 bg-slate-800 hover:bg-cyan-900/40 text-cyan-400 text-xs font-bold rounded-lg transition-colors border border-transparent hover:border-cyan-500/30">
          View Details
        </button>
      </div>
    </div>
  );
};
