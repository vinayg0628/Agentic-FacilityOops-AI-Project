import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Fallback Mock Data for instant UI preview if backend server is connecting
const MOCK_FACILITIES = [
  { facility_id: 'FAC-001', facility_name: 'CyberTech IT Park', facility_type: 'IT Park', city: 'San Jose', state: 'CA', total_floors: 12, total_area_sqft: 450000 },
  { facility_id: 'FAC-002', facility_name: 'St. Jude General Hospital', facility_type: 'Hospital', city: 'Chicago', state: 'IL', total_floors: 8, total_area_sqft: 320000 },
  { facility_id: 'FAC-003', facility_name: 'Pacific Innovation University', facility_type: 'University', city: 'Seattle', state: 'WA', total_floors: 15, total_area_sqft: 600000 },
  { facility_id: 'FAC-004', facility_name: 'Grand Horizon Shopping Mall', facility_type: 'Shopping Mall', city: 'Dallas', state: 'TX', total_floors: 4, total_area_sqft: 520000 },
  { facility_id: 'FAC-005', facility_name: 'Apex Precision Factory', facility_type: 'Factory', city: 'Detroit', state: 'MI', total_floors: 2, total_area_sqft: 280000 }
];

export const fetchFacilities = async () => {
  try {
    const res = await apiClient.get('/facilities');
    return res.data;
  } catch (err) {
    console.warn('API connection offline, using fallback facilities data:', err.message);
    return MOCK_FACILITIES;
  }
};

export const fetchEnergyTelemetry = async (facilityId = 'ALL', limit = 200) => {
  try {
    const params = { limit };
    if (facilityId && facilityId !== 'ALL') params.facility_id = facilityId;
    const res = await apiClient.get('/energy', { params });
    return res.data;
  } catch (err) {
    console.warn('API fallback for energy telemetry');
    return generateMockEnergyRecords(facilityId, limit);
  }
};

export const fetchEnergyData = fetchEnergyTelemetry;

export const fetchAnalyticsSummary = async (facilityId = 'ALL', startDate = null, endDate = null) => {
  try {
    const params = {};
    if (facilityId && facilityId !== 'ALL') params.facility_id = facilityId;
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const res = await apiClient.get('/analytics', { params });
    return res.data;
  } catch (err) {
    console.warn('API fallback for analytics summary');
    return generateMockAnalytics(facilityId);
  }
};

export const fetchAnalytics = fetchAnalyticsSummary;
export const fetchExecutiveSummary = fetchAnalyticsSummary;

export const fetchAlerts = async (facilityId = 'ALL', severity = 'ALL', status = 'ALL') => {
  try {
    const params = {};
    if (facilityId && facilityId !== 'ALL') params.facility_id = facilityId;
    if (severity && severity !== 'ALL') params.severity = severity;
    if (status && status !== 'ALL') params.status = status;
    const res = await apiClient.get('/alerts', { params });
    return res.data;
  } catch (err) {
    console.warn('API fallback for alerts');
    return generateMockAlerts(facilityId);
  }
};

export const updateAlertStatus = async (alertId, newStatus) => {
  try {
    const res = await apiClient.patch(`/alerts/${alertId}/status`, { status: newStatus });
    return res.data;
  } catch (err) {
    console.warn('API fallback alert status update');
    return { alert_id: alertId, status: newStatus };
  }
};

export const fetchRecommendations = async (facilityId = 'ALL') => {
  try {
    const params = {};
    if (facilityId && facilityId !== 'ALL') params.facility_id = facilityId;
    const res = await apiClient.get('/recommendations', { params });
    return res.data;
  } catch (err) {
    console.warn('API fallback for recommendations');
    return generateMockRecommendations(facilityId);
  }
};

export const createEnergyReading = async (payload) => {
  try {
    const res = await apiClient.post('/energy', payload);
    return res.data;
  } catch (err) {
    console.error('Failed to post energy reading:', err);
    throw err;
  }
};

export const getExportUrl = (format, facilityId = 'ALL') => {
  const fac = facilityId || 'ALL';
  return `${API_BASE_URL}/export/${format}?facility_id=${fac}`;
};

// Helpers for mock generator when backend is starting
function generateMockAnalytics(facId) {
  const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
  return {
    total_electricity_kwh: 48520.5,
    today_electricity_kwh: 3420.8,
    yesterday_electricity_kwh: 3180.2,
    electricity_change_pct: 7.56,
    today_water_liters: 8240.0,
    hvac_total_kwh: 23150.4,
    lighting_total_kwh: 9840.2,
    solar_total_kwh: 4120.0,
    active_alerts_count: 5,
    critical_alerts_count: 1,
    energy_efficiency_score: 86.4,
    carbon_emissions_ton_co2: 39.78,
    average_hourly_kwh: 142.5,
    peak_consumption_hour: "14:00 - 15:00",
    peak_consumption_kwh: 485.2,
    hourly_trend: hours.map(h => ({
      hour: h,
      electricity_kwh: Math.round(120 + Math.sin(parseInt(h) / 24 * Math.PI * 2) * 80 + Math.random() * 20),
      hvac_kwh: Math.round(60 + Math.sin(parseInt(h) / 24 * Math.PI * 2) * 45 + Math.random() * 10),
      lighting_kwh: Math.round(25 + Math.random() * 10),
      solar_kwh: parseInt(h) >= 7 && parseInt(h) <= 18 ? Math.round(Math.sin((parseInt(h)-7)/11 * Math.PI) * 60) : 0,
      water_liters: Math.round(300 + Math.random() * 100)
    })),
    daily_trend: [
      { date: "2026-07-18", electricity_kwh: 3100, water_liters: 7800, hvac_kwh: 1480, solar_kwh: 580 },
      { date: "2026-07-19", electricity_kwh: 2950, water_liters: 7200, hvac_kwh: 1390, solar_kwh: 610 },
      { date: "2026-07-20", electricity_kwh: 3450, water_liters: 8100, hvac_kwh: 1650, solar_kwh: 590 },
      { date: "2026-07-21", electricity_kwh: 3380, water_liters: 7950, hvac_kwh: 1610, solar_kwh: 640 },
      { date: "2026-07-22", electricity_kwh: 3510, water_liters: 8300, hvac_kwh: 1720, solar_kwh: 570 },
      { date: "2026-07-23", electricity_kwh: 3180, water_liters: 7600, hvac_kwh: 1520, solar_kwh: 620 },
      { date: "2026-07-24", electricity_kwh: 3420, water_liters: 8240, hvac_kwh: 1680, solar_kwh: 600 }
    ],
    monthly_trend: Array.from({ length: 30 }, (_, i) => ({
      date: `2026-07-${(i + 1).toString().padStart(2, '0')}`,
      electricity_kwh: Math.round(3000 + Math.random() * 600),
      water_liters: Math.round(7500 + Math.random() * 1200),
      hvac_kwh: Math.round(1400 + Math.random() * 300),
      solar_kwh: Math.round(500 + Math.random() * 150)
    })),
    category_breakdown: [
      { category: "HVAC", kwh: 23150.4, percentage: 47.7 },
      { category: "Lighting", kwh: 9840.2, percentage: 20.3 },
      { category: "Equipment & Plug Loads", kwh: 11410.0, percentage: 23.5 },
      { category: "Solar Offsetting", kwh: 4120.0, percentage: 8.5 }
    ],
    facility_comparison: MOCK_FACILITIES.map(f => ({
      facility_id: f.facility_id,
      facility_name: f.facility_name,
      facility_type: f.facility_type,
      electricity_kwh: Math.round(7000 + Math.random() * 4000),
      water_liters: Math.round(15000 + Math.random() * 5000),
      efficiency_score: Math.round(78 + Math.random() * 18),
      carbon_emissions_kg: Math.round(6000 + Math.random() * 3000)
    })),
    peak_hours: hours.map((h, idx) => ({
      hour: idx,
      hour_label: h,
      avg_kwh: Math.round(100 + Math.sin(idx / 24 * Math.PI * 2) * 80),
      is_peak: idx >= 13 && idx <= 16
    }))
  };
}

function generateMockEnergyRecords(facId, limit) {
  return Array.from({ length: Math.min(limit, 50) }, (_, i) => ({
    energy_id: 1000 + i,
    facility_id: facId !== 'ALL' ? facId : MOCK_FACILITIES[i % 5].facility_id,
    timestamp: new Date(Date.now() - i * 3600000).toISOString(),
    electricity_kwh: Math.round(280 + Math.random() * 150),
    water_liters: Math.round(600 + Math.random() * 300),
    hvac_kwh: Math.round(130 + Math.random() * 80),
    lighting_kwh: Math.round(50 + Math.random() * 30),
    solar_generation_kwh: Math.round(20 + Math.random() * 40),
    power_factor: parseFloat((0.91 + Math.random() * 0.08).toFixed(2)),
    temperature: parseFloat((23 + Math.random() * 4).toFixed(1)),
    humidity: parseFloat((48 + Math.random() * 10).toFixed(1))
  }));
}

function generateMockAlerts(facId) {
  return [
    {
      alert_id: 101,
      facility_id: "FAC-001",
      facility_name: "CyberTech IT Park",
      timestamp: new Date().toISOString(),
      severity: "Critical",
      alert_type: "High Energy Consumption",
      message: "Electricity consumption (485.2 kWh) is 28.5% above 7-day baseline.",
      recommendation: "Increase thermostat temperature by 2°C and shift non-essential operations to off-peak hours.",
      status: "Open"
    },
    {
      alert_id: 102,
      facility_id: "FAC-002",
      facility_name: "St. Jude General Hospital",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      severity: "High",
      alert_type: "HVAC Overload",
      message: "HVAC load accounts for 58.4% of total facility electricity consumption.",
      recommendation: "Inspect chiller condenser tubes and reset chilled water supply setpoint.",
      status: "In Progress"
    },
    {
      alert_id: 103,
      facility_id: "FAC-005",
      facility_name: "Apex Precision Factory",
      timestamp: new Date(Date.now() - 14400000).toISOString(),
      severity: "Medium",
      alert_type: "Power Spike",
      message: "Power Factor dropped to 0.86, below utility penalty threshold (0.90).",
      recommendation: "Engage automatic capacitor bank (APFC) panel to avoid surcharges.",
      status: "Open"
    },
    {
      alert_id: 104,
      facility_id: "FAC-003",
      facility_name: "Pacific Innovation University",
      timestamp: new Date(Date.now() - 28800000).toISOString(),
      severity: "Low",
      alert_type: "Abnormal Night Usage",
      message: "Abnormal off-hours electricity consumption detected (185 kWh at 02:00).",
      recommendation: "Enforce automated BAS lighting shutoff and ventilation setback.",
      status: "Resolved"
    }
  ];
}

function generateMockRecommendations(facId) {
  return [
    {
      id: "REC-001",
      facility_id: "FAC-001",
      facility_name: "CyberTech IT Park",
      title: "Optimize HVAC Thermostat & Reset Setpoint",
      priority: "High",
      estimated_savings_usd: 1240.50,
      estimated_savings_kwh: 8860.0,
      reason: "HVAC represents 47.7% of total energy usage over past 7 days, exceeding benchmark (45%).",
      suggested_action: "Increase chilled water temperature by 1.5°C and zone setpoint by 2°C during non-peak hours.",
      category: "HVAC"
    },
    {
      id: "REC-002",
      facility_id: "FAC-005",
      facility_name: "Apex Precision Factory",
      title: "Install APFC Capacitor Banks for Power Factor Correction",
      priority: "High",
      estimated_savings_usd: 850.00,
      estimated_savings_kwh: 6070.0,
      reason: "Average Power Factor is 0.86, causing reactive power penalty charges.",
      suggested_action: "Engage Automatic Power Factor Correction capacitor banks to achieve > 0.96 PF.",
      category: "Power Factor"
    },
    {
      id: "REC-003",
      facility_id: "FAC-003",
      facility_name: "Pacific Innovation University",
      title: "Automate After-Hours Lighting Shutdown",
      priority: "Medium",
      estimated_savings_usd: 480.20,
      estimated_savings_kwh: 3430.0,
      reason: "Significant lighting power remains active between 23:00 and 05:00.",
      suggested_action: "Install dual-technology occupancy sensors in academic corridors and automate schedule.",
      category: "Lighting"
    }
  ];
}

export default apiClient;
