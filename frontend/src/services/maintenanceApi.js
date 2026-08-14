import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';
const apiClient = axios.create({ baseURL: API_BASE_URL, headers: {'Content-Type': 'application/json'}, timeout: 15000 });

const MOCK_EQUIPMENT = [
  { id: 'EQ-001', name: 'Main HVAC Unit', type: 'HVAC', facility_id: 'FAC-01', health_score: 72, health_category: 'Warning', status: 'Active', last_check: '2026-07-28T10:00:00Z', metrics: { temp: 24.5, vibration: 0.12, runtime: 4500 } },
  { id: 'EQ-002', name: 'Backup Generator A', type: 'Generator', facility_id: 'FAC-01', health_score: 95, health_category: 'Excellent', status: 'Standby', last_check: '2026-07-27T08:30:00Z', metrics: { temp: 35.1, vibration: 0.05, runtime: 120 } },
  { id: 'EQ-003', name: 'Cooling Water Pump 1', type: 'Water Pump', facility_id: 'FAC-01', health_score: 45, health_category: 'Critical', status: 'Maintenance Required', last_check: '2026-07-28T14:15:00Z', metrics: { temp: 65.4, vibration: 0.45, runtime: 8500 } },
  { id: 'EQ-004', name: 'Passenger Elevator 3', type: 'Elevator', facility_id: 'FAC-01', health_score: 88, health_category: 'Good', status: 'Active', last_check: '2026-07-28T09:00:00Z', metrics: { temp: 22.0, vibration: 0.02, runtime: 12500 } },
  { id: 'EQ-005', name: 'Data Center UPS', type: 'UPS', facility_id: 'FAC-01', health_score: 91, health_category: 'Excellent', status: 'Active', last_check: '2026-07-28T18:00:00Z', metrics: { temp: 28.5, vibration: 0.01, runtime: 24000 } },
  { id: 'EQ-006', name: 'Step-down Transformer', type: 'Transformer', facility_id: 'FAC-01', health_score: 68, health_category: 'Warning', status: 'Active', last_check: '2026-07-26T11:45:00Z', metrics: { temp: 55.2, vibration: 0.08, runtime: 45000 } },
  { id: 'EQ-007', name: 'Roof Chiller Unit', type: 'Chiller', facility_id: 'FAC-01', health_score: 82, health_category: 'Good', status: 'Active', last_check: '2026-07-28T13:20:00Z', metrics: { temp: 18.5, vibration: 0.15, runtime: 3200 } },
  { id: 'EQ-008', name: 'Industrial Air Compressor', type: 'Air Compressor', facility_id: 'FAC-01', health_score: 35, health_category: 'Immediate Maintenance', status: 'Offline', last_check: '2026-07-28T16:00:00Z', metrics: { temp: 85.0, vibration: 0.85, runtime: 9800 } },
  { id: 'EQ-009', name: 'Floor 2 Lighting Panel', type: 'Lighting Panel', facility_id: 'FAC-01', health_score: 98, health_category: 'Excellent', status: 'Active', last_check: '2026-07-28T17:30:00Z', metrics: { temp: 25.0, vibration: 0.0, runtime: 56000 } }
];

const MOCK_ANALYTICS = {
  total_equipment: 45,
  healthy_equipment_count: 31,
  warning_equipment_count: 9,
  critical_equipment_count: 5,
  average_health_score: 78.4,
  maintenance_due_today_count: 3,
  open_alerts_count: 12,
  critical_alerts_count: 3,
  equipment_health_list: MOCK_EQUIPMENT.map(e => ({ id: e.id, name: e.name, score: e.health_score })),
  equipment_status_distribution: { Excellent: 18, Good: 13, Warning: 9, Critical: 4, Immediate_Maintenance: 1 },
  monthly_maintenance_cost: [
    { month: 'Feb', cost: 12500 }, { month: 'Mar', cost: 14200 }, { month: 'Apr', cost: 9800 },
    { month: 'May', cost: 18500 }, { month: 'Jun', cost: 11000 }, { month: 'Jul', cost: 15300 }
  ],
  upcoming_schedule: [
    { id: 'SCH-01', equipment: 'Main HVAC Unit', date: '2026-07-29', priority: 'High', status: 'Scheduled' },
    { id: 'SCH-02', equipment: 'Cooling Water Pump 1', date: '2026-07-30', priority: 'Critical', status: 'Scheduled' },
    { id: 'SCH-03', equipment: 'Roof Chiller Unit', date: '2026-08-05', priority: 'Medium', status: 'Scheduled' },
    { id: 'SCH-04', equipment: 'Step-down Transformer', date: '2026-08-12', priority: 'Medium', status: 'Scheduled' }
  ],
  recent_alerts: [
    { id: 'ALT-01', equipment: 'Cooling Water Pump 1', severity: 'Critical', issue: 'High Vibration Detected', status: 'Open', timestamp: '2026-07-28T14:15:00Z' },
    { id: 'ALT-02', equipment: 'Industrial Air Compressor', severity: 'Critical', issue: 'Temperature Exceeded Limit', status: 'Acknowledged', timestamp: '2026-07-28T16:00:00Z' },
    { id: 'ALT-03', equipment: 'Main HVAC Unit', severity: 'Warning', issue: 'Filter Pressure Drop', status: 'Open', timestamp: '2026-07-28T10:00:00Z' },
    { id: 'ALT-04', equipment: 'Step-down Transformer', severity: 'Warning', issue: 'Minor Oil Leak', status: 'Resolved', timestamp: '2026-07-26T11:45:00Z' }
  ],
  failure_probability: [
    { equipment: 'Main HVAC Unit', probability: 28 },
    { equipment: 'Cooling Water Pump 1', probability: 85 },
    { equipment: 'Industrial Air Compressor', probability: 95 },
    { equipment: 'Step-down Transformer', probability: 42 },
    { equipment: 'Roof Chiller Unit', probability: 15 }
  ],
  ai_recommendations: [
    { id: 'REC-01', priority: 'High', action: 'Replace Bearings on Water Pump 1', reason: 'Vibration trend indicates bearing failure within 72 hours.', estimated_cost_usd: 1200, estimated_downtime_hours: 4, expected_benefit: 'Prevent catastrophic failure saving $8500' },
    { id: 'REC-02', priority: 'Medium', action: 'Schedule HVAC Filter Replacement', reason: 'Pressure drop exceeding nominal threshold by 15%.', estimated_cost_usd: 150, estimated_downtime_hours: 1, expected_benefit: 'Improve energy efficiency by 8%' }
  ]
};

const MOCK_HEALTH_SCORES = MOCK_EQUIPMENT;

const MOCK_PREDICTIONS = MOCK_EQUIPMENT.map(e => ({
  ...e,
  risk_score: 100 - e.health_score,
  predicted_failure_date: new Date(Date.now() + (e.health_score * 24 * 60 * 60 * 1000)).toISOString(),
  remaining_useful_life: Math.floor(e.health_score * 1.5)
}));

const MOCK_SCHEDULE = [
  { id: 'SCH-01', equipment: 'Main HVAC Unit', type: 'HVAC', maintenance_type: 'Preventive', scheduled_date: '2026-07-29', priority: 'High', engineer: 'John Doe', status: 'Scheduled', est_duration: 2, est_cost: 350 },
  { id: 'SCH-02', equipment: 'Cooling Water Pump 1', type: 'Water Pump', maintenance_type: 'Corrective', scheduled_date: '2026-07-28', priority: 'Critical', engineer: 'Jane Smith', status: 'In Progress', est_duration: 4, est_cost: 1200 },
  { id: 'SCH-03', equipment: 'Roof Chiller Unit', type: 'Chiller', maintenance_type: 'Inspection', scheduled_date: '2026-08-05', priority: 'Medium', engineer: 'Mike Johnson', status: 'Scheduled', est_duration: 1.5, est_cost: 200 },
  { id: 'SCH-04', equipment: 'Step-down Transformer', type: 'Transformer', maintenance_type: 'Preventive', scheduled_date: '2026-07-20', priority: 'Medium', engineer: 'Sarah Williams', status: 'Overdue', est_duration: 3, est_cost: 800 }
];

const MOCK_ALERTS = MOCK_ANALYTICS.recent_alerts;

export const fetchEquipmentList = async (facilityId = 'ALL', equipmentType = 'ALL', status = 'ALL') => {
  try {
    const res = await apiClient.get('/equipment', { params: { facility_id: facilityId, equipment_type: equipmentType, status } });
    return res.data;
  } catch (error) {
    console.warn('Using mock equipment list data');
    let filtered = MOCK_EQUIPMENT;
    if (equipmentType !== 'ALL') filtered = filtered.filter(e => e.type === equipmentType);
    if (status !== 'ALL') filtered = filtered.filter(e => e.status === status);
    return filtered;
  }
};

export const fetchEquipmentDetail = async (equipmentId) => {
  try {
    const res = await apiClient.get(`/equipment/${equipmentId}`);
    return res.data;
  } catch (error) {
    console.warn('Using mock equipment detail data');
    return MOCK_EQUIPMENT.find(e => e.id === equipmentId) || null;
  }
};

export const createEquipment = async (payload) => {
  try {
    const res = await apiClient.post('/equipment', payload);
    return res.data;
  } catch (error) {
    console.warn('Mock create equipment');
    return { ...payload, id: `EQ-${Math.floor(Math.random() * 1000)}` };
  }
};

export const updateEquipment = async (equipmentId, payload) => {
  try {
    const res = await apiClient.patch(`/equipment/${equipmentId}`, payload);
    return res.data;
  } catch (error) {
    console.warn('Mock update equipment');
    return { ...MOCK_EQUIPMENT.find(e => e.id === equipmentId), ...payload };
  }
};

export const deleteEquipment = async (equipmentId) => {
  try {
    const res = await apiClient.delete(`/equipment/${equipmentId}`);
    return res.data;
  } catch (error) {
    console.warn('Mock delete equipment');
    return { success: true };
  }
};

export const fetchMaintenanceAnalytics = async (facilityId = 'ALL') => {
  try {
    const params = {};
    if (facilityId && facilityId !== 'ALL') params.facility_id = facilityId;
    const res = await apiClient.get('/maintenance/analytics', { params });
    return res.data;
  } catch (error) {
    console.warn('Using mock analytics data');
    return MOCK_ANALYTICS;
  }
};

export const fetchHealthScores = async (facilityId = 'ALL') => {
  try {
    const params = {};
    if (facilityId && facilityId !== 'ALL') params.facility_id = facilityId;
    const res = await apiClient.get('/maintenance/health-score', { params });
    return res.data;
  } catch (error) {
    console.warn('Using mock health scores');
    return MOCK_HEALTH_SCORES;
  }
};

export const fetchPredictions = async (facilityId = 'ALL') => {
  try {
    const params = {};
    if (facilityId && facilityId !== 'ALL') params.facility_id = facilityId;
    const res = await apiClient.get('/maintenance/predictions', { params });

    return (Array.isArray(res.data) ? res.data : []).map(item => ({
      id: item.id ?? item.equipment_id ?? item.name ?? 'unknown',
      name: item.name ?? item.equipment_name ?? 'Unknown',
      type: item.type ?? item.equipment_type ?? 'Equipment',
      risk_score: Number(item.risk_score ?? item.failure_probability_pct ?? 0),
      health_score: Number(item.health_score ?? (100 - (item.risk_score ?? item.failure_probability_pct ?? 0))),
      predicted_failure_date: item.predicted_failure_date ?? new Date().toISOString(),
      remaining_useful_life: Number(item.remaining_useful_life ?? item.rul_days ?? 0),
    }));
  } catch (error) {
    console.warn('Using mock predictions');
    return MOCK_PREDICTIONS;
  }
};

export const fetchMaintenanceSchedule = async (equipmentId = null, status = 'ALL', priority = 'ALL') => {
  try {
    const params = {};
    if (equipmentId) params.equipment_id = equipmentId;
    if (status !== 'ALL') params.status = status;
    if (priority !== 'ALL') params.priority = priority;
    const res = await apiClient.get('/maintenance/schedule', { params });

    return (Array.isArray(res.data) ? res.data : []).map(item => ({
      id: item.schedule_id ?? item.id,
      equipment: item.equipment_name ?? item.equipment ?? 'Unknown',
      type: item.equipment_type ?? item.type ?? 'Equipment',
      maintenance_type: item.maintenance_type ?? 'Preventive',
      scheduled_date: item.next_service_date ?? item.scheduled_date ?? '',
      priority: item.priority ?? 'Medium',
      engineer: item.assigned_engineer ?? item.engineer ?? 'Unassigned',
      status: item.status ?? 'Scheduled',
      est_duration: item.estimated_duration_hours ?? item.est_duration ?? 0,
      est_cost: item.estimated_cost_usd ?? item.est_cost ?? 0,
    }));
  } catch (error) {
    console.warn('Using mock schedule');
    let filtered = MOCK_SCHEDULE;
    if (equipmentId) filtered = filtered.filter(s => s.equipment_id === equipmentId);
    if (status !== 'ALL') filtered = filtered.filter(s => s.status === status);
    if (priority !== 'ALL') filtered = filtered.filter(s => s.priority === priority);
    return filtered;
  }
};

export const fetchMaintenanceAlerts = async (equipmentId = null, severity = 'ALL', status = 'ALL') => {
  try {
    const params = {};
    if (equipmentId) params.equipment_id = equipmentId;
    if (severity !== 'ALL') params.severity = severity;
    if (status !== 'ALL') params.status = status;
    const res = await apiClient.get('/maintenance/alerts', { params });
    return res.data;
  } catch (error) {
    console.warn('Using mock alerts');
    let filtered = MOCK_ALERTS;
    if (equipmentId) filtered = filtered.filter(a => a.equipment_id === equipmentId);
    if (severity !== 'ALL') filtered = filtered.filter(a => a.severity === severity);
    if (status !== 'ALL') filtered = filtered.filter(a => a.status === status);
    return filtered;
  }
};

export const updateAlertStatus = async (alertId, newStatus) => {
  try {
    const res = await apiClient.patch(`/maintenance/alerts/${alertId}/status`, { status: newStatus });
    return res.data;
  } catch (error) {
    console.warn('Mock update alert status');
    return { success: true };
  }
};

export const updateScheduleStatus = async (scheduleId, newStatus) => {
  try {
    const res = await apiClient.patch(`/maintenance/schedule/${scheduleId}/status`, { status: newStatus });
    return res.data;
  } catch (error) {
    console.warn('Mock update schedule status');
    return { success: true };
  }
};

export const fetchMaintenanceRecommendations = async (facilityId = 'ALL') => {
  try {
    const params = {};
    if (facilityId && facilityId !== 'ALL') params.facility_id = facilityId;
    const res = await apiClient.get('/maintenance/recommendations', { params });
    return res.data;
  } catch (error) {
    console.warn('Using mock recommendations');
    return MOCK_ANALYTICS.ai_recommendations;
  }
};
