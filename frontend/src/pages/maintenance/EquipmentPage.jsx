import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, LayoutGrid, List } from 'lucide-react';
import { useFacility } from '../../context/FacilityContext';
import { fetchEquipmentList } from '../../services/maintenanceApi';
import { EquipmentCard } from '../../components/maintenance/EquipmentCard';
import { RiskBadge } from '../../components/maintenance/RiskBadge';

export const EquipmentPage = () => {
  const { selectedFacilityId } = useFacility();
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // grid | table
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    const loadEquipment = async () => {
      setLoading(true);
      try {
        const data = await fetchEquipmentList(selectedFacilityId, 'ALL', 'ALL');
        setEquipmentList(data);
      } catch (error) {
        console.error("Failed to fetch equipment", error);
      }
      setLoading(false);
    };
    loadEquipment();
  }, [selectedFacilityId]);

  // Normalize fields — supports real API (equipment_name, equipment_type, equipment_id)
  // and mock data (name, type, id)
  const normalized = equipmentList.map(eq => ({
    ...eq,
    _id:   eq.equipment_id   ?? eq.id,
    _name: eq.equipment_name ?? eq.name ?? '',
    _type: eq.equipment_type ?? eq.type ?? '',
    _status: eq.status ?? 'Operational',
  }));

  const filteredList = normalized.filter(eq => {
    const matchesSearch = eq._name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          eq._type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || eq._type === filterType;
    const matchesStatus = filterStatus === 'ALL' || eq._status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Get unique types and statuses for filter dropdowns
  const uniqueTypes = ['ALL', ...new Set(normalized.map(eq => eq._type))];
  const uniqueStatuses = ['ALL', ...new Set(normalized.map(eq => eq._status))];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Equipment Inventory</h1>
          <p className="text-slate-400 text-sm mt-1">Manage and monitor all facility assets</p>
        </div>
        <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-cyan-900/20">
          <Plus className="w-4 h-4" /> Add Equipment
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search equipment..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-xl pl-9 pr-4 py-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-xl transition-colors border border-slate-700"
            >
              <Filter className="w-4 h-4" /> Filters {(filterType !== 'ALL' || filterStatus !== 'ALL') && <span className="ml-1 text-cyan-400 font-bold">●</span>}
            </button>
            {showFilters && (
              <div className="absolute top-full mt-2 right-0 bg-slate-900 border border-slate-700 rounded-xl shadow-lg z-50 w-64 p-4 space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 font-bold mb-2">Equipment Type</label>
                  <select 
                    value={filterType} 
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                  >
                    {uniqueTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 font-bold mb-2">Status</label>
                  <select 
                    value={filterStatus} 
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                  >
                    {uniqueStatuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <button 
                  onClick={() => { setFilterType('ALL'); setFilterStatus('ALL'); }}
                  className="w-full px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold rounded-lg transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
          <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-slate-800 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-slate-800 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(6)].map((_, i) => <div key={i} className="h-48 bg-slate-800/50 rounded-2xl"></div>)}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredList.map(eq => (
            <EquipmentCard key={eq._id} equipment={eq} />
          ))}
        </div>
      ) : (
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-xs text-slate-400 uppercase border-b border-slate-800">
                  <th className="p-4 font-medium">ID</th>
                  <th className="p-4 font-medium">Equipment Name</th>
                  <th className="p-4 font-medium">Type</th>
                  <th className="p-4 font-medium">Facility</th>
                  <th className="p-4 font-medium">Health</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map(eq => (
                  <tr key={eq._id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 text-sm text-slate-500 font-mono">{eq._id}</td>
                    <td className="p-4 text-sm font-bold text-slate-200">{eq._name}</td>
                    <td className="p-4 text-sm text-slate-400">{eq._type}</td>
                    <td className="p-4 text-sm text-slate-400">{eq.facility_name || 'Unknown'}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-bold ${eq.health_score > 75 ? 'text-emerald-400' : eq.health_score > 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                          {eq.health_score}
                        </span>
                        <RiskBadge level={eq.health_category} />
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-300">{eq.status}</td>
                    <td className="p-4 text-right">
                      <button className="text-cyan-400 hover:text-cyan-300 text-xs font-bold transition-colors">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
